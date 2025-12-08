// src/views/splashView.js
import { renderTemplate } from "../core/templates.js";

export function renderSplash() {
  const appEl = document.getElementById("app");
  const html = renderTemplate("splashScreen", {});
  appEl.innerHTML = html;

  // Auto hide splash screen after 3 seconds
  setTimeout(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
    if (!hasCompletedOnboarding) {
      window.location.hash = "#/onboarding";
    } else {
      window.location.hash = "#/";
    }
  }, 3000);
}
