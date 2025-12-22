// src/api/restaurantApi.js
import { httpGet } from "./httpClient.js";
import { getMockRestaurantReviews } from "./mockReviewsApi.js";

// Flag to use mock data (change to false when real API is ready)
const USE_MOCK_API = false;

/**
 * Search restaurants with filters
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search keyword
 * @param {number} params.limit - Default: 20
 * @param {number} params.offset - Default: 0
 * @returns {Promise} API response with search results and pagination
 * @example
 * Response: { items: [...], pagination: { total, limit, offset, page, totalPages } }
 */
export async function searchRestaurants(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(`/api/v1/miniapp/restaurants/search${q}`);
    return response.data; // { items: [...], pagination: {...} }
  } catch (error) {
    console.error("Error searching restaurants:", error);
    throw error;
  }
}

/**
 * Get restaurant detail by ID
 * @param {number|string} id - Restaurant ID
 * @returns {Promise} API response with restaurant details
 * @example
 * Response: {
 *   id, name, address, phone, description, tags,
 *   require_deposit, default_deposit_amount,
 *   average_rating, review_count, favorite_count,
 *   main_image_url, open_time, close_time, is_active,
 *   images: [{ id, type, file_path, caption, is_primary }]
 * }
 */
export async function fetchRestaurantDetail(id) {
  try {
    const response = await httpGet(`/api/v1/miniapp/restaurants/${id}`);
    return response.data; // Restaurant object with images array
  } catch (error) {
    console.error(`Error fetching restaurant detail for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get restaurant reviews (requires authentication)
 * @param {number|string} restaurantId - Restaurant ID
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of records
 * @param {number} params.offset - Offset for pagination
 * @returns {Promise} API response with reviews and pagination
 * @example
 * Response: {
 *   items: [{ id, booking_id, rating, comment, status, reply_comment, created_at,
 *             user: { id, display_name, avatar_url } }],
 *   pagination: { total, limit, offset }
 * }
 */
export async function fetchRestaurantReviews(restaurantId, params = {}) {
  // Use mock API in development
  if (USE_MOCK_API) {
    return getMockRestaurantReviews(restaurantId, params).then(
      (response) => response.data
    );
  }

  // Real API call (requires authentication)
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(
      `/api/v1/miniapp/restaurants/${restaurantId}/reviews${q}`
    );
    return response.data; // { items: [...], pagination: {...} }
  } catch (error) {
    console.error(
      `Error fetching reviews for restaurant ${restaurantId}:`,
      error
    );
    throw error;
  }
}

// ===== LEGACY FUNCTIONS (deprecated) =====

/**
 * @deprecated Use searchRestaurants instead
 */
export function fetchRestaurants(params = {}) {
  return searchRestaurants(params);
}

// ===== HOME PAGE APIs =====

/**
 * Get top rated restaurants for home page
 * @returns {Promise} API response with top rated restaurants
 */
export async function fetchTopRatedRestaurants() {
  try {
    const response = await httpGet("/api/v1/miniapp/restaurants/home/top-rated");
    console.log("🔍 fetchTopRatedRestaurants RAW response:", response);
    
    // httpClient returns the whole API response {success, message, data}
    if (response && response.data) {
      console.log("✅ Using response.data.data structure");
      return response.data; // {items: [], total: 0}
    } else if (response && response.items) {
      console.log("✅ Using response.items structure");
      return response; // {items: [], total: 0}
    } else {
      console.warn("⚠️ Unexpected response structure:", response);
      return { items: [], total: 0 };
    }
  } catch (error) {
    console.error("❌ Error fetching top rated restaurants:", error);
    return { items: [], total: 0 };
  }
}

/**
 * Get top favorite restaurants for home page
 * @returns {Promise} API response with top favorite restaurants
 */
export async function fetchTopFavoriteRestaurants() {
  try {
    const response = await httpGet(
      "/api/v1/miniapp/restaurants/home/top-favorites"
    );
    return response?.data || { items: [], total: 0 };
  } catch (error) {
    console.error("Error fetching top favorite restaurants:", error);
    return { items: [], total: 0 };
  }
}

/**
 * Get top restaurants by tag for home page
 * @param {string} tag - Tag name (e.g., "lunch", "dinner", "romantic")
 * @returns {Promise} API response with top restaurants by tag
 */
export async function fetchTopRestaurantsByTag(tag) {
  try {
    const response = await httpGet(
      `/api/v1/miniapp/restaurants/home/top-by-tag?tag=${encodeURIComponent(tag)}`
    );
    return response?.data || { items: [], total: 0 };
  } catch (error) {
    console.error(`Error fetching top restaurants by tag "${tag}":`, error);
    return { items: [], total: 0 };
  }
}
