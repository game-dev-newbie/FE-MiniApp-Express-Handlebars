// src/views/settingsView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

// Check if dark mode is enabled
function isDarkMode() {
  return localStorage.getItem("dinelink_theme") === "dark";
}

// Apply theme to body
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  localStorage.setItem("dinelink_theme", theme);
}

export async function renderSettings() {
  const currentTheme = localStorage.getItem("dinelink_theme") || "light";

  const contentHtml = renderTemplate("settings", {
    isLightMode: currentTheme === "light",
  });

  appEl.innerHTML = contentHtml;

  // Apply current theme
  applyTheme(currentTheme);

  // Initialize event listeners
  initSettingsEventListeners();
}

function initSettingsEventListeners() {
  // Back button
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Theme toggle buttons - only works when logged in
  const themeBtns = document.querySelectorAll(".theme-btn");
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const isLoggedIn = authService.isAuthenticated();
      
      // Only allow theme change for logged in users
      if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để sử dụng chức năng này!");
        return;
      }
      
      const theme = btn.getAttribute("data-theme");

      // Update active state
      themeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Apply theme
      applyTheme(theme);

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Toggle switches
  const pushNotificationToggle = document.getElementById("pushNotification");
  const emailNotificationToggle = document.getElementById("emailNotification");

  if (pushNotificationToggle) {
    pushNotificationToggle.addEventListener("change", (e) => {
      localStorage.setItem("dinelink_push_notification", e.target.checked);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });

    // Load saved preference
    const savedPushPref = localStorage.getItem("dinelink_push_notification");
    if (savedPushPref !== null) {
      pushNotificationToggle.checked = savedPushPref === "true";
    }
  }

  if (emailNotificationToggle) {
    emailNotificationToggle.addEventListener("change", (e) => {
      localStorage.setItem("dinelink_email_notification", e.target.checked);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });

    // Load saved preference
    const savedEmailPref = localStorage.getItem("dinelink_email_notification");
    if (savedEmailPref !== null) {
      emailNotificationToggle.checked = savedEmailPref === "true";
    }
  }

  // Privacy button
  const privacyBtn = document.querySelector(
    '.settings-item-button:has(.settings-item-title:contains("Quyền riêng tư"))'
  );
  if (privacyBtn) {
    privacyBtn.addEventListener("click", () => {
      alert("Chức năng Quyền riêng tư đang được phát triển!");
    });
  }

  // Terms button
  const termsBtn = document.querySelector(".settings-item-button:last-of-type");
  if (termsBtn) {
    termsBtn.addEventListener("click", () => {
      alert("Chức năng Điều khoản sử dụng đang được phát triển!");
    });
  }
}

// Initialize theme on app load
export function initTheme() {
  const savedTheme = localStorage.getItem("dinelink_theme") || "light";
  applyTheme(savedTheme);
}
