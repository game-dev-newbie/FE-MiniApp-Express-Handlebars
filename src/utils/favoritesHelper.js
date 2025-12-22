// src/utils/favoritesHelper.js
import { 
  addToFavorites as addToFavoritesAPI,
  removeFromFavorites as removeFromFavoritesAPI,
  checkFavoriteStatus 
} from "../api/favoritesApi.js";

// Local cache for favorites (updated from API)
let favoritesCache = [];
let cacheInitialized = false;

/**
 * Initialize favorites cache from API
 */
async function initializeFavoritesCache() {
  if (cacheInitialized) return;
  
  try {
    const { getMyFavorites } = await import("../api/favoritesApi.js");
    const response = await getMyFavorites();
    const favorites = response?.items || [];
    favoritesCache = favorites.map(fav => fav.restaurant_id);
    cacheInitialized = true;
    console.log("❤️ Favorites cache initialized:", favoritesCache);
  } catch (error) {
    console.warn("Could not initialize favorites cache:", error);
    favoritesCache = [];
    cacheInitialized = true;
  }
}

/**
 * Get all favorite restaurant IDs from cache
 * @returns {number[]} Array of restaurant IDs
 */
export function getFavorites() {
  return favoritesCache;
}

/**
 * Check if a restaurant is favorited via API
 * @param {number} restaurantId
 * @returns {Promise<boolean>}
 */
export async function isFavorite(restaurantId) {
  // Ensure cache is initialized
  await initializeFavoritesCache();
  return favoritesCache.includes(Number(restaurantId));
}

/**
 * Add a restaurant to favorites via API
 * @param {number} restaurantId
 * @returns {Promise<boolean>} Success status
 */
export async function addFavorite(restaurantId) {
  try {
    const id = Number(restaurantId);
    
    // Call API
    await addToFavoritesAPI(id);
    
    // Update cache
    if (!favoritesCache.includes(id)) {
      favoritesCache.push(id);
    }

    console.log("❤️ Added to favorites:", id);

    // Dispatch event for real-time updates
    window.dispatchEvent(
      new CustomEvent("favoriteToggled", {
        detail: { restaurantId: id, isFavorite: true },
      })
    );

    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
}

/**
 * Remove a restaurant from favorites via API
 * @param {number} restaurantId
 * @returns {Promise<boolean>} Success status
 */
export async function removeFavorite(restaurantId) {
  try {
    const id = Number(restaurantId);
    
    // Call API
    await removeFromFavoritesAPI(id);
    
    // Update cache
    favoritesCache = favoritesCache.filter((fav) => fav !== id);

    console.log("💔 Removed from favorites:", id);

    // Dispatch event for real-time updates
    window.dispatchEvent(
      new CustomEvent("favoriteToggled", {
        detail: { restaurantId: id, isFavorite: false },
      })
    );

    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
}

/**
 * Toggle favorite status for a restaurant via API
 * @param {number} restaurantId
 * @returns {Promise<boolean>} New favorite status (true if added, false if removed)
 */
export async function toggleFavorite(restaurantId) {
  try {
    const isFav = await isFavorite(restaurantId);
    
    if (isFav) {
      await removeFavorite(restaurantId);
      return false;
    } else {
      await addFavorite(restaurantId);
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

/**
 * Refresh favorites cache from API
 */
export async function refreshFavoritesCache() {
  cacheInitialized = false;
  await initializeFavoritesCache();
}
