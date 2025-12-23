// src/views/profileView.js
import { renderTemplate } from "../core/templates.js";
import {
  users,
  bookings,
  reviews,
  getUserFavoriteIds,
} from "../data/mockData.js";
import authService from "../utils/authService.js";
import { DEFAULT_AVATAR } from "../utils/avatarHelper.js";

const appEl = document.getElementById("app");

// Function to get real-time statistics from APIs
async function getProfileStats() {
  const currentUser = authService.getUser();
  if (!currentUser) return { bookings: 0, reviews: 0, favorites: 0 };

  try {
    // Fetch data from APIs in parallel
    const [bookingsResponse, reviewsResponse, favoritesResponse] = await Promise.all([
      // Get bookings from history (COMPLETED/CHECKED_IN status)
      import("../api/bookingApi.js").then(({ getMyBookings }) => 
        getMyBookings().catch(() => ({ items: [] }))
      ),
      // Get user reviews
      import("../api/reviewApi.js").then(({ getMyReviews }) => 
        getMyReviews().catch(() => ({ items: [] }))
      ),
      // Get favorites
      import("../api/favoritesApi.js").then(({ getMyFavorites }) => 
        getMyFavorites().catch(() => ({ items: [] }))
      ),
    ]);

    // Count ALL bookings (not just history)
    const allBookings = bookingsResponse?.items || [];

    const stats = {
      bookings: allBookings.length,  // All bookings
      reviews: (reviewsResponse?.items || []).length,
      favorites: (favoritesResponse?.items || []).length,
    };

    console.log("📊 Profile stats from API:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return { bookings: 0, reviews: 0, favorites: 0 };
  }
}

export async function renderProfile() {
  // Check authentication before allowing access to profile
  if (!authService.requireAuth("#/profile")) {
    return;
  }

  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "profile" });

  // Show loading state
  appEl.innerHTML = `
    <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div class="spinner"></div>
    </div>
  ` + bottomNavHtml;

  try {
    // Fetch user profile from API
    const { getMyProfile } = await import("../api/userApi.js");
    const userData = await getMyProfile();

    console.log("👤 User profile from API:", userData);

    // Transform API data to match template format
    const user = {
      id: userData.id,
      name: userData.display_name || "User",
      email: userData.email || "",
      phone: userData.phone || "",
      avatar: userData.avatar_url || DEFAULT_AVATAR
    };

    // Get current theme
    const currentTheme = localStorage.getItem("dinelink_theme") || "light";

    // Show loading stats first
    const contentHtml = renderTemplate("profile", {
      user: user,
      stats: { bookings: "...", reviews: "...", favorites: "..." },
      isLightMode: currentTheme === "light",
    });

    appEl.innerHTML = contentHtml + bottomNavHtml;

    // Initialize event listeners
    initProfileEventListeners();

    // Setup real-time update listeners
    setupProfileUpdateListeners();

    // Fetch and update stats from API
    const stats = await getProfileStats();
    updateStatsInDOM(stats);
  } catch (error) {
    console.error("Error loading profile:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p>Không thể tải thông tin cá nhân. Vui lòng thử lại.</p>
        <button onclick="location.reload()" class="btn-primary">Tải lại</button>
      </div>
    ` + bottomNavHtml;
  }
}

// Function to update stats in DOM without full re-render
function updateStatsInDOM(stats) {
  if (!stats) return;

  const statItems = document.querySelectorAll(".stat-item");
  if (statItems.length >= 3) {
    statItems[0].querySelector(".stat-value").textContent = stats.bookings;
    statItems[1].querySelector(".stat-value").textContent = stats.reviews;
    statItems[2].querySelector(".stat-value").textContent = stats.favorites;
  }
}

// Setup event listeners for real-time updates
function setupProfileUpdateListeners() {
  // Listen for user data updates (name, avatar, phone)
  const userDataListener = (event) => {
    const updatedUser = event.detail;
    // Update user info in DOM
    const profileAvatar = document.querySelector(".avatar-image-large");
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");

    if (profileAvatar && updatedUser.avatar_url) {
      profileAvatar.src = updatedUser.avatar_url;
      // Add smooth transition effect
      profileAvatar.style.opacity = "0.5";
      setTimeout(() => {
        profileAvatar.style.opacity = "1";
      }, 100);
    }
    if (profileName && updatedUser.display_name) {
      profileName.textContent = updatedUser.display_name;
    }
    if (profileEmail && updatedUser.email) {
      profileEmail.textContent = updatedUser.email;
    }

    console.log("✅ Profile UI updated:", updatedUser.display_name);
  };
  window.addEventListener("userDataUpdated", userDataListener);

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
      window.removeEventListener("userDataUpdated", userDataListener);
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
