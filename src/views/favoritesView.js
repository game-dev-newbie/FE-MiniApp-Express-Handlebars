// src/views/favoritesView.js
import { renderTemplate } from "../core/templates.js";
import { getUserFavoriteIds, restaurants, users } from "../data/mockData.js";
import {
  toggleFavorite,
  isFavorite,
  getFavoriteRestaurants,
} from "../utils/favoritesHelper.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderFavorites() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  // Get user's favorite restaurants from localStorage
  const favoriteRestaurants = getFavoriteRestaurants(restaurants);

  const contentHtml = renderTemplate("favorites", {
    favorites: favoriteRestaurants,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initFavoritesEventListeners();
}

function initFavoritesEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      // Check referrer from sessionStorage
      const referrer = sessionStorage.getItem("favoritesReferrer");
      sessionStorage.removeItem("favoritesReferrer");

      if (referrer === "home") {
        window.location.hash = "#/home";
      } else {
        window.location.hash = "#/profile";
      }
    });
  }

  // Bookmark buttons (remove from favorites)
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
  bookmarkButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = button.closest(".grid-card");
      const restaurantId = button.getAttribute("data-id");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      // Remove from favorites
      if (restaurantId) {
        toggleFavorite(restaurantId);
      }

      // Remove card with animation
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";

      setTimeout(() => {
        card.remove();

        // Check if empty
        const grid = document.querySelector(".restaurant-grid");
        if (grid && grid.children.length === 0) {
          location.reload();
        }
      }, 300);
    });
  });

  // Book buttons - navigate to booking form
  const bookButtons = document.querySelectorAll(".btn-book-small");
  bookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      window.location.hash = `#/booking/new/${id}`;
    });
  });

  // Grid card click - navigate to detail page
  const gridCards = document.querySelectorAll(".grid-card");
  gridCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".bookmark-btn") ||
        e.target.closest(".btn-book-small")
      ) {
        return;
      }

      const id = card.getAttribute("data-id");
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Bottom navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      window.location.hash = `#/${page === "home" ? "" : page}`;
    });
  });
}
