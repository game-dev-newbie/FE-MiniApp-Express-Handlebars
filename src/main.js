import "./styles/mobile.css";
import { initRouter } from "./core/router.js";
import { registerHelpers } from "./core/templates.js";

function bootstrap() {
  registerHelpers();

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
