// src/core/router.js

import { renderHome } from "../views/homeView.js";
import { renderSearch } from "../views/searchView.js";
import { renderSplash } from "../views/splashView.js";
import { renderOnboarding } from "../views/onboardingView.js";

export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange(); // chạy lần đầu
}

function handleRouteChange() {
  const hash = window.location.hash || "#/splash";

  // Parse route
  const route = hash.slice(2); // Remove "#/"

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
    case "booking":
      // TODO: Create booking view
      alert("Booking page - coming soon!");
      window.location.hash = "#/";
      break;
    case "profile":
      // TODO: Create profile view
      alert("Profile page - coming soon!");
      window.location.hash = "#/";
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
