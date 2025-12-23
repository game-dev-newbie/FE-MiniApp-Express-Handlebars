// src/views/homeView.js
import { renderTemplate } from "../core/templates.js";
import {
  fetchTopRatedRestaurants,
  fetchTopFavoriteRestaurants,
  fetchTopRestaurantsByTag,
} from "../api/restaurantApi.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import { updateNotificationBadge } from "../utils/notificationHelper.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderHome() {
  // Check if user is logged in (now synchronous)
  const isLoggedIn = authService.isAuthenticated();
  
  let displayName = "Quý khách";
  let avatarUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2300c853'/%3E%3Cpath d='M50 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zm0 7.5c-10 0-30 5-30 15V75h60v-7.5c0-10-20-15-30-15z' fill='white'/%3E%3C/svg%3E";
  
  // Fetch real user data from API if logged in
  if (isLoggedIn) {
    try {
      const { getMyProfile } = await import("../api/userApi.js");
      const userData = await getMyProfile();
      displayName = userData.display_name || "Quý khách";
      avatarUrl = userData.avatar_url || avatarUrl;
      console.log("👤 User data for home:", { displayName, avatarUrl });
    } catch (error) {
      console.warn("Could not fetch user profile, using guest:", error);
      // Fall back to guest
    }
  }

  // Render header and bottom nav
  const headerHtml = renderTemplate("header", {
    userAvatar: avatarUrl,
    userName: displayName,
  });
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  // Show skeleton loading state (instead of spinner)
  appEl.innerHTML =
    headerHtml +
    `
    <main class="main-content">
      <div class="home-banner" style="margin-bottom: 24px;">
        <div class="skeleton" style="height: 160px; border-radius: 12px; margin-bottom: 16px;"></div>
      </div>
      
      <div class="section-header">
        <div class="skeleton skeleton-title" style="width: 200px; margin-bottom: 16px;"></div>
      </div>
      
      <div class="skeleton-list">
        ${Array(3).fill(`
          <div class="restaurant-card-skeleton">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text" style="width: 60%;"></div>
              <div class="skeleton skeleton-text" style="width: 40%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  ` +
    bottomNavHtml;

  try {
    // Fetch data from API (parallel requests)
    const [topRatedData, topFavoriteData, topByTagData] = await Promise.all([
      fetchTopRatedRestaurants(),
      fetchTopFavoriteRestaurants(),
      fetchTopRestaurantsByTag("romantic"), // You can change the tag here (e.g., "lunch", "dinner", "romantic")
    ]);

    console.log("🏠 Home API responses:", {
      topRated: topRatedData,
      topFavorite: topFavoriteData,
      topByTag: topByTagData
    });

    // Log raw items from API
    console.log("📦 RAW API Items:", {
      topRatedItems: topRatedData?.items,
      topFavoriteItems: topFavoriteData?.items,
      topByTagItems: topByTagData?.items
    });

    // Log detailed structure
    console.log("📊 API Response Structure:", {
      topRatedTotal: topRatedData?.total,
      topRatedItemsLength: topRatedData?.items?.length,
      topFavoriteTotal: topFavoriteData?.total,
      topFavoriteItemsLength: topFavoriteData?.items?.length,
      topByTagTotal: topByTagData?.total,
      topByTagItemsLength: topByTagData?.items?.length
    });

    // Transform API data to match template format
    const transformRestaurant = (restaurant) => {
      const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
      return {
        id: restaurant.id,
        name: restaurant.name || "Nhà hàng",
        address: "", // API không trả về field này
        image: restaurant.main_image_url 
          ? (restaurant.main_image_url.startsWith('http') 
              ? restaurant.main_image_url 
              : `${baseURL}${restaurant.main_image_url}`)
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E",
        average_rating: restaurant.average_rating || 0,
        review_count: restaurant.review_count || 0,
        favorite_count: restaurant.favorite_count || 0,
        cuisine: restaurant.tags?.split(',')[0] || "Đa dạng",
        opening_hours: "08:00", // API không trả về field này - dùng default
        closing_hours: "22:00", // API không trả về field này - dùng default
        priceRange: restaurant.default_deposit_amount > 0
          ? `Đặt cọc: ${restaurant.default_deposit_amount.toLocaleString('vi-VN')}đ`
          : "Miễn phí",
        recommended: restaurant.average_rating >= 4.5
      };
    };

    const featuredRestaurants = (topRatedData?.items || []).map(transformRestaurant);
    const popularRestaurants = (topFavoriteData?.items || []).map(transformRestaurant);
    const timeBasedRestaurants = (topByTagData?.items || []).map(transformRestaurant);
    
    console.log("📊 Restaurant counts:", {
      featured: featuredRestaurants.length,
      popular: popularRestaurants.length,
      byTag: timeBasedRestaurants.length
    });
    
    console.log("🔄 Transformed data:", {
      featuredRestaurants,
      popularRestaurants,
      timeBasedRestaurants
    });
    
    // Log first item if available
    if (featuredRestaurants.length > 0) {
      console.log("🍽️ Sample featured restaurant:", featuredRestaurants[0]);
    } else {
      console.warn("⚠️ No featured restaurants returned from API");
    }
    if (popularRestaurants.length > 0) {
      console.log("❤️ Sample popular restaurant:", popularRestaurants[0]);
    } else {
      console.warn("⚠️ No popular restaurants returned from API");
    }
    if (timeBasedRestaurants.length > 0) {
      console.log("⏰ Sample tag-based restaurant:", timeBasedRestaurants[0]);
    } else {
      console.warn("⚠️ No tag-based restaurants returned from API");
    }
    
    // Remove mock data - only use real API data
    const recentRestaurants = [];
    const timeOfDayTitle = "Nhà hàng lãng mạn"; // Title for tag-based section

    const contentHtml = renderTemplate("homeContent", {
      userName: displayName,
      featuredRestaurants,
      popularRestaurants,
      recentRestaurants,
      timeBasedRestaurants,
      timeOfDayTitle,
    });

    appEl.innerHTML = headerHtml + contentHtml + bottomNavHtml;
  } catch (error) {
    console.error("Error loading home data:", error);

    // Show error state
    appEl.innerHTML =
      headerHtml +
      `
      <main class="main-content">
        <div class="error-container" style="text-align: center; padding: 40px 20px;">
          <p style="color: #666; margin-bottom: 16px;">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <button onclick="location.reload()" class="btn-primary">Tải lại</button>
        </div>
      </main>
    ` +
      bottomNavHtml;
    return;
  }

  // Update notification badge after DOM is fully loaded
  setTimeout(() => {
    updateNotificationBadge();
  }, 100);

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
  window.addEventListener("hashchange", cleanupUserDataListener, {
    once: true,
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
  bookmarkButtons.forEach(async (button) => {
    const restaurantId = button
      .closest(".featured-card")
      ?.getAttribute("data-id");

    // Set initial state based on favorites (async check)
    if (restaurantId) {
      try {
        const isCurrentlyFavorite = await isFavorite(restaurantId);
        if (isCurrentlyFavorite) {
          button.classList.add("active");
        }
      } catch (error) {
        console.warn("Could not check favorite status:", error);
      }
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
        try {
          const isNowFavorite = await toggleFavorite(restaurantId);

          if (isNowFavorite) {
            button.classList.add("active");
          } else {
            button.classList.remove("active");
          }
        } catch (error) {
          console.error("Error toggling favorite:", error);
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
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      
      const restaurantId = button.closest(".featured-card")?.getAttribute("data-id");
      if (!restaurantId) return;

      try {
        const isNowFavorite = await toggleFavorite(restaurantId);
        
        if (isNowFavorite) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }

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
