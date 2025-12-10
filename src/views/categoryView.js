// src/views/categoryView.js
import { renderTemplate } from "../core/templates.js";
import {
  getRestaurantsByCategory,
  searchRestaurants,
} from "../data/mockData.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";

const appEl = document.getElementById("app");

// Category name mapping
const categoryNames = {
  buffet: "Buffet",
  lau: "Lẩu",
  nuong: "Nướng",
  "hai-san": "Hải Sản",
  "mon-nhat": "Món Nhật",
  "mon-viet": "Món Việt",
  "mon-han": "Món Hàn",
  "mon-chay": "Món Chay",
  "chau-a": "Châu Á",
  "chau-au": "Châu Âu",
};

export async function renderCategory(category) {
  const categoryName = categoryNames[category] || category;
  const restaurants = getRestaurantsByCategory(category);

  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  const contentHtml = renderTemplate("categoryList", {
    categoryName,
    restaurants,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initCategoryEventListeners(category);
}

function initCategoryEventListeners(category) {
  // Back button
  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.location.hash = "#/";
    });
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const results = searchRestaurants(searchTerm);
        const filteredResults = results.filter((r) => {
          const searchText = `${r.search_tags} ${r.search_name}`.toLowerCase();
          return searchText.includes(category.replace("-", " "));
        });
        updateRestaurantGrid(filteredResults);
      }, 300)
    );
  }

  // Filter button
  const filterBtn = document.getElementById("filterBtn");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      alert("Bộ lọc nâng cao đang được phát triển!");
    });
  }

  // Bookmark buttons - toggle favorites
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
  bookmarkButtons.forEach((button) => {
    const restaurantId = button.getAttribute("data-id");

    // Set initial state based on favorites
    if (restaurantId && isFavorite(restaurantId)) {
      button.classList.add("active");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      if (restaurantId) {
        const isNowFavorite = toggleFavorite(restaurantId);

        if (isNowFavorite) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
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

// Update grid without full reload
function updateRestaurantGrid(restaurants) {
  const gridContainer = document.querySelector(".restaurant-grid");
  const resultCount = document.querySelector(".result-count");

  if (resultCount) {
    resultCount.textContent = `Tìm thấy ${restaurants.length} nhà hàng`;
  }

  if (gridContainer) {
    gridContainer.innerHTML = restaurants
      .map(
        (r) => `
      <div class="grid-card" data-id="${r.id}">
        <div class="grid-card-image" style="background-image: url('${
          r.image
        }');">
          ${
            r.recommended
              ? '<span class="badge-recommended">Được đề xuất</span>'
              : ""
          }
          <button class="bookmark-btn" data-id="${r.id}" aria-label="Lưu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="grid-card-content">
          <h3 class="grid-card-title">${r.name}</h3>
          <div class="grid-card-info">
            <span class="rating">⭐ ${r.average_rating}</span>
            <span class="distance">📍 ${r.distance}</span>
          </div>
          <p class="grid-card-cuisine">${r.cuisine}</p>
          <div class="grid-card-footer">
            <span class="price">${r.priceRange}</span>
            <button class="btn-book-small" data-id="${r.id}">Đặt bàn</button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Re-attach listeners
    reattachGridListeners();
  }
}

// Re-attach event listeners after DOM update
function reattachGridListeners() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
  bookmarkButtons.forEach((button) => {
    const restaurantId = button.getAttribute("data-id");

    // Set initial state based on favorites
    if (restaurantId && isFavorite(restaurantId)) {
      button.classList.add("active");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      if (restaurantId) {
        const isNowFavorite = toggleFavorite(restaurantId);

        if (isNowFavorite) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }

      if (navigator.vibrate) navigator.vibrate(10);
    });
  });

  const bookButtons = document.querySelectorAll(".btn-book-small");
  bookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      window.location.hash = `#/booking/new/${id}`;
    });
  });

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
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
