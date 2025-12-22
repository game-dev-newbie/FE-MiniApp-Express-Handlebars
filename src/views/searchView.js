// src/views/searchView.js
import { renderTemplate } from "../core/templates.js";
import { searchRestaurants as searchRestaurantsAPI } from "../api/restaurantApi.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");
const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 5;

// Global state to preserve input focus and cursor
let preserveInputState = {
  value: "",
  cursorPosition: 0,
  shouldRestore: false,
};

export async function renderSearch(searchQuery = "") {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "search" });

  // Get recent searches from localStorage
  const recentSearches = getRecentSearches();

  // Perform search if query exists
  let results = [];
  let hasSearched = false;
  let isLoading = false;

  if (searchQuery.trim()) {
    hasSearched = true;
    isLoading = true;

    // Show loading state
    const searchContent = renderTemplate("search", {
      searchQuery,
      hasSearched,
      results: [],
      recentSearches,
      isLoading: true,
    });
    appEl.innerHTML = searchContent + bottomNavHtml;

    try {
      // Call API to search restaurants
      const response = await searchRestaurantsAPI({
        q: searchQuery,
        limit: 20,
      });
      results = response.items || [];

      // Process results to match template expectations
      results = processSearchResults(results);

      // Save to recent searches
      saveRecentSearch(searchQuery);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      results = [];
    }

    isLoading = false;
  }

  const searchContent = renderTemplate("search", {
    searchQuery,
    hasSearched,
    results,
    recentSearches,
    isLoading: false,
  });

  appEl.innerHTML = searchContent + bottomNavHtml;

  // Initialize event listeners
  initSearchEventListeners(searchQuery);
}

function initSearchEventListeners(currentQuery) {
  // Search input
  const searchInput = document.getElementById("searchMainInput");
  if (searchInput) {
    // Restore from preserved state if available
    if (preserveInputState.shouldRestore && preserveInputState.value) {
      searchInput.value = preserveInputState.value;
      // Restore cursor position
      requestAnimationFrame(() => {
        searchInput.focus();
        const pos = preserveInputState.cursorPosition;
        searchInput.setSelectionRange(pos, pos);
      });
      preserveInputState.shouldRestore = false;
    } else if (currentQuery) {
      searchInput.value = currentQuery;
      requestAnimationFrame(() => {
        searchInput.focus();
        const len = currentQuery.length;
        searchInput.setSelectionRange(len, len);
      });
    } else {
      searchInput.focus();
    }

    // Use input event with debounce
    let inputTimeout;
    searchInput.addEventListener("input", (e) => {
      const currentValue = e.target.value;
      const currentCursor = searchInput.selectionStart;

      // Preserve current state
      preserveInputState = {
        value: currentValue,
        cursorPosition: currentCursor,
        shouldRestore: true,
      };

      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const trimmedQuery = currentValue.trim();
        if (trimmedQuery.length >= 2) {
          renderSearch(trimmedQuery);
        } else if (trimmedQuery.length === 0) {
          preserveInputState.shouldRestore = false;
          renderSearch("");
        }
      }, 400);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        clearTimeout(inputTimeout);
        const query = e.target.value.trim();
        if (query) {
          preserveInputState.shouldRestore = false;
          renderSearch(query);
        }
      }
    });
  }

  // Clear search button (X button in input)
  const btnClearSearchInput = document.getElementById("btnClearSearchInput");
  if (btnClearSearchInput) {
    btnClearSearchInput.addEventListener("click", () => {
      preserveInputState = {
        value: "",
        cursorPosition: 0,
        shouldRestore: false,
      };
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      renderSearch("");
    });
  }

  // Clear search button (legacy - if exists)
  const btnClear = document.getElementById("btnClearSearch");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      preserveInputState = {
        value: "",
        cursorPosition: 0,
        shouldRestore: false,
      };
      if (searchInput) {
        searchInput.value = "";
      }
      renderSearch("");
    });
  }

  // Remove search tag button (if exists)
  const btnRemoveTag = document.getElementById("btnRemoveSearchTag");
  if (btnRemoveTag) {
    btnRemoveTag.addEventListener("click", () => {
      preserveInputState = {
        value: "",
        cursorPosition: 0,
        shouldRestore: false,
      };
      if (searchInput) {
        searchInput.value = "";
      }
      renderSearch("");
    });
  }

  // Suggestion chips
  const suggestionChips = document.querySelectorAll(".suggestion-chip");
  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query");
      renderSearch(query);
    });
  });

  // Location items
  const locationItems = document.querySelectorAll(".location-item");
  locationItems.forEach((item) => {
    item.addEventListener("click", () => {
      const location = item.getAttribute("data-location");
      renderSearch(location);
    });
  });

  // Recent search items
  const recentButtons = document.querySelectorAll(".recent-search-btn");
  recentButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      preserveInputState.shouldRestore = false;
      const query = btn.getAttribute("data-query");
      renderSearch(query);
    });
  });

  // Remove buttons in recent searches
  const removeButtons = document.querySelectorAll(".btn-remove-search");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const query = btn.getAttribute("data-query");
      removeRecentSearch(query);
      renderSearch(currentQuery);
    });
  });

  // Clear history button
  const btnClearHistory = document.getElementById("btnClearHistory");
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      if (confirm("Xóa tất cả lịch sử tìm kiếm?")) {
        clearRecentSearches();
        renderSearch(currentQuery);
      }
    });
  }

  // View toggle
  const viewButtons = document.querySelectorAll(".view-btn");
  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.getAttribute("data-view");
      const listView = document.getElementById("listView");
      const gridView = document.getElementById("gridView");

      if (view === "list") {
        listView.classList.add("active");
        gridView.classList.remove("active");
      } else {
        listView.classList.remove("active");
        gridView.classList.add("active");
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Result cards - navigate to detail page
  const resultCards = document.querySelectorAll(
    ".search-result-card, .grid-card"
  );
  resultCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".btn-bookmark-result") ||
        e.target.closest(".bookmark-btn") ||
        e.target.closest(".btn-book-small")
      ) {
        return;
      }

      const id = card.getAttribute("data-id");
      window.location.hash = `#/restaurant/${id}`;
    });
  });

  // Bookmark buttons - toggle favorites
  const bookmarkButtons = document.querySelectorAll(
    ".btn-bookmark-result, .bookmark-btn"
  );
  bookmarkButtons.forEach((btn) => {
    const card =
      btn.closest(".search-result-card") || btn.closest(".grid-card");
    const restaurantId = card?.getAttribute("data-id");

    // Set initial state based on favorites
    if (restaurantId && isFavorite(restaurantId)) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Check if user is logged in before allowing favorite
      if (!authService.isAuthenticated()) {
        authService.requireAuth(window.location.hash || "#/search");
        return;
      }

      if (restaurantId) {
        const isNowFavorite = toggleFavorite(restaurantId);

        if (isNowFavorite) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Book buttons
  const bookButtons = document.querySelectorAll(".btn-book-small");
  bookButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      window.location.hash = `#/booking/new/${id}`;
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

// Recent searches management
function getRecentSearches() {
  const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
  return searches ? JSON.parse(searches) : [];
}

function saveRecentSearch(query) {
  let searches = getRecentSearches();

  // Remove if already exists
  searches = searches.filter((s) => s.toLowerCase() !== query.toLowerCase());

  // Add to beginning
  searches.unshift(query);

  // Keep only MAX_RECENT_SEARCHES
  searches = searches.slice(0, MAX_RECENT_SEARCHES);

  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

function removeRecentSearch(query) {
  let searches = getRecentSearches();
  searches = searches.filter((s) => s !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// Process search results from API to match template expectations
function processSearchResults(results) {
  const BACKEND_URL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
  
  return results.map((restaurant) => {
    // Build full image URL
    const imageUrl = restaurant.main_image_url
      ? (restaurant.main_image_url.startsWith("http")
          ? restaurant.main_image_url
          : `${BACKEND_URL}${restaurant.main_image_url}`)
      : "/assets/placeholder-restaurant.jpg";

    // Format opening/closing hours (from "08:00:00" to "08:00")
    const formatTime = (timeStr) => {
      if (!timeStr) return "-";
      return timeStr.substring(0, 5); // "08:00:00" -> "08:00"
    };

    // Format deposit amount
    const formatDeposit = (amount) => {
      if (!amount || amount === 0) return "";
      return `Đặt cọc: ${amount.toLocaleString("vi-VN")}đ`;
    };

    return {
      id: restaurant.id,
      name: restaurant.name,
      image: imageUrl,
      cuisine: restaurant.tags || "",
      average_rating: restaurant.average_rating || 0,
      review_count: restaurant.review_count || 0,
      tags: restaurant.tags || "",
      opening_hours: formatTime(restaurant.open_time),
      closing_hours: formatTime(restaurant.close_time),
      priceRange: formatDeposit(restaurant.default_deposit_amount),
    };
  });
}
