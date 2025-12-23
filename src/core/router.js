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
import { renderPayment } from "../views/paymentView.js";
import { renderEditBooking } from "../views/editBookingView.js";
import { renderBookingDetail } from "../views/bookingDetailView.js";
import { renderMyReviews } from "../views/myReviewsView.js";
import { renderHistory } from "../views/historyView.js";
import { renderHelp } from "../views/helpView.js";
import { renderLogin } from "../views/loginView.js";
import { renderRegister } from "../views/registerView.js";
import { renderEditProfile } from "../views/editProfileView.js";

export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange(); // chạy lần đầu
}

function handleRouteChange() {
  const hash = window.location.hash || "#/splash";

  // Scroll to top FIRST (before transition)
  window.scrollTo(0, 0);

  // Get app element
  const appEl = document.getElementById("app");
  
  if (!appEl) {
    renderRoute(hash);
    return;
  }

  // Skip transition for initial splash
  if (hash === "#/splash" && !appEl.innerHTML) {
    renderRoute(hash);
    return;
  }

  // Use requestAnimationFrame for smooth transition
  requestAnimationFrame(() => {
    // Add fade out
    appEl.style.opacity = '0';
    appEl.style.transform = 'scale(0.98)';
    appEl.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    
    // Render new content after fade out
    setTimeout(() => {
      renderRoute(hash);
      
      // Fade in new content
      requestAnimationFrame(() => {
        appEl.style.opacity = '1';
        appEl.style.transform = 'scale(1)';
        
        // Clean up inline styles after transition
        setTimeout(() => {
          appEl.style.opacity = '';
          appEl.style.transform = '';
          appEl.style.transition = '';
        }, 200);
      });
    }, 150);
  });
}

function renderRoute(hash) {

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

  // Check for booking detail routes
  if (route.startsWith("booking/detail/")) {
    const bookingId = route.split("/")[2];
    renderBookingDetail(bookingId);
    return;
  }

  // Check for edit booking routes
  if (route.startsWith("booking/edit/")) {
    const bookingId = route.split("/")[2];
    renderEditBooking(bookingId);
    return;
  }

  // Check for payment routes
  if (route.startsWith("payment/")) {
    const bookingId = route.split("/")[1];
    renderPayment(bookingId);
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
    case "history":
      renderHistory();
      break;
    case "profile":
      renderProfile();
      break;
    case "edit-profile":
      renderEditProfile();
      break;
    case "my-reviews":
      renderMyReviews();
      break;
    case "help":
      renderHelp();
      break;
    case "login":
      renderLogin();
      break;
    case "register":
      renderRegister();
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
