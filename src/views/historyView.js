// src/views/historyView.js
// History booking view with review submission
import { renderTemplate } from "../core/templates.js";
import { createReview } from "../api/reviewApi.js";
import { getMyBookings } from "../api/bookingApi.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");
// Note: currentUser should come from authService, not mock data
const currentUser = authService.getUser() || { id: 1 };

export async function renderHistory() {
  // Check authentication before showing history
  if (!authService.requireAuth("#/history")) {
    return;
  }

  // Fetch history bookings from API
  console.log("📚 Fetching history bookings from API...");
  
  const response = await getMyBookings({ category: 'history', limit: 50 });
  const apiBookings = response?.items || [];

    console.log("📦 History bookings response:", apiBookings);

    // Process bookings to match template expectations
    const processedBookings = apiBookings.map((booking) => {
      // Check if booking has review (from Review object in API response)
      const hasReview = !!booking.Review;
      const userRating = booking.Review?.rating || 0;
      const reviewComment = booking.Review?.comment || "";

      return {
        id: booking.id,
        status: booking.status,
        restaurantId: booking.restaurant_id,
        restaurant_name: booking.Restaurant?.name || "Nhà hàng",
        table_name: booking.RestaurantTable?.name || "Chưa chọn bàn",
        booking_time: formatBookingTime(new Date(booking.booking_time)),
        people: booking.people_count,
        // Review fields
        hasReview: hasReview,
        userRating: userRating,
        reviewComment: reviewComment,
        reviewId: booking.Review?.id || null,
      };
    });

  // Sort by booking time descending (newest first)
  processedBookings.sort((a, b) => {
    const dateA = new Date(a.booking_time);
    const dateB = new Date(b.booking_time);
    return dateB - dateA;
  });

  const historyBookings = processedBookings;

  console.log("📊 Processed history bookings:", historyBookings);

  const contentHtml = renderTemplate("history", {
    historyBookings,
  });

  appEl.innerHTML = contentHtml;

  // Initialize event listeners
  initHistoryEventListeners();

  // Listen for check-in updates
  setupCheckInListener();
}

function initHistoryEventListeners() {
  // View booking detail buttons
  const viewDetailButtons = document.querySelectorAll(
    ".btn-view-booking-detail"
  );
  viewDetailButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const bookingId = button.getAttribute("data-booking-id");

      if (bookingId) {
        // Store that we're coming from history
        sessionStorage.setItem("bookingDetailReferrer", "history");
        window.location.hash = `#/booking/detail/${bookingId}`;
      }
    });
  });

  // Delete review buttons
  const deleteReviewButtons = document.querySelectorAll(".btn-delete-review");
  deleteReviewButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      const reviewId = button.getAttribute("data-review-id");
      const bookingId = button.getAttribute("data-booking-id");

      if (!reviewId) {
        console.error("No review ID found");
        return;
      }

      // Show mobile confirmation popup
      const confirmed = await showMobileConfirmation(
        "Bạn có chắc muốn xóa đánh giá này? Sau khi xóa, bạn có thể viết đánh giá mới."
      );

      if (!confirmed) {
        return;
      }

      try {
        console.log(`🗑️ Deleting review ID: ${reviewId}`);
        
        // Import deleteReview from reviewApi
        const { deleteReview } = await import("../api/reviewApi.js");
        
        await deleteReview(reviewId);
        
        console.log("✅ Review deleted successfully");
        
        // Show success notification
        showMobileNotification(
          "Đã xóa đánh giá thành công. Bạn có thể viết đánh giá mới.",
          "success"
        );

        // Reload history to update UI
        setTimeout(() => {
          renderHistory();
        }, 1000);
      } catch (error) {
        console.error("❌ Error deleting review:", error);
        showMobileNotification(
          error.message || "Không thể xóa đánh giá. Vui lòng thử lại!",
          "error"
        );
      }
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
        window.location.hash = `#/restaurant/${restaurantId}/booking`;
      }
    });
  });

  // Write review buttons
  const writeReviewButtons = document.querySelectorAll(".btn-write-review");
  writeReviewButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const bookingId = button.getAttribute("data-booking-id");
      const restaurantId = button.getAttribute("data-restaurant-id");
      const restaurantName = button.getAttribute("data-restaurant-name");
      showReviewPopup(bookingId, restaurantId, restaurantName);
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

// Setup listener for check-in updates from dashboard
function setupCheckInListener() {
  window.addEventListener("bookingCheckedIn", (event) => {
    const { bookingId } = event.detail;
    console.log(`Booking ${bookingId} checked in`);

    // Reload history view if we're on the history page
    if (window.location.hash === "#/history") {
      setTimeout(() => {
        renderHistory();
      }, 500);
    }
  });

  // Listen for review deletions to show review button again
  window.addEventListener("reviewDeleted", (event) => {
    console.log("Review deleted, reloading history view");

    if (window.location.hash === "#/history") {
      setTimeout(() => {
        renderHistory();
      }, 300);
    }
  });
}

// Review popup functions
let currentReviewData = { bookingId: null, restaurantId: null };
let selectedRating = 0;

function showReviewPopup(bookingId, restaurantId, restaurantName) {
  currentReviewData = { bookingId, restaurantId };
  selectedRating = 0;

  const popup = document.getElementById("writeReviewPopup");
  const restaurantNameEl = document.getElementById("reviewRestaurantName");
  const reviewComment = document.getElementById("reviewComment");

  if (popup && restaurantNameEl) {
    restaurantNameEl.textContent = `Đánh giá ${restaurantName}`;
    reviewComment.value = "";
    popup.style.display = "flex";

    // Setup star rating
    setupStarRating();

    // Setup popup buttons
    const btnClose = document.getElementById("btnCloseReviewPopup");
    const btnCancel = document.getElementById("btnCancelReview");
    const btnSubmit = document.getElementById("btnSubmitReview");
    const overlay = popup.querySelector(".booking-popup-overlay");

    // Close popup
    const closePopup = () => {
      popup.style.display = "none";
      selectedRating = 0;
      currentReviewData = { bookingId: null, restaurantId: null };
    };

    btnClose.onclick = closePopup;
    btnCancel.onclick = closePopup;
    overlay.onclick = closePopup;

    // Submit review - IMPORTANT: Submit first, then close
    btnSubmit.onclick = async () => {
      await submitReview();
      // Only close if submit was successful (submitReview will handle errors)
      if (selectedRating > 0) {
        closePopup();
      }
    };
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll("#starRating .star");

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      selectedRating = index + 1;
      console.log("⭐ Star clicked, rating set to:", selectedRating);
      updateStarDisplay();
    });

    star.addEventListener("mouseenter", () => {
      highlightStars(index + 1);
    });
  });

  const starRating = document.getElementById("starRating");
  starRating.addEventListener("mouseleave", () => {
    updateStarDisplay();
  });
}

function highlightStars(count) {
  const stars = document.querySelectorAll("#starRating .star");
  stars.forEach((star, index) => {
    if (index < count) {
      star.classList.add("hover");
    } else {
      star.classList.remove("hover");
    }
  });
}

function updateStarDisplay() {
  const stars = document.querySelectorAll("#starRating .star");
  stars.forEach((star, index) => {
    star.classList.remove("hover");
    if (index < selectedRating) {
      star.classList.add("selected");
    } else {
      star.classList.remove("selected");
    }
  });
}

async function submitReview() {
  console.log("📝 Starting submitReview...");
  console.log("⭐ Selected Rating:", selectedRating);
  console.log("📊 Current Review Data:", currentReviewData);

  if (selectedRating === 0) {
    alert("Vui lòng chọn số sao đánh giá!");
    return;
  }

  if (!currentReviewData.bookingId || !currentReviewData.restaurantId) {
    console.error("❌ Missing booking or restaurant data!", currentReviewData);
    alert("Đã có lỗi: Không tìm thấy thông tin đặt bàn!");
    return;
  }

  // Check if already reviewed this booking
  const existingReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  );
  const alreadyReviewed = existingReviews.find(
    (r) =>
      r.bookingId === currentReviewData.bookingId && r.userId === currentUser.id
  );

  if (alreadyReviewed) {
    alert("Bạn đã đánh giá đơn đặt bàn này rồi!");
    return;
  }

  const comment = document.getElementById("reviewComment").value.trim();

  // Prepare review data (API only needs rating and comment)
  const reviewData = {
    rating: selectedRating,
    comment: comment || "", // Optional
  };

  try {
    console.log(`📤 Calling createReview API for booking ${currentReviewData.bookingId}...`);
    console.log("📦 Review data:", reviewData);
    
    // Call API to submit review
    // createReview(bookingId, { rating, comment })
    const response = await createReview(currentReviewData.bookingId, reviewData);

    console.log("✅ Review API response:", response);

    // Mark booking as reviewed (update has_review flag)
    const newReview = {
      id: response.id,
      userId: currentUser.id,
      bookingId: currentReviewData.bookingId,
      restaurantId: response.restaurant_id,
      rating: response.rating,
      comment: response.comment,
      status: response.status,
      createdAt: response.created_at,
    };

    console.log("✅ Review created successfully:", newReview);

    // Show mobile-style success popup with API message
    showMobileNotification(
      "Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được gửi thành công.",
      "success"
    );

    // Dispatch event to notify other views
    window.dispatchEvent(
      new CustomEvent("reviewSubmitted", {
        detail: {
          restaurantId: parseInt(currentReviewData.restaurantId),
          review: newReview,
        },
      })
    );

    // Reload history view to update button state
    setTimeout(() => {
      renderHistory();
    }, 300);
  } catch (error) {
    console.error("Error submitting review:", error);
    showMobileNotification(
      error.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!",
      "error"
    );
  }
}

// Helper function to show mobile-style notification popup
function showMobileNotification(message, type = "success") {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `;

  // Create popup
  const popup = document.createElement("div");
  popup.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 320px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease-out;
  `;

  // Icon
  const icon = document.createElement("div");
  icon.style.cssText = `
    width: 60px;
    height: 60px;
    margin: 0 auto 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    background: ${type === "success" ? "#d1fae5" : "#fee2e2"};
    color: ${type === "success" ? "#10b981" : "#ef4444"};
  `;
  icon.textContent = type === "success" ? "✓" : "✗";

  // Message
  const messageEl = document.createElement("p");
  messageEl.style.cssText = `
    margin: 0 0 20px;
    font-size: 16px;
    line-height: 1.5;
    color: #374151;
  `;
  messageEl.textContent = message;

  // OK button
  const button = document.createElement("button");
  button.textContent = "OK";
  button.style.cssText = `
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
  `;

  button.onclick = () => {
    overlay.style.animation = "fadeOut 0.2s ease-out";
    setTimeout(() => document.body.removeChild(overlay), 200);
  };

  popup.appendChild(icon);
  popup.appendChild(messageEl);
  popup.appendChild(button);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Add CSS animations
  if (!document.getElementById("mobile-notification-styles")) {
    const style = document.createElement("style");
    style.id = "mobile-notification-styles";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Helper function to show mobile-style confirmation popup (returns Promise<boolean>)
function showMobileConfirmation(message) {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      animation: fadeIn 0.2s ease-out;
    `;

    // Create popup
    const popup = document.createElement("div");
    popup.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 320px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      animation: slideUp 0.3s ease-out;
    `;

    // Message
    const messageEl = document.createElement("p");
    messageEl.style.cssText = `
      margin: 0 0 24px;
      font-size: 16px;
      line-height: 1.5;
      color: #374151;
    `;
    messageEl.textContent = message;

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
      flex: 1;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    `;

    // OK button
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.cssText = `
      flex: 1;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    `;

    const closePopup = (result) => {
      overlay.style.animation = "fadeOut 0.2s ease-out";
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(result);
      }, 200);
    };

    cancelButton.onclick = () => closePopup(false);
    okButton.onclick = () => closePopup(true);
    overlay.onclick = (e) => {
      if (e.target === overlay) closePopup(false);
    };

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(okButton);
    popup.appendChild(messageEl);
    popup.appendChild(buttonsContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  });
}
