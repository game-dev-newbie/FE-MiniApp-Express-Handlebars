// src/views/homeView.js
import { renderTemplate } from "../core/templates.js";
import {
  getFeaturedRestaurants,
  getPopularRestaurants,
  getRestaurantsByCategory,
  searchRestaurants,
  getRecentlyVisitedRestaurants,
  getRestaurantsByTimeOfDay,
  getTimeOfDayTitle,
  users,
} from "../data/mockData.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import { updateNotificationBadge } from "../utils/notificationHelper.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export function renderHome() {
  // Check if user is logged in (now synchronous)
  const isLoggedIn = authService.isAuthenticated();
  const user = isLoggedIn ? authService.getUser() : null;

  // Use logged in user data or guest data
  const displayName = user ? user.display_name : "Quý khách";
  const avatarUrl = user ? user.avatar_url : "/src/assets/icons/cá nhân.jpg";
  const userId = user ? user.id : null;

  // Render header and bottom nav
  const headerHtml = renderTemplate("header", {
    userAvatar: avatarUrl,
    userName: displayName,
  });
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  // Get data from mockData
  const featuredRestaurants = getFeaturedRestaurants();
  const popularRestaurants = getPopularRestaurants();
  const recentRestaurants = userId ? getRecentlyVisitedRestaurants(userId) : [];
  const timeBasedRestaurants = getRestaurantsByTimeOfDay();
  const timeOfDayTitle = getTimeOfDayTitle();

  const contentHtml = renderTemplate("homeContent", {
    userName: displayName,
    featuredRestaurants,
    popularRestaurants,
    recentRestaurants,
    timeBasedRestaurants,
    timeOfDayTitle,
  });

  appEl.innerHTML = headerHtml + contentHtml + bottomNavHtml;

  // Update notification badge
  updateNotificationBadge();

  // Reset scroll position for all horizontal scroll sections
  setTimeout(() => {
    const horizontalScrolls = document.querySelectorAll(".horizontal-scroll");
    horizontalScrolls.forEach((scroll) => {
      scroll.scrollLeft = 0;
    });
  }, 0);

  // Initialize event listeners
  initHomeEventListeners();
}

function initHomeEventListeners() {
  console.log("Initializing home event listeners...");

  // Listen for user data updates
  const userDataListener = (event) => {
    const updatedUser = event.detail;
    // Update user info in header
    const headerAvatar = document.querySelector(".user-avatar");
    const headerName = document.querySelector(".greeting-name");

    if (headerAvatar && updatedUser.avatar_url) {
      headerAvatar.src = updatedUser.avatar_url;
    }
    if (headerName && updatedUser.display_name) {
      headerName.textContent = updatedUser.display_name;
    }
  };
  window.addEventListener("userDataUpdated", userDataListener);

  // Cleanup on page change
  const cleanupUserDataListener = () => {
    window.removeEventListener("userDataUpdated", userDataListener);
    window.removeEventListener("hashchange", cleanupUserDataListener);
  };
  window.addEventListener("hashchange", cleanupUserDataListener, { once: true });

  // Category tabs
  const categoryButtons = document.querySelectorAll(".category-btn");
  console.log("Found category buttons:", categoryButtons.length);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      console.log("Navigate to category:", category);

      // Navigate to category page
      window.location.hash = `#/category/${category}`;
    });
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    // Navigate to search page on click
    searchInput.addEventListener("click", () => {
      window.location.hash = "#/search";
    });

    // Navigate to search page on focus
    searchInput.addEventListener("focus", () => {
      window.location.hash = "#/search";
    });
  }

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

  // Book table buttons - navigate to booking form
  const bookButtons = document.querySelectorAll(
    ".btn-book-table, .btn-book-again"
  );
  console.log("Found book buttons:", bookButtons.length);
  bookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      console.log("Book button clicked, restaurant ID:", id);
      window.location.hash = `#/booking/new/${id}`;
    });
  });

  // Bookmark buttons - toggle favorites
  const bookmarkButtons = document.querySelectorAll(".bookmark-featured-btn");
  bookmarkButtons.forEach((button) => {
    const restaurantId = button
      .closest(".featured-card")
      ?.getAttribute("data-id");

    // Set initial state based on favorites
    if (restaurantId && isFavorite(restaurantId)) {
      button.classList.add("active");
    }

    button.addEventListener("click", async (e) => {
      e.stopPropagation();

      // Check if user is logged in before allowing favorite
      if (!authService.isAuthenticated()) {
        // Store current page and redirect to login
        authService.requireAuth(window.location.hash || "#/home");
        return;
      }

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

  // Featured card click - navigate to detail page
  const featuredCards = document.querySelectorAll(".featured-card");
  console.log("Found featured cards:", featuredCards.length);
  featuredCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking bookmark or book button
      if (
        e.target.closest(".bookmark-featured-btn") ||
        e.target.closest(".btn-book-table")
      ) {
        return;
      }

      const id = card.getAttribute("data-id");
      console.log("Featured card clicked, restaurant ID:", id);
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Recent visited card click - navigate to detail page
  const recentCards = document.querySelectorAll(".recent-visited-card");
  console.log("Found recent cards:", recentCards.length);
  recentCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking book button
      if (e.target.closest(".btn-book-again")) {
        return;
      }

      const id = card.getAttribute("data-id");
      console.log("Recent card clicked, restaurant ID:", id);
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Header buttons
  const notificationBtn = document.getElementById("notificationBtn");
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const profileBtn = document.getElementById("profileBtn");
  const filterBtn = document.getElementById("filterBtn");

  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      window.location.hash = "#/notifications";
    });
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", async () => {
      // Check if user is logged in before allowing access to favorites
      if (!authService.isAuthenticated()) {
        authService.requireAuth("#/favorites");
        return;
      }
      sessionStorage.setItem("favoritesReferrer", "home");
      window.location.hash = "#/favorites";
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", async () => {
      // Check if user is logged in before allowing access to profile
      if (!authService.isAuthenticated()) {
        authService.requireAuth("#/profile");
        return;
      }
      window.location.hash = "#/profile";
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      alert("Bộ lọc nâng cao đang được phát triển!");
    });
  }

  // See all links
  const seeAllLinks = document.querySelectorAll(".see-all-link");
  seeAllLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("See all clicked");
      alert("Xem tất cả nhà hàng");
    });
  });
}

// Update restaurant lists without full page reload
function updateRestaurantLists(restaurants) {
  const featured = restaurants.filter((r) => r.recommended);
  const popular = restaurants.slice(0, 5);

  // Update featured section
  const featuredContainer = document.querySelector(
    ".restaurant-section:nth-of-type(1) .horizontal-scroll"
  );
  if (featuredContainer) {
    featuredContainer.innerHTML = featured
      .map(
        (r) => `
      <div class="featured-card" data-id="${r.id}">
        <div class="featured-card-image">
          <img src="${r.image}" alt="${r.name}" />
          ${
            r.recommended
              ? '<span class="badge-recommended">Được đề xuất</span>'
              : ""
          }
          <button class="bookmark-featured-btn" data-id="${r.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="featured-card-content">
          <h3 class="featured-card-title">${r.name}</h3>
          <div class="featured-card-meta">
            <span class="rating">⭐ ${r.average_rating}</span>
            <span class="distance">📍 ${r.distance}</span>
          </div>
          <div class="featured-card-info">
            <span class="cuisine">${r.cuisine}</span>
            <span class="price">${r.priceRange}</span>
          </div>
        </div>
        <div class="featured-card-footer">
          <button class="btn-book-table" data-id="${r.id}">Đặt bàn</button>
        </div>
      </div>
    `
      )
      .join("");

    // Re-attach event listeners for new cards
    reattachCardListeners();
  }

  // Update popular section
  const popularContainer = document.querySelector(
    ".restaurant-section:nth-of-type(2) .horizontal-scroll"
  );
  if (popularContainer) {
    popularContainer.innerHTML = popular
      .map(
        (r) => `
      <div class="featured-card" data-id="${r.id}">
        <div class="featured-card-image">
          <img src="${r.image}" alt="${r.name}" />
          ${
            r.recommended
              ? '<span class="badge-recommended">Được đề xuất</span>'
              : ""
          }
          <button class="bookmark-featured-btn" data-id="${r.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="featured-card-content">
          <h3 class="featured-card-title">${r.name}</h3>
          <div class="featured-card-meta">
            <span class="rating">⭐ ${r.average_rating}</span>
            <span class="distance">📍 ${r.distance}</span>
          </div>
          <div class="featured-card-info">
            <span class="cuisine">${r.cuisine}</span>
            <span class="price">${r.priceRange}</span>
          </div>
        </div>
        <div class="featured-card-footer">
          <button class="btn-book-table" data-id="${r.id}">Đặt bàn</button>
        </div>
      </div>
    `
      )
      .join("");

    // Re-attach event listeners for new cards
    reattachCardListeners();
  }
}

// Re-attach event listeners after updating DOM
function reattachCardListeners() {
  // Book table buttons - navigate to booking form
  const bookButtons = document.querySelectorAll(".btn-book-table");
  bookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      window.location.hash = `#/booking/new/${id}`;
    });
  });

  // Bookmark buttons
  const bookmarkButtons = document.querySelectorAll(".bookmark-featured-btn");
  bookmarkButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      button.classList.toggle("active");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Featured card click - navigate to detail page
  const featuredCards = document.querySelectorAll(".featured-card");
  featuredCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't trigger if clicking bookmark or book button
      if (
        e.target.closest(".bookmark-featured-btn") ||
        e.target.closest(".btn-book-table")
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
