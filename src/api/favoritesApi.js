// src/api/favoritesApi.js
import { httpGet, httpPost, httpDelete } from "./httpClient.js";

// ===== FAVORITES APIs =====

/**
 * Get list of my favorite restaurants
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of records
 * @param {number} params.offset - Offset for pagination
 * @returns {Promise} API response with favorites list
 * @example
 * Response: {
 *   items: [{
 *     id, user_id, restaurant_id, created_at,
 *     restaurant: {
 *       id, name, address,
 *       average_rating, review_count,
 *       main_image_url
 *     }
 *   }],
 *   pagination: { total, limit, offset }
 * }
 */
export async function getMyFavorites(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(`/api/v1/miniapp/favorites${q}`);
    return response?.data || { items: [], pagination: { total: 0 } };
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return { items: [], pagination: { total: 0 } };
  }
}

/**
 * Check if a restaurant is in favorites
 * @param {number|string} restaurantId - Restaurant ID
 * @returns {Promise} API response with favorite status
 * @example
 * Response: {
 *   restaurant_id: 1,
 *   is_favorite: true,
 *   favorite_id: 30
 * }
 */
export async function checkFavoriteStatus(restaurantId) {
  try {
    const response = await httpGet(
      `/api/v1/miniapp/favorites/restaurants/${restaurantId}/status`
    );
    return response?.data || { is_favorite: false, favorite_id: null };
  } catch (error) {
    console.error(
      `Error checking favorite status for restaurant ${restaurantId}:`,
      error
    );
    return { is_favorite: false, favorite_id: null };
  }
}

/**
 * Add restaurant to favorites
 * @param {number|string} restaurantId - Restaurant ID
 * @returns {Promise} API response with created favorite
 * @example
 * Response: {
 *   id: 30,
 *   user_id: 10,
 *   restaurant_id: 1,
 *   created_at: "2025-12-20 10:00:00"
 * }
 *
 * Side Effects:
 * - Update restaurant.favorite_count
 */
export async function addToFavorites(restaurantId) {
  try {
    const response = await httpPost(
      `/api/v1/miniapp/favorites/restaurants/${restaurantId}/add`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error adding restaurant ${restaurantId} to favorites:`,
      error
    );
    throw error;
  }
}

/**
 * Remove restaurant from favorites
 * @param {number|string} restaurantId - Restaurant ID
 * @returns {Promise} API response
 * @example
 * Response: { message: "Đã bỏ khỏi danh sách yêu thích" }
 *
 * Side Effects:
 * - Update restaurant.favorite_count
 */
export async function removeFromFavorites(restaurantId) {
  try {
    const response = await httpDelete(
      `/api/v1/miniapp/favorites/restaurants/${restaurantId}/remove`
    );
    return response;
  } catch (error) {
    console.error(
      `Error removing restaurant ${restaurantId} from favorites:`,
      error
    );
    throw error;
  }
}

/**
 * Toggle favorite status (add if not favorite, remove if favorite)
 * @param {number|string} restaurantId - Restaurant ID
 * @returns {Promise} Object with is_favorite status
 */
export async function toggleFavorite(restaurantId) {
  try {
    // Check current status
    const status = await checkFavoriteStatus(restaurantId);

    if (status.is_favorite) {
      // Remove from favorites
      await removeFromFavorites(restaurantId);
      return { is_favorite: false };
    } else {
      // Add to favorites
      await addToFavorites(restaurantId);
      return { is_favorite: true };
    }
  } catch (error) {
    console.error(
      `Error toggling favorite for restaurant ${restaurantId}:`,
      error
    );
    throw error;
  }
}
