// src/utils/favoritesHelper.js
const FAVORITES_KEY = "dinelink_favorites";

/**
 * Get all favorite restaurant IDs from localStorage
 * @returns {number[]} Array of restaurant IDs
 */
export function getFavorites() {
  const favorites = localStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
}

/**
 * Check if a restaurant is favorited
 * @param {number} restaurantId 
 * @returns {boolean}
 */
export function isFavorite(restaurantId) {
  const favorites = getFavorites();
  return favorites.includes(Number(restaurantId));
}

/**
 * Add a restaurant to favorites
 * @param {number} restaurantId 
 * @returns {number[]} Updated favorites array
 */
export function addFavorite(restaurantId) {
  let favorites = getFavorites();
  const id = Number(restaurantId);
  
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
  
  return favorites;
}

/**
 * Remove a restaurant from favorites
 * @param {number} restaurantId 
 * @returns {number[]} Updated favorites array
 */
export function removeFavorite(restaurantId) {
  let favorites = getFavorites();
  const id = Number(restaurantId);
  
  favorites = favorites.filter(fav => fav !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  return favorites;
}

/**
 * Toggle favorite status for a restaurant
 * @param {number} restaurantId 
 * @returns {boolean} New favorite status (true if added, false if removed)
 */
export function toggleFavorite(restaurantId) {
  if (isFavorite(restaurantId)) {
    removeFavorite(restaurantId);
    return false;
  } else {
    addFavorite(restaurantId);
    return true;
  }
}

/**
 * Get all favorited restaurants data
 * @param {Array} allRestaurants - All restaurants array from mockData
 * @returns {Array} Array of favorited restaurant objects
 */
export function getFavoriteRestaurants(allRestaurants) {
  const favoriteIds = getFavorites();
  return allRestaurants.filter(restaurant => 
    favoriteIds.includes(restaurant.id)
  );
}
