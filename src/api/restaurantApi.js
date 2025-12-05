// src/api/restaurantApi.js
import { httpGet } from "./httpClient.js";

export function fetchRestaurants(params = {}) {
  const query = new URLSearchParams(params).toString();
  const q = query ? `?${query}` : "";
  return httpGet(`/restaurants${q}`);
}

export function fetchRestaurantDetail(id) {
  return httpGet(`/restaurants/${id}`);
}
