// src/views/myReviewsView.js
import { renderTemplate } from "../core/templates.js";
import { getMyReviews, deleteReview as deleteReviewAPI } from "../api/reviewApi.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderMyReviews() {
  // Check authentication before showing reviews
  if (!authService.requireAuth("#/my-reviews")) {
    return;
  }

  // Show loading state
  appEl.innerHTML = `
    <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    // Fetch reviews from API
    const response = await getMyReviews({ limit: 50, offset: 0 });
    const userReviews = response?.items || [];

    console.log("📝 User reviews from API:", userReviews);

    // Base URL for images
    const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";

    // Enrich reviews with formatted data
    const enrichedReviews = userReviews.map((review) => {
      const stars = Array(review.rating).fill(0);
      const emptyStars = Array(5 - review.rating).fill(0);

      // Format restaurant image URL
      const restaurantImage = review.Restaurant?.main_image_url
        ? (review.Restaurant.main_image_url.startsWith('http')
            ? review.Restaurant.main_image_url
            : `${baseURL}${review.Restaurant.main_image_url}`)
        : "";

      return {
        ...review,
        restaurantName: review.Restaurant?.name || "Nhà hàng",
        restaurantImage: restaurantImage,
        restaurantId: review.restaurant_id,
        bookingTime: review.Booking?.booking_time ? formatDateTime(review.Booking.booking_time) : "",
        bookingStatus: review.Booking?.status_label || "",
        hasReply: !!review.reply_comment,
        replyComment: review.reply_comment || "",
        replyTime: review.reply_created_at ? formatDateTime(review.reply_created_at) : "",
        stars,
        emptyStars,
        createdAt: formatDateTime(review.created_at),
      };
    });

    const contentHtml = renderTemplate("myReviews", {
      reviews: enrichedReviews,
    });

    appEl.innerHTML = contentHtml;

    // Initialize event listeners
    initMyReviewsListeners();
  } catch (error) {
    console.error("Error loading reviews:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p style="color: #666; margin-bottom: 16px;">Không thể tải danh sách đánh giá. Vui lòng thử lại.</p>
        <button onclick="location.reload()" class="btn-primary">Tải lại</button>
      </div>
    `;
  }
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

// Delete review from API
async function deleteReview(reviewId) {
  try {
    // Delete via API
    await deleteReviewAPI(reviewId);

    console.log("✅ Review deleted successfully:", reviewId);

    // Dispatch event for other views to update
    window.dispatchEvent(
      new CustomEvent("reviewDeleted", {
        detail: { reviewId },
      })
    );

    // Reload page
    renderMyReviews();
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    alert("Không thể xóa đánh giá. Vui lòng thử lại.");
  }
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
