// src/views/profileView.js
import { renderTemplate } from "../core/templates.js";
import {
  users,
  bookings,
  reviews,
  getUserFavoriteIds,
} from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

// Function to get real-time statistics
function getProfileStats() {
  // Get checked-in bookings from localStorage (matching history page logic)
  const allBookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );

  // Debug: log to see what's in bookings
  console.log("All bookings:", allBookings);
  console.log("Current user ID:", currentUser.id);

  const historyBookings = allBookings.filter(
    (b) => b.status === "CHECKED_IN" || b.status === "COMPLETED"
  );

  console.log("History bookings (CHECKED_IN or COMPLETED):", historyBookings);

  // Get reviews from localStorage (matching my-reviews page logic)
  const allReviews = JSON.parse(
    localStorage.getItem("dinelink_user_reviews") || "[]"
  );
  const userReviews = allReviews.filter((r) => r.userId === currentUser.id);

  // Get favorites from localStorage (matching favorites page logic - array of IDs)
  const favorites = JSON.parse(
    localStorage.getItem("dinelink_favorites") || "[]"
  );

  return {
    bookings: historyBookings.length,
    reviews: userReviews.length,
    favorites: favorites.length,
  };
}

export async function renderProfile() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "profile" });

  // Get real-time statistics
  const stats = getProfileStats();

  // Get current theme
  const currentTheme = localStorage.getItem("dinelink_theme") || "light";

  const contentHtml = renderTemplate("profile", {
    user: currentUser,
    stats,
    isLightMode: currentTheme === "light",
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initProfileEventListeners();

  // Setup real-time update listeners
  setupProfileUpdateListeners();
}

// Function to update stats in DOM without full re-render
function updateStatsInDOM() {
  const stats = getProfileStats();

  const statItems = document.querySelectorAll(".stat-item");
  if (statItems.length >= 3) {
    statItems[0].querySelector(".stat-value").textContent = stats.bookings;
    statItems[1].querySelector(".stat-value").textContent = stats.reviews;
    statItems[2].querySelector(".stat-value").textContent = stats.favorites;
  }
}

// Setup event listeners for real-time updates
function setupProfileUpdateListeners() {
  // Listen for review submissions
  const reviewListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("reviewSubmitted", reviewListener);

  // Listen for review updates
  const reviewUpdateListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("reviewUpdated", reviewUpdateListener);

  // Listen for review deletions
  const reviewDeleteListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("reviewDeleted", reviewDeleteListener);

  // Listen for booking check-ins
  const checkinListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("bookingCheckedIn", checkinListener);

  // Listen for favorite changes
  const favoriteListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("favoriteToggled", favoriteListener);

  // Listen for booking status updates
  const statusListener = () => {
    updateStatsInDOM();
  };
  window.addEventListener("bookingStatusUpdated", statusListener);

  // Cleanup on page change
  window.addEventListener(
    "hashchange",
    () => {
      window.removeEventListener("reviewSubmitted", reviewListener);
      window.removeEventListener("reviewUpdated", reviewUpdateListener);
      window.removeEventListener("reviewDeleted", reviewDeleteListener);
      window.removeEventListener("bookingCheckedIn", checkinListener);
      window.removeEventListener("favoriteToggled", favoriteListener);
      window.removeEventListener("bookingStatusUpdated", statusListener);
    },
    { once: true }
  );
}

function initProfileEventListeners() {
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    // Set initial state
    const currentTheme = localStorage.getItem("dinelink_theme") || "light";
    darkModeToggle.checked = currentTheme === "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);

    // Handle toggle
    darkModeToggle.addEventListener("change", (e) => {
      const theme = e.target.checked ? "dark" : "light";
      localStorage.setItem("dinelink_theme", theme);
      document.documentElement.setAttribute("data-theme", theme);

      // Add smooth transition
      if (navigator.vibrate) navigator.vibrate(10);
    });
  }

  // Edit avatar
  const editAvatarBtn = document.querySelector(".btn-edit-avatar");
  if (editAvatarBtn) {
    editAvatarBtn.addEventListener("click", () => {
      alert("Chức năng đổi ảnh đại diện đang được phát triển!");
    });
  }

  // Edit profile
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      alert("Chức năng sửa thông tin cá nhân đang được phát triển!");
    });
  }

  // My bookings
  const myBookingsBtn = document.getElementById("myBookingsBtn");
  if (myBookingsBtn) {
    myBookingsBtn.addEventListener("click", () => {
      window.location.hash = "#/booking";
    });
  }

  // My history
  const myHistoryBtn = document.getElementById("myHistoryBtn");
  if (myHistoryBtn) {
    myHistoryBtn.addEventListener("click", () => {
      window.location.hash = "#/history";
    });
  }

  // My reviews
  const myReviewsBtn = document.getElementById("myReviewsBtn");
  if (myReviewsBtn) {
    myReviewsBtn.addEventListener("click", () => {
      window.location.hash = "#/my-reviews";
    });
  }

  // My favorites
  const myFavoritesBtn = document.getElementById("myFavoritesBtn");
  if (myFavoritesBtn) {
    myFavoritesBtn.addEventListener("click", () => {
      sessionStorage.setItem("favoritesReferrer", "profile");
      window.location.hash = "#/favorites";
    });
  }

  // Help
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      window.location.hash = "#/help";
    });
  }

  // Theme toggle buttons
  const themeBtns = document.querySelectorAll(".theme-btn-inline");
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.getAttribute("data-theme");

      // Update active state
      themeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Apply theme
      if (theme === "dark") {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
      localStorage.setItem("dinelink_theme", theme);

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Settings (removed - now using inline theme toggle)
  // const settingsBtn = document.getElementById("settingsBtn");

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("onboardingCompleted");
        window.location.hash = "#/splash";
        location.reload();
      }
    });
  }

  // Bottom navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      window.location.hash = `#/${page === "home" ? "" : page}`;
    });
  });
}
