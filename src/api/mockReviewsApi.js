// src/api/mockReviewsApi.js
// Mock API for restaurant reviews - to be replaced with real API
import { reviews, users } from "../data/mockData.js";

export function getMockRestaurantReviews(restaurantId, params = {}) {
  const { sort = 'created_at', order = 'desc', limit = 20 } = params;
  
  // Filter reviews by restaurant ID
  let restaurantReviews = reviews
    .filter((r) => r.restaurant_id === parseInt(restaurantId))
    .map((review) => {
      const user = users.find((u) => u.id === review.user_id);
      return {
        id: review.id,
        userName: user?.display_name || "Khách hàng",
        userAvatar: user?.avatar_url || "https://i.pravatar.cc/150?img=3",
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      };
    });

  // Sort by created_at (newest first)
  if (sort === 'created_at') {
    restaurantReviews.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // Limit results
  if (limit) {
    restaurantReviews = restaurantReviews.slice(0, limit);
  }

  // Simulate API response structure
  return Promise.resolve({
    data: restaurantReviews,
    total: restaurantReviews.length,
    page: 1,
    limit: limit
  });
}
