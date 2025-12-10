// src/views/notificationView.js
import { renderTemplate } from "../core/templates.js";
import { notifications, users } from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderNotifications() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });

  // Get user notifications
  const userNotifications = notifications
    .filter((n) => n.user_id === currentUser.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((n) => ({
      ...n,
      created_at: formatTime(n.created_at),
    }));

  const contentHtml = renderTemplate("notifications", {
    notifications: userNotifications,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initNotificationEventListeners();
}

function initNotificationEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.location.hash = "#/";
    });
  }

  // Mark all as read
  const btnMarkAllRead = document.getElementById("btnMarkAllRead");
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener("click", () => {
      const unreadItems = document.querySelectorAll(".notification-item.unread");
      unreadItems.forEach((item) => {
        item.classList.remove("unread");
        const dot = item.querySelector(".unread-dot");
        if (dot) dot.remove();
      });

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      alert("Đã đánh dấu tất cả là đã đọc!");
    });
  }

  // Notification item click
  const notificationItems = document.querySelectorAll(".notification-item");
  notificationItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.remove("unread");
      const dot = item.querySelector(".unread-dot");
      if (dot) dot.remove();

      const id = item.getAttribute("data-id");
      console.log("Notification clicked:", id);
    });
  });

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

// Format time helper
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN");
}
