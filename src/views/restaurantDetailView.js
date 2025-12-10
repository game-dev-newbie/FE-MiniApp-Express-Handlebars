// src/views/restaurantDetailView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";

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
  initCarousel();
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
  const indicators = document.querySelectorAll(".carousel-indicators .indicator");
  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    indicators.forEach(ind => ind.classList.remove("active"));
    
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
