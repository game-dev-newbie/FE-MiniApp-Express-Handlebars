import "./styles/mobile.css";
import { initRouter } from "./core/router.js";
import { registerHelpers } from "./core/templates.js";
import authService from "./utils/authService.js";

function bootstrap() {
  registerHelpers();

  // Apply saved theme on startup - but force light mode for guests
  const isLoggedIn = authService.isAuthenticated();
  let savedTheme = localStorage.getItem("dinelink_theme") || "light";

  // Force light mode for guest users
  if (!isLoggedIn) {
    savedTheme = "light";
    localStorage.setItem("dinelink_theme", "light");
  }

  document.documentElement.setAttribute("data-theme", savedTheme);

  // Check if first time visit - show splash
  const currentHash = window.location.hash;
  if (!currentHash || currentHash === "#/") {
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
    if (!hasCompletedOnboarding) {
      window.location.hash = "#/splash";
    }
  }

  initRouter();
}

bootstrap();
