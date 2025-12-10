// src/core/router.js

import { renderHome } from "../views/homeView.js";
import { renderSearch } from "../views/searchView.js";
import { renderSplash } from "../views/splashView.js";
import { renderOnboarding } from "../views/onboardingView.js";
import { renderCategory } from "../views/categoryView.js";
import { renderNotifications } from "../views/notificationView.js";
import { renderFavorites } from "../views/favoritesView.js";
import { renderBooking } from "../views/bookingView.js";
import { renderProfile } from "../views/profileView.js";
import { renderRestaurantDetail } from "../views/restaurantDetailView.js";
import { renderBookingForm } from "../views/bookingFormView.js";

export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange(); // chạy lần đầu
}

function handleRouteChange() {
  const hash = window.location.hash || "#/splash";

  // Parse route
  const route = hash.slice(2); // Remove "#/"

  // Check for restaurant detail routes
  if (route.startsWith("restaurant/")) {
    const restaurantId = route.split("/")[1];
    renderRestaurantDetail(restaurantId);
    return;
  }

  // Check for category routes
  if (route.startsWith("category/")) {
    const category = route.split("/")[1];
    renderCategory(category);
    return;
  }

  // Check for booking form routes
  if (route.startsWith("booking/new/")) {
    const restaurantId = route.split("/")[2];
    renderBookingForm(restaurantId);
    return;
  }

  // Route handling
  switch (route) {
    case "splash":
      renderSplash();
      break;
    case "onboarding":
      renderOnboarding();
      break;
    case "":
    case "home":
      renderHome();
      break;
    case "search":
      renderSearch();
      break;
    case "notifications":
      renderNotifications();
      break;
    case "favorites":
      renderFavorites();
      break;
    case "booking":
      renderBooking();
      break;
    case "profile":
      renderProfile();
      break;
    default:
      // Check if onboarding completed
      const hasCompletedOnboarding = localStorage.getItem(
        "onboardingCompleted"
      );
      if (!hasCompletedOnboarding) {
        window.location.hash = "#/splash";
      } else {
        renderHome();
      }
  }
}
