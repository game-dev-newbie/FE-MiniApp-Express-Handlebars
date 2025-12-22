// src/api/reviewApi.js
import { httpGet, httpPost, httpDelete } from "./httpClient.js";

// Flag to use mock API (change to false when real API is ready)
const USE_MOCK_API = false;

// ===== REVIEW APIs =====

/**
 * Create review for a completed booking
 * @param {number|string} bookingId - Booking ID
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating 1-5 (required)
 * @param {string} reviewData.comment - Review comment max 500 chars (optional)
 * @returns {Promise} API response with created review
 * @example
 * Response: {
 *   id, booking_id, restaurant_id, user_id,
 *   rating, comment, status: "VISIBLE",
 *   created_at
 * }
 *
 * Side Effects:
 * - Update restaurant.average_rating & review_count
 * - Send notification to restaurant
 *
 * Error Cases:
 * - 400: Booking not COMPLETED
 * - 400: Already reviewed
 */
export async function createReview(bookingId, reviewData) {
  // Use mock API in development
  if (USE_MOCK_API) {
    return mockSubmitReview({ bookingId, ...reviewData });
  }

  try {
    const response = await httpPost(
      `/api/v1/miniapp/reviews/bookings/${bookingId}/comment`,
      reviewData
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating review for booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Get list of my reviews
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of records
 * @param {number} params.offset - Offset for pagination
 * @returns {Promise} API response with reviews list
 * @example
 * Response: {
 *   items: [{
 *     id, booking_id, restaurant_id,
 *     rating, comment, status,
 *     reply_comment, reply_created_at, created_at,
 *     restaurant: { id, name, main_image_url }
 *   }],
 *   pagination: { total, limit, offset }
 * }
 */
export async function getMyReviews(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(`/api/v1/miniapp/reviews/my-reviews${q}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    throw error;
  }
}

/**
 * Delete my review
 * @param {number|string} reviewId - Review ID
 * @returns {Promise} API response
 * @example
 * Response: { message: "Xoá review thành công" }
 *
 * Side Effects:
 * - Update restaurant.average_rating & review_count
 */
export async function deleteReview(reviewId) {
  try {
    const response = await httpDelete(`/api/v1/miniapp/reviews/${reviewId}`);
    return response;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
}

// ===== LEGACY FUNCTION (deprecated) =====

/**
 * @deprecated Use createReview instead
 */
export async function submitReview(reviewData) {
  // Use mock API in development
  if (USE_MOCK_API) {
    return mockSubmitReview(reviewData);
  }

  // Real API call
  return httpPost(`/reviews`, reviewData);
}

/**
 * Mock API for submitting review
 */
function mockSubmitReview(reviewData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const review = {
        id: Date.now().toString(),
        ...reviewData,
        userId: 1, // Current user ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("✅ Mock API: Review submitted successfully", review);

      resolve({
        success: true,
        data: review,
        message: "Đánh giá của bạn đã được gửi thành công!",
      });
    }, 500); // Simulate network delay
  });
}
