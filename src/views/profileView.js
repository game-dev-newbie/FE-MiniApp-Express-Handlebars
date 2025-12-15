// src/views/profileView.js
import { renderTemplate } from "../core/templates.js";
import {
  users,
  bookings,
  reviews,
  getUserFavoriteIds,
} from "../data/mockData.js";
import authService from "../utils/authService.js";

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
  // Check authentication before allowing access to profile
  if (!authService.requireAuth("#/profile")) {
    return;
  }

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
      window.location.hash = "#/edit-profile";
    });
  }

  // Edit profile
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      window.location.hash = "#/edit-profile";
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

  // Theme toggle buttons - only works when logged in
  const themeBtns = document.querySelectorAll(".theme-btn-inline");
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
    logoutBtn.addEventListener("click", async () => {
      // Show logout confirmation bottom sheet
      showLogoutConfirmation();
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

function showLogoutConfirmation() {
  // Create bottom sheet
  const bottomSheet = document.createElement("div");
  bottomSheet.className = "logout-bottom-sheet";
  bottomSheet.innerHTML = `
    <div class="bottom-sheet-overlay"></div>
    <div class="bottom-sheet-content">
      <div class="bottom-sheet-handle"></div>
      <div class="bottom-sheet-body">
        <div class="logout-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3 class="logout-title">Đăng xuất</h3>
        <p class="logout-message">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
        <div class="logout-actions">
          <button class="btn-logout-cancel">Hủy</button>
          <button class="btn-logout-confirm">Đăng xuất</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(bottomSheet);

  // Trigger animation
  setTimeout(() => {
    bottomSheet.classList.add("active");
  }, 10);

  // Handle overlay click
  const overlay = bottomSheet.querySelector(".bottom-sheet-overlay");
  overlay.addEventListener("click", () => {
    closeBottomSheet(bottomSheet);
  });

  // Handle cancel button
  const cancelBtn = bottomSheet.querySelector(".btn-logout-cancel");
  cancelBtn.addEventListener("click", () => {
    closeBottomSheet(bottomSheet);
  });

  // Handle confirm button
  const confirmBtn = bottomSheet.querySelector(".btn-logout-confirm");
  confirmBtn.addEventListener("click", async () => {
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Đang đăng xuất...";

      await authService.logout();

      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);

      closeBottomSheet(bottomSheet);

      setTimeout(() => {
        window.location.hash = "#/login";
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.");
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Đăng xuất";
    }
  });
}

function closeBottomSheet(bottomSheet) {
  bottomSheet.classList.remove("active");
  setTimeout(() => {
    bottomSheet.remove();
  }, 300);
}
