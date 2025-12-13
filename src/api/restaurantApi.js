// src/api/restaurantApi.js
import { httpGet } from "./httpClient.js";
import { getMockRestaurantReviews } from "./mockReviewsApi.js";

// Flag to use mock data (change to false when real API is ready)
const USE_MOCK_API = true;

export function fetchRestaurants(params = {}) {
  const query = new URLSearchParams(params).toString();
  const q = query ? `?${query}` : "";
  return httpGet(`/restaurants${q}`);
}

export function fetchRestaurantDetail(id) {
  return httpGet(`/restaurants/${id}`);
}

export function fetchRestaurantReviews(restaurantId, params = {}) {
  // Use mock API in development
  if (USE_MOCK_API) {
    return getMockRestaurantReviews(restaurantId, params).then(response => response.data);
  }
  
  // Real API call
  const query = new URLSearchParams(params).toString();
  const q = query ? `?${query}` : "";
  return httpGet(`/restaurants/${restaurantId}/reviews${q}`);
}
