// src/views/bookingView.js
import { renderTemplate } from "../core/templates.js";
import {
  bookings,
  restaurants,
  restaurantTables,
  users,
  reviews,
} from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderBooking() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "booking" });

  // Get bookings ONLY from localStorage (not from mockData)
  const localBookings = JSON.parse(localStorage.getItem("dinelink_bookings") || "[]");

  // Only use local bookings (user must pay to see bookings here)
  const allBookings = [...localBookings];

  // Process bookings with restaurant and table info
  const processedBookings = allBookings.map((booking) => {
    // For localStorage bookings, structure is different
    if (booking.restaurantId) {
      const restaurant = restaurants.find((r) => r.id === booking.restaurantId);
      return {
        id: booking.id,
        status: booking.status,
        restaurant_name: restaurant?.name || booking.restaurantName || "Nhà hàng",
        table_name: booking.tables?.join(", ") || "Chưa chọn bàn",
        booking_time: formatBookingTime(new Date(booking.date + " " + booking.time)),
        has_review: false,
        people: booking.people,
        paymentStatus: booking.paymentStatus,
      };
    }
    
    // For mockData bookings
    const restaurant = restaurants.find((r) => r.id === booking.restaurant_id);
    const table = restaurantTables.find((t) => t.id === booking.table_id);
    const hasReview = reviews.some((r) => r.booking_id === booking.id);

    return {
      ...booking,
      restaurant_name: restaurant?.name || "Nhà hàng",
      table_name: table?.name || "Chưa chọn bàn",
      booking_time: formatBookingTime(booking.booking_time),
      has_review: hasReview,
    };
  });

  const upcomingBookings = processedBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING"
  );

  const cancelledBookings = processedBookings.filter(
    (b) => b.status === "CANCELLED"
  );

  const contentHtml = renderTemplate("booking", {
    upcomingBookings,
    cancelledBookings,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initBookingEventListeners();
  
  // Listen for booking status updates from dashboard
  setupBookingStatusListener();
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
  const detailButtons = document.querySelectorAll('.btn-view-detail');
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
      const id = button.getAttribute("data-id");
      
      // Get booking info
      const bookings = JSON.parse(localStorage.getItem("dinelink_bookings") || "[]");
      const booking = bookings.find(b => b.id === id);
      
      if (booking) {
        // Redirect to restaurant detail page
        window.location.hash = `#/restaurant/${booking.restaurantId}`;
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
function setupBookingStatusListener() {
  window.addEventListener('bookingStatusUpdated', (event) => {
    const { bookingId, status } = event.detail;
    console.log(`Booking ${bookingId} status updated to ${status}`);
    
    // Show notification to user
    if (status === "CONFIRMED") {
      showNotification("Đơn đặt bàn đã được xác nhận!", "success");
    } else if (status === "CANCELLED") {
      showNotification("Đơn đặt bàn đã bị từ chối bởi nhà hàng", "error");
    }
    
    // Reload booking view to show updated status
    // Only reload if we're still on the booking page
    if (window.location.hash === "#/booking") {
      setTimeout(() => {
        renderBooking();
      }, 1000); // Delay 1s to show notification first
    }
  });
}

// Show notification to user
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `booking-notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease-out";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
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

function cancelBooking(bookingId) {
  const bookings = JSON.parse(localStorage.getItem("dinelink_bookings") || "[]");
  const updatedBookings = bookings.map(b => {
    if (b.id === bookingId) {
      return { 
        ...b, 
        status: "CANCELLED",
        cancelReason: "Khách hàng hủy đơn",
        refundStatus: "Đang xử lý hoàn tiền"
      };
    }
    return b;
  });
  localStorage.setItem("dinelink_bookings", JSON.stringify(updatedBookings));
  
  // Show notification
  showNotification("Đã hủy đặt bàn. Tiền sẽ được hoàn lại trong 3-5 ngày làm việc", "success");
  
  // Reload booking view
  setTimeout(() => {
    renderBooking();
  }, 1000);
}

// Modal functions removed - now using separate edit page at #/booking/edit/{id}
