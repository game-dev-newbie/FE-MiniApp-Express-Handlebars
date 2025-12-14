// src/views/restaurantDetailView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants, getRestaurantReviews, users } from "../data/mockData.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import { fetchRestaurantReviews } from "../api/restaurantApi.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderRestaurantDetail(restaurantId) {
  // Find restaurant by ID
  const restaurant = restaurants.find((r) => r.id === parseInt(restaurantId));

  if (!restaurant) {
    // Restaurant not found, redirect to home
    window.location.hash = "#/home";
    return;
  }

  // Show loading state
  appEl.innerHTML = '<div class="loading-spinner">Đang tải...</div>';

  try {
    // Fetch reviews from API with sort by latest
    let reviews = await fetchRestaurantReviews(restaurantId, {
      sort: "created_at",
      order: "desc",
      limit: 20,
    });

    // Get user reviews from localStorage and add to reviews list
    const userReviews = JSON.parse(
      localStorage.getItem("dinelink_user_reviews") || "[]"
    );

    const userReviewsForRestaurant = userReviews
      .filter((r) => r.restaurantId === parseInt(restaurantId))
      .map((review) => {
        const user = users.find((u) => u.id === review.userId);
        return {
          id: review.id,
          userName: user?.display_name || "Khách hàng",
          userAvatar: user?.avatar_url || "https://i.pravatar.cc/150?img=3",
          rating: review.rating,
          comment: review.comment,
          created_at: review.createdAt,
          formattedTime: formatReviewDateTime(review.createdAt),
        };
      });

    // Combine and sort by date (newest first)
    reviews = [...userReviewsForRestaurant, ...reviews].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const restaurantDetailContent = renderTemplate("restaurantDetail", {
      restaurant,
      reviews,
    });

    appEl.innerHTML = restaurantDetailContent;

    // Ensure scroll to top after DOM is rendered
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    // Initialize event listeners
    initRestaurantDetailListeners(restaurant);
    initCarousel();
    setupReviewUpdateListeners(restaurantId);
  } catch (error) {
    console.error("Error fetching restaurant reviews:", error);

    // Fallback to mockData if API fails
    let reviews = getRestaurantReviews(restaurantId);

    // Get user reviews from localStorage
    const userReviews = JSON.parse(
      localStorage.getItem("dinelink_user_reviews") || "[]"
    );

    const userReviewsForRestaurant = userReviews
      .filter((r) => r.restaurantId === parseInt(restaurantId))
      .map((review) => {
        const user = users.find((u) => u.id === review.userId);
        return {
          id: review.id,
          userName: user?.display_name || "Khách hàng",
          userAvatar: user?.avatar_url || "https://i.pravatar.cc/150?img=3",
          rating: review.rating,
          comment: review.comment,
          created_at: review.createdAt,
          formattedTime: formatReviewDateTime(review.createdAt),
        };
      });

    // Combine and sort by date (newest first)
    reviews = [...userReviewsForRestaurant, ...reviews].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const restaurantDetailContent = renderTemplate("restaurantDetail", {
      restaurant,
      reviews,
    });

    appEl.innerHTML = restaurantDetailContent;

    // Ensure scroll to top after DOM is rendered
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    // Initialize event listeners
    initRestaurantDetailListeners(restaurant);
    initCarousel();
    setupReviewListener(restaurantId);
    setupReviewUpdateListeners(restaurantId);
  }
}

function initRestaurantDetailListeners(restaurant) {
  // Back button
  const btnBack = document.getElementById("btnBackFromDetail");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Bookmark button with favorites helper
  const btnBookmark = document.querySelector(".btn-bookmark-detail");
  if (btnBookmark) {
    // Set initial state
    if (isFavorite(restaurant.id)) {
      btnBookmark.classList.add("active");
    }

    btnBookmark.addEventListener("click", () => {
      // Check if user is logged in before allowing favorite
      if (!authService.isAuthenticated()) {
        authService.requireAuth(`#/restaurant/${restaurant.id}`);
        return;
      }
      
      toggleFavorite(restaurant.id);
      btnBookmark.classList.toggle("active");
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

// Carousel functionality
function initCarousel() {
  const carousel = document.getElementById("restaurantCarousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(
    ".carousel-indicators .indicator"
  );
  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    indicators.forEach((ind) => ind.classList.remove("active"));

    slides[index].classList.add("active");
    indicators[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Auto play every 3 seconds
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // Manual slide selection
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  carousel.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
      // Swipe left
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    }
  }

  // Start auto play
  startAutoPlay();

  // Pause on hover (for desktop)
  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
}

// Setup listener for new reviews
let currentReviewListener = null;

function setupReviewListener(restaurantId) {
  // Remove existing listener if any
  if (currentReviewListener) {
    window.removeEventListener("reviewSubmitted", currentReviewListener);
  }

  // Define handler function
  currentReviewListener = (event) => {
    const { restaurantId: reviewRestaurantId } = event.detail;

    console.log(
      "Review submitted event received:",
      reviewRestaurantId,
      "current:",
      restaurantId
    );

    // Only reload if review is for current restaurant and we're still on this page
    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log(
        "✅ New review for current restaurant detected, reloading..."
      );

      // Reload restaurant detail to show new review
      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 800);
    }
  };

  // Attach listener
  window.addEventListener("reviewSubmitted", currentReviewListener);
}

// Setup listener for review updates and deletes
function setupReviewUpdateListeners(restaurantId) {
  // Handler for review updates
  const updateHandler = (event) => {
    const { reviewId, restaurantId: reviewRestaurantId } = event.detail;

    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log("✅ Review updated for current restaurant, reloading...");

      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 300);
    }
  };

  // Handler for review deletes
  const deleteHandler = (event) => {
    const { reviewId, restaurantId: reviewRestaurantId } = event.detail;

    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log("✅ Review deleted for current restaurant, reloading...");

      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 300);
    }
  };

  window.addEventListener("reviewUpdated", updateHandler);
  window.addEventListener("reviewDeleted", deleteHandler);

  // Cleanup on page unload
  window.addEventListener(
    "hashchange",
    () => {
      window.removeEventListener("reviewUpdated", updateHandler);
      window.removeEventListener("reviewDeleted", deleteHandler);
    },
    { once: true }
  );
}

// Format review date time
function formatReviewDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 hour: show "X phút trước"
  if (diffMins < 60) {
    return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
  }
  // Less than 24 hours: show "X giờ trước"
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  // Less than 7 days: show "X ngày trước"
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }
  // Older: show full date and time
  const dateStr = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} lúc ${timeStr}`;
}
