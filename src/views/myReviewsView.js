// src/views/myReviewsView.js
import { renderTemplate } from "../core/templates.js";
import { users, restaurants } from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderMyReviews() {
  // Get user reviews from localStorage
  const userReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  ).filter((r) => r.userId === currentUser.id);

  console.log("📝 User reviews:", userReviews);
  console.log("🍽️ Available restaurants:", restaurants);

  // Enrich reviews with restaurant data
  const enrichedReviews = userReviews.map((review) => {
    const restaurant = restaurants.find(
      (r) => r.id === parseInt(review.restaurantId)
    );
    console.log(
      `🔍 Looking for restaurant ID: ${review.restaurantId}, Found:`,
      restaurant
    );

    const stars = Array(review.rating).fill(0);
    const emptyStars = Array(5 - review.rating).fill(0);

    return {
      ...review,
      restaurantName: restaurant?.name || "Nhà hàng",
      restaurantImage: restaurant?.image || "",
      stars,
      emptyStars,
      createdAt: formatDateTime(review.createdAt),
    };
  });

  // Sort by date descending
  enrichedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const contentHtml = renderTemplate("myReviews", {
    reviews: enrichedReviews,
  });

  appEl.innerHTML = contentHtml;

  // Initialize event listeners
  initMyReviewsListeners();
}

// Format date and time
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} lúc ${timeStr}`;
}

function initMyReviewsListeners() {
  // View booking detail buttons
  const viewDetailBtns = document.querySelectorAll(".btn-view-booking-detail");
  viewDetailBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bookingId = btn.dataset.bookingId;
      if (bookingId) {
        window.location.hash = `#/booking/detail/${bookingId}`;
      }
    });
  });

  // View restaurant buttons
  const viewRestaurantBtns = document.querySelectorAll(".btn-view-restaurant");
  viewRestaurantBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const restaurantId = btn.dataset.restaurantId;
      window.location.hash = `#/restaurant/${restaurantId}`;
    });
  });

  // Delete review buttons
  const deleteReviewBtns = document.querySelectorAll(".btn-delete-review");
  deleteReviewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reviewId = btn.dataset.reviewId;

      if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
        deleteReview(reviewId);
      }
    });
  });
}

// Delete review from localStorage
function deleteReview(reviewId) {
  const userReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  );

  const review = userReviews.find((r) => r.id === reviewId);
  const restaurantId = review?.restaurantId;

  const filteredReviews = userReviews.filter((r) => r.id !== reviewId);

  localStorage.setItem(
    "dinelink_user_reviews",
    JSON.stringify(filteredReviews)
  );

  // Dispatch event for other views to update
  window.dispatchEvent(
    new CustomEvent("reviewDeleted", {
      detail: { reviewId, restaurantId },
    })
  );

  // Reload page
  renderMyReviews();
}
