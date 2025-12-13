// src/api/reviewApi.js
import { httpPost } from "./httpClient.js";

// Flag to use mock API (change to false when real API is ready)
const USE_MOCK_API = true;

/**
 * Submit a new review for a restaurant
 * @param {Object} reviewData - { restaurantId, bookingId, rating, comment }
 * @returns {Promise} API response with created review
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
