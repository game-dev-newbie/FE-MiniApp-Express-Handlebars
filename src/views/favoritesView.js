// src/views/favoritesView.js
import { renderTemplate } from "../core/templates.js";
import { getMyFavorites } from "../api/favoritesApi.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderFavorites() {
  // Check authentication before allowing access to favorites
  if (!authService.requireAuth("#/favorites")) {
    return;
  }

  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  // Show loading
  appEl.innerHTML = `
    <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div class="spinner"></div>
    </div>
  ` + bottomNavHtml;

  try {
    // Get favorites from API
    const response = await getMyFavorites();
    const favoriteItems = response?.items || [];

    console.log("❤️ Favorites API response:", response);
    console.log("❤️ Favorite items:", favoriteItems);

    // Transform API data - extract Restaurant object
    const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
    const favoriteRestaurants = favoriteItems.map((fav) => {
      // API returns nested Restaurant object
      const restaurant = fav.Restaurant || fav.restaurant;
      
      if (!restaurant) {
        console.warn("No restaurant data in favorite:", fav);
        return null;
      }

      return {
        id: restaurant.id,
        name: restaurant.name || "Nhà hàng",
        address: restaurant.address || "",
        image: restaurant.main_image_url 
          ? (restaurant.main_image_url.startsWith('http') 
              ? restaurant.main_image_url 
              : `${baseURL}${restaurant.main_image_url}`)
          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E",
        rating: restaurant.average_rating || 0,
        reviews: restaurant.review_count || 0,
        cuisine: restaurant.tags?.split(',')[0]?.trim() || "Đa dạng",
        distance: "1.5km", // API không có distance
        openTime: restaurant.open_time?.substring(0, 5) || "08:00",
        closeTime: restaurant.close_time?.substring(0, 5) || "22:00",
        priceRange: restaurant.default_deposit_amount > 0
          ? `Đặt cọc: ${restaurant.default_deposit_amount.toLocaleString('vi-VN')}đ`
          : "Miễn phí"
      };
    }).filter(r => r !== null); // Remove null entries

    console.log("❤️ Transformed favorites:", favoriteRestaurants);

    const contentHtml = renderTemplate("favorites", {
      favorites: favoriteRestaurants,
    });

    appEl.innerHTML = contentHtml + bottomNavHtml;
    
    // Initialize event listeners
    initFavoritesEventListeners();
  } catch (error) {
    console.error("Error loading favorites:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p>Không thể tải danh sách yêu thích. Vui lòng thử lại.</p>
        <button onclick="location.reload()" class="btn-primary">Tải lại</button>
      </div>
    ` + bottomNavHtml;
  }
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
