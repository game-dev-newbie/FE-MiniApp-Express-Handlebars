// src/views/historyView.js
// History booking view with review submission
import { renderTemplate } from "../core/templates.js";
import { restaurants, users } from "../data/mockData.js";
import { submitReview as submitReviewAPI } from "../api/reviewApi.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderHistory() {
  // Get bookings from localStorage
  const localBookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );

  // Process bookings with restaurant info
  const processedBookings = localBookings
    .map((booking) => {
      if (booking.restaurantId) {
        const restaurant = restaurants.find(
          (r) => r.id === booking.restaurantId
        );

        // Format table names properly
        let tableNames = "Chưa chọn bàn";
        if (booking.tables) {
          if (Array.isArray(booking.tables)) {
            // If tables is array of objects
            if (typeof booking.tables[0] === "object") {
              tableNames = booking.tables
                .map((t) => `${t.name} (${t.type || t.capacity + " người"})`)
                .join(", ");
            } else {
              // If tables is array of strings
              tableNames = booking.tables.join(", ");
            }
          } else if (typeof booking.tables === "string") {
            tableNames = booking.tables;
          }
        }

        return {
          id: booking.id,
          status: booking.status,
          restaurantId: booking.restaurantId,
          restaurant_name:
            restaurant?.name || booking.restaurantName || "Nhà hàng",
          table_name: tableNames,
          booking_time: formatBookingTime(
            new Date(booking.date + " " + booking.time)
          ),
          people: booking.people,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Filter history bookings (CHECKED_IN or COMPLETED)
  const historyBookings = processedBookings.filter(
    (b) => b.status === "CHECKED_IN" || b.status === "COMPLETED"
  );

  // Sort by booking time descending (newest first)
  historyBookings.sort((a, b) => {
    const dateA = new Date(a.booking_time);
    const dateB = new Date(b.booking_time);
    return dateB - dateA;
  });

  // Check if user has reviewed each booking
  const userReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  );
  historyBookings.forEach((booking) => {
    const review = userReviews.find((r) => r.bookingId === booking.id);
    if (review) {
      booking.hasReview = true;
      booking.userRating = review.rating;
    }
  });

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

  // View my reviews buttons
  const viewReviewsButtons = document.querySelectorAll(".btn-view-my-reviews");
  viewReviewsButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.hash = "#/my-reviews";
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

  // Prepare review data
  const reviewData = {
    restaurantId: currentReviewData.restaurantId,
    bookingId: currentReviewData.bookingId,
    rating: selectedRating,
    comment: comment,
  };

  try {
    // Call API to submit review
    const response = await submitReviewAPI(reviewData);

    console.log("Review API response:", response);

    // Save to localStorage for offline access
    const reviews = JSON.parse(
      localStorage.getItem("dinelink_user_reviews") || "[]"
    );

    const newReview = {
      id: response.data.id,
      userId: currentUser.id,
      bookingId: currentReviewData.bookingId,
      restaurantId: parseInt(currentReviewData.restaurantId),
      rating: selectedRating,
      comment: comment,
      createdAt: response.data.createdAt,
    };

    reviews.push(newReview);
    localStorage.setItem("dinelink_user_reviews", JSON.stringify(reviews));

    console.log("✅ Review saved:", newReview);
    console.log("📊 All reviews:", reviews);
    console.log(
      "🏪 Restaurant ID:",
      newReview.restaurantId,
      "Type:",
      typeof newReview.restaurantId
    );

    // Show success message
    alert(
      `Cảm ơn bạn đã đánh giá ${selectedRating} sao! Đánh giá của bạn đã được gửi thành công.`
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
    alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
  }
}
