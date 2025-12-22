import "./styles/mobile.css";
import { initRouter } from "./core/router.js";
import { registerHelpers } from "./core/templates.js";
import authService from "./utils/authService.js";
import {
  startNotificationPolling,
  stopNotificationPolling,
} from "./utils/notificationHelper.js";

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

  // Notification polling disabled due to CORS issues
  // Uncomment below to enable if backend CORS is configured
  
  // Start notification polling if user is logged in
  // if (isLoggedIn) {
  //   startNotificationPolling(5000); // Poll every 5 seconds (for testing)
  // }

  // Listen for login/logout events to start/stop polling
  // window.addEventListener("userLoggedIn", () => {
  //   startNotificationPolling(5000); // Poll every 5 seconds (for testing)
  // });

  window.addEventListener("userLoggedOut", () => {
    stopNotificationPolling();
  });

  // Listen for new notifications and show popup
  window.addEventListener("notificationReceived", (event) => {
    const notification = event.detail;
    showNotificationPopup(notification);
  });

  initRouter();
}

// Show notification popup that slides down from top
function showNotificationPopup(notification) {
  // Remove existing popup if any
  const existingPopup = document.querySelector(".notification-popup-banner");
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement("div");
  popup.className = "notification-popup-banner";

  // Get icon and color based on notification type
  let iconSvg = "";
  let popupClass = "";

  if (
    notification.type === "CONFIRMED" ||
    notification.status === "CONFIRMED"
  ) {
    popupClass = "popup-success";
    iconSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (
    notification.type === "CHECKED_IN" ||
    notification.status === "CHECKED_IN"
  ) {
    popupClass = "popup-info";
    iconSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    `;
  } else if (
    notification.type === "CANCELLED" ||
    notification.status === "CANCELLED"
  ) {
    popupClass = "popup-error";
    iconSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  } else if (
    notification.type === "REMINDER" ||
    notification.status === "REMINDER"
  ) {
    popupClass = "popup-warning";
    iconSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
  } else {
    popupClass = "popup-default";
    iconSvg = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    `;
  }

  popup.innerHTML = `
    <div class="notification-popup-content ${popupClass}">
      <div class="notification-popup-icon">${iconSvg}</div>
      <div class="notification-popup-text">
        <div class="notification-popup-title">${notification.title}</div>
        <div class="notification-popup-message">${notification.message}</div>
      </div>
      <button class="notification-popup-close" aria-label="Đóng">×</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Slide down animation
  setTimeout(() => popup.classList.add("show"), 10);

  // Vibrate if supported
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }

  // Click to navigate to notifications page
  const contentArea = popup.querySelector(".notification-popup-content");
  contentArea.addEventListener("click", (e) => {
    if (!e.target.closest(".notification-popup-close")) {
      window.location.hash = "#/notifications";
      popup.remove();
    }
  });

  // Close button
  const closeBtn = popup.querySelector(".notification-popup-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
  });

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    if (popup && popup.parentElement) {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }
  }, 5000);
}

bootstrap();
