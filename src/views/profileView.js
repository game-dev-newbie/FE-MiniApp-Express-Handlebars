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

export async function renderProfile() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "profile" });

  // Calculate stats
  const userBookings = bookings.filter((b) => b.user_id === currentUser.id);
  const userReviews = reviews.filter((r) => r.user_id === currentUser.id);
  const userFavorites = getUserFavoriteIds(currentUser.id);

  const stats = {
    bookings: userBookings.length,
    reviews: userReviews.length,
    favorites: userFavorites.length,
  };

  const contentHtml = renderTemplate("profile", {
    user: currentUser,
    stats,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initProfileEventListeners();
}

function initProfileEventListeners() {
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

  // Change password
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      alert("Chức năng đổi mật khẩu đang được phát triển!");
    });
  }

  // My bookings
  const myBookingsBtn = document.getElementById("myBookingsBtn");
  if (myBookingsBtn) {
    myBookingsBtn.addEventListener("click", () => {
      window.location.hash = "#/booking";
    });
  }

  // My reviews
  const myReviewsBtn = document.getElementById("myReviewsBtn");
  if (myReviewsBtn) {
    myReviewsBtn.addEventListener("click", () => {
      alert("Chức năng xem đánh giá đang được phát triển!");
    });
  }

  // My favorites
  const myFavoritesBtn = document.getElementById("myFavoritesBtn");
  if (myFavoritesBtn) {
    myFavoritesBtn.addEventListener("click", () => {
      window.location.hash = "#/favorites";
    });
  }

  // Help
  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      alert("Chức năng trợ giúp đang được phát triển!");
    });
  }

  // Settings
  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      alert("Chức năng cài đặt đang được phát triển!");
    });
  }

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
