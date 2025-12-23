// src/views/bookingView.js
import { renderTemplate } from "../core/templates.js";
import { getMyBookings, cancelBooking as cancelBookingAPI } from "../api/bookingApi.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderBooking() {
  // Check authentication before showing bookings
  if (!authService.requireAuth("#/booking")) {
    return;
  }

  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "booking" });

  // Show skeleton loading (instead of spinner)
  appEl.innerHTML = `
    <main class="main-content booking-page">
      <div class="page-header booking-header">
        <div class="header-spacer"></div>
        <h1 class="page-title">Lịch đặt bàn</h1>
        <div class="header-spacer"></div>
      </div>
      
      <div class="booking-tabs">
        <button class="booking-tab active">Sắp tới</button>
        <button class="booking-tab">Đã hủy</button>
      </div>
      
      <div class="skeleton-list">
        ${Array(3).fill(`
          <div class="booking-card-skeleton">
            <div class="skeleton skeleton-badge"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton-actions">
              <div class="skeleton skeleton-button"></div>
              <div class="skeleton skeleton-button"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  ` + bottomNavHtml;

  try {
    // Fetch upcoming and cancelled bookings separately with correct category
    const [upcomingResponse, cancelledResponse] = await Promise.all([
      getMyBookings({ category: 'upcoming', limit: 50 }),
      getMyBookings({ category: 'cancelled', limit: 50 })
    ]);

    console.log("📊 Upcoming bookings response:", upcomingResponse);
    console.log("📊 Cancelled bookings response:", cancelledResponse);

    // Process bookings
    const upcomingBookings = processBookings(upcomingResponse?.items || []);
    const cancelledBookings = processBookings(cancelledResponse?.items || []);

    const contentHtml = renderTemplate("booking", {
      upcomingBookings,
      historyBookings: [],
      cancelledBookings,
    });

    appEl.innerHTML = contentHtml + bottomNavHtml;

    // Initialize event listeners
    initBookingEventListeners();

    // Listen for booking status updates
    setupBookingStatusListener();
  } catch (error) {
    console.error("Error loading bookings:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p>Không thể tải danh sách đặt bàn. Vui lòng thử lại.</p>
        <button onclick="location.reload()" class="btn-primary">Tải lại</button>
      </div>
    ` + bottomNavHtml;
  }
}

function initBookingEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll(".booking-tab");
  const tabContents = document.querySelectorAll(".booking-tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Update active tab content
      tabContents.forEach((content) => content.classList.remove("active"));
      const targetContent = document.getElementById(`${tabName}-tab`);
      if (targetContent) {
        targetContent.classList.add("active");
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Cancel booking buttons
  const cancelButtons = document.querySelectorAll(".btn-cancel");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const bookingId = button.getAttribute("data-id");
      showCancelPopup(bookingId);
    });
  });

  // View detail buttons - redirect to detail page
  const detailButtons = document.querySelectorAll(".btn-view-detail");
  detailButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const bookingId = button.getAttribute("data-id");
      // Redirect to booking detail page
      window.location.hash = `#/booking/detail/${bookingId}`;
    });
  });

  // Rebook buttons
  const rebookButtons = document.querySelectorAll(".btn-rebook");
  rebookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const restaurantId = button.getAttribute("data-restaurant-id");

      if (restaurantId) {
        // Redirect to booking form for this restaurant
        window.location.hash = `#/booking/new/${restaurantId}`;
      }
    });
  });

  // Bottom navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      window.location.hash = `#/${page === "home" ? "" : page}`;
    });
  });
}

// Helper function to process bookings from API response
function processBookings(bookings) {
  return bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    restaurantId: booking.restaurant_id,
    restaurant_name: booking.Restaurant?.name || "Nhà hàng",
    table_name: booking.RestaurantTable?.name || "Chưa chọn bàn",
    booking_time: formatBookingTime(new Date(booking.booking_time)),
    has_review: booking.has_review || false,
    people: booking.people_count,
    paymentStatus: booking.payment_status,
  }));
}

// Format booking time
function formatBookingTime(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("vi-VN", options);
}

// Setup listener for booking status updates from dashboard
let bookingStatusUpdateHandler = null;
let bookingCheckedInHandler = null;

function setupBookingStatusListener() {
  // Remove old listeners if they exist
  if (bookingStatusUpdateHandler) {
    window.removeEventListener(
      "bookingStatusUpdated",
      bookingStatusUpdateHandler
    );
  }
  if (bookingCheckedInHandler) {
    window.removeEventListener("bookingCheckedIn", bookingCheckedInHandler);
  }

  // Create new handlers
  bookingStatusUpdateHandler = (event) => {
    const { bookingId, status } = event.detail;
    console.log(`Booking ${bookingId} status updated to ${status}`);

    // Reload booking view to show updated status
    // Only reload if we're still on the booking page
    if (window.location.hash === "#/booking") {
      setTimeout(() => {
        renderBooking();
      }, 500);
    }
  };

  bookingCheckedInHandler = (event) => {
    const { bookingId, status } = event.detail;
    console.log(`Booking ${bookingId} checked in - moving to history page`);

    // Reload booking view to remove checked-in booking
    // Only reload if we're still on the booking page
    if (window.location.hash === "#/booking") {
      setTimeout(() => {
        renderBooking();
      }, 500);
    }
  };

  // Add new listeners
  window.addEventListener("bookingStatusUpdated", bookingStatusUpdateHandler);
  window.addEventListener("bookingCheckedIn", bookingCheckedInHandler);

  // Cleanup on hash change
  const cleanupListener = () => {
    window.removeEventListener(
      "bookingStatusUpdated",
      bookingStatusUpdateHandler
    );
    window.removeEventListener("bookingCheckedIn", bookingCheckedInHandler);
    window.removeEventListener("hashchange", cleanupListener);
  };

  window.addEventListener("hashchange", cleanupListener, { once: true });
}

// Show cancel booking popup
let bookingToCancel = null;

function showCancelPopup(bookingId) {
  bookingToCancel = bookingId;
  const popup = document.getElementById("cancelBookingPopup");
  if (popup) {
    popup.style.display = "flex";

    // Setup popup buttons
    const btnCancel = popup.querySelector(".btn-popup-cancel");
    const btnConfirm = popup.querySelector(".btn-popup-confirm");
    const overlay = popup.querySelector(".booking-popup-overlay");

    // Close popup
    const closePopup = () => {
      popup.style.display = "none";
      bookingToCancel = null;
    };

    btnCancel.onclick = closePopup;
    overlay.onclick = closePopup;

    // Confirm cancel
    btnConfirm.onclick = () => {
      cancelBooking(bookingToCancel);
      closePopup();
    };
  }
}

async function cancelBooking(bookingId) {
  try {
    console.log(`🚫 Cancelling booking ID: ${bookingId}`);
    
    // Call API to cancel booking
    const result = await cancelBookingAPI(bookingId);
    
    console.log("✅ Booking cancelled successfully:", result);
    
    // Show success notification
    showNotification("Đã hủy đặt bàn thành công", "success");
    
    // Reload booking view after short delay
    setTimeout(() => {
      renderBooking();
    }, 1000);
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    
    // Show error notification
    const errorMessage = error.message || "Không thể hủy đặt bàn. Vui lòng thử lại.";
    showNotification(errorMessage, "error");
  }
}

// Helper function to show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
