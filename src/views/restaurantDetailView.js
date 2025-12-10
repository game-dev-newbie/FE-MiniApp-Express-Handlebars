// src/views/restaurantDetailView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";

const appEl = document.getElementById("app");

export function renderRestaurantDetail(restaurantId) {
  // Find restaurant by ID
  const restaurant = restaurants.find((r) => r.id === parseInt(restaurantId));

  if (!restaurant) {
    // Restaurant not found, redirect to home
    window.location.hash = "#/home";
    return;
  }

  const restaurantDetailContent = renderTemplate("restaurantDetail", {
    restaurant,
  });

  appEl.innerHTML = restaurantDetailContent;

  // Initialize event listeners
  initRestaurantDetailListeners(restaurant);
}

function initRestaurantDetailListeners(restaurant) {
  // Back button
  const btnBack = document.getElementById("btnBackFromDetail");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Bookmark button
  const btnBookmark = document.querySelector(".btn-bookmark-detail");
  if (btnBookmark) {
    btnBookmark.addEventListener("click", () => {
      btnBookmark.classList.toggle("active");
      // TODO: Add to favorites logic
    });
  }

  // Book restaurant button
  const btnBook = document.getElementById("btnBookRestaurant");
  if (btnBook) {
    btnBook.addEventListener("click", () => {
      const restaurantId = btnBook.getAttribute("data-id");
      window.location.hash = `#/booking/new/${restaurantId}`;
    });
  }
}
