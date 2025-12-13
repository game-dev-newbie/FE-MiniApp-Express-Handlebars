// src/views/notificationView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";

const appEl = document.getElementById("app");

export async function renderNotifications() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });
  const contentHtml = renderTemplate("notifications", {});

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Load and render notifications
  loadNotifications();

  // Initialize event listeners
  initNotificationEventListeners();
}

function loadNotifications() {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );
  const notificationsList = document.getElementById("notificationsList");

  if (!notificationsList) return;

  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <h3>Chưa có thông báo</h3>
        <p>Bạn sẽ nhận được thông báo khi có cập nhật đặt bàn</p>
      </div>
    `;
    return;
  }

  // Sort by newest first
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const notificationsHtml = notifications
    .map((notification) => {
      // Determine icon based on status
      let iconClass = "success";
      let icon = "";

      switch (notification.status) {
        case "CONFIRMED":
          iconClass = "success";
          icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <polyline points="20 6 9 17 4 12"></polyline>
           </svg>`;
          break;
        case "CHECKED_IN":
          iconClass = "success";
          icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
             <polyline points="22 4 12 14.01 9 11.01"></polyline>
           </svg>`;
          break;
        case "CANCELLED":
          iconClass = "error";
          icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
           </svg>`;
          break;
        default:
          iconClass = "info";
          icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="10"></circle>
             <line x1="12" y1="16" x2="12" y2="12"></line>
             <line x1="12" y1="8" x2="12.01" y2="8"></line>
           </svg>`;
      }

      return `
      <div class="notification-item ${
        notification.isRead ? "" : "unread"
      }" data-id="${notification.id}">
        <div class="notification-icon ${iconClass}">
          ${icon}
        </div>
        <div class="notification-content">
          <h3 class="notification-title">${notification.title}</h3>
          <p class="notification-message">${notification.message}</p>
          <span class="notification-time">${formatTime(
            notification.createdAt
          )}</span>
        </div>
        ${!notification.isRead ? '<div class="unread-dot"></div>' : ""}
      </div>
    `;
    })
    .join("");

  notificationsList.innerHTML = `<div class="notifications-list">${notificationsHtml}</div>`;

  // Add click listeners to mark as read
  const items = notificationsList.querySelectorAll(".notification-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      markAsRead(id);
      item.classList.remove("unread");
      const dot = item.querySelector(".unread-dot");
      if (dot) dot.remove();
      updateNotificationBadge();
    });
  });
}

function markAsRead(notificationId) {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    localStorage.setItem(
      "dinelink_notifications",
      JSON.stringify(notifications)
    );
  }
}

function initNotificationEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.location.hash = "#/";
    });
  }

  // Clear all button
  const btnClearAll = document.getElementById("btnClearAll");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
        localStorage.setItem("dinelink_notifications", "[]");
        loadNotifications();
        updateNotificationBadge();
        if (navigator.vibrate) navigator.vibrate(10);
      }
    });
  }

  // Bottom navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");
      if (navigator.vibrate) navigator.vibrate(10);
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

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Update notification badge count
export function updateNotificationBadge() {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Update badge in bottom nav if exists
  const notificationBadges = document.querySelectorAll(".notification-badge");
  notificationBadges.forEach((badge) => {
    if (unreadCount > 0) {
      badge.style.display = "flex";
      badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    } else {
      badge.style.display = "none";
    }
  });
}
