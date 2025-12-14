// src/views/myReviewsView.js
import { renderTemplate } from "../core/templates.js";
import { users, restaurants } from "../data/mockData.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderMyReviews() {
  // Check authentication before showing reviews
  if (!authService.requireAuth("#/my-reviews")) {
    return;
  }

  // Get user reviews from localStorage
  const userReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  ).filter((r) => r.userId === currentUser.id);

  console.log("📝 User reviews:", userReviews);
  console.log("🍽️ Available restaurants:", restaurants);

  // Sort by date descending BEFORE enriching
  userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
  // Click on restaurant header (image or name) to view restaurant
  const reviewHeaders = document.querySelectorAll(".clickable-review-header");
  reviewHeaders.forEach((header) => {
    header.addEventListener("click", (e) => {
      // Prevent triggering if clicking on delete button
      if (e.target.closest(".btn-delete-review")) {
        return;
      }
      const reviewCard = header.closest(".review-card");
      const restaurantId = reviewCard.dataset.restaurantId;
      if (restaurantId) {
        window.location.hash = `#/restaurant/${restaurantId}`;
      }
    });
  });

  // Delete review buttons with mobile-optimized confirmation
  const deleteReviewBtns = document.querySelectorAll(".btn-delete-review");
  deleteReviewBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent triggering header click
      const reviewId = btn.dataset.reviewId;
      showDeleteConfirmation(reviewId);
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

// Show mobile-optimized delete confirmation
function showDeleteConfirmation(reviewId) {
  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "delete-modal-overlay";
  modal.innerHTML = `
    <div class="delete-modal">
      <h3 class="delete-modal-title">Xóa đánh giá</h3>
      <p class="delete-modal-message">Bạn có chắc chắn muốn xóa đánh giá này?</p>
      <div class="delete-modal-actions">
        <button class="btn-cancel-delete">Hủy</button>
        <button class="btn-confirm-delete">Xóa</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fade in animation
  setTimeout(() => modal.classList.add("show"), 10);

  // Cancel button
  const btnCancel = modal.querySelector(".btn-cancel-delete");
  btnCancel.addEventListener("click", () => {
    closeDeleteModal(modal);
  });

  // Confirm delete button
  const btnConfirm = modal.querySelector(".btn-confirm-delete");
  btnConfirm.addEventListener("click", () => {
    deleteReview(reviewId);
    closeDeleteModal(modal);
  });

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeDeleteModal(modal);
    }
  });
}

function closeDeleteModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => modal.remove(), 300);
}
