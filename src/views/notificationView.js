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
      // Determine notification type for color coding
      const notifType = notification.type || notification.status || "";
      let typeClass = "";
      
      if (notifType === "booking_confirmed" || notifType === "CONFIRMED") {
        typeClass = "notification-confirmed";
      } else if (notifType === "booking_cancelled" || notifType === "CANCELLED") {
        typeClass = "notification-cancelled";
      } else if (notifType === "CHECKED_IN") {
        typeClass = "notification-checkedin";
      }

      return `
      <div class="notification-item ${typeClass} ${
        (notification.isRead === true || notification.read === true) ? "" : "unread"
      }" data-id="${notification.id}">
        <div class="notification-content">
          <h3 class="notification-title">${notification.title}</h3>
          <p class="notification-message">${notification.message}</p>
          <span class="notification-time">${formatTime(
            notification.timestamp || notification.createdAt
          )}</span>
        </div>
        ${!(notification.isRead === true || notification.read === true) ? '<div class="unread-dot"></div>' : ""}
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
    notification.read = true;
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

  // Clear all button with mobile-optimized confirmation
  const btnClearAll = document.getElementById("btnClearAll");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", () => {
      showDeleteAllConfirmation();
    });
  }
  // Mark all as read button
  const btnMarkAllRead = document.getElementById("btnMarkAllRead");
  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener("click", () => {
      const notifications = JSON.parse(
        localStorage.getItem("dinelink_notifications") || "[]"
      );
      notifications.forEach(n => {
        n.isRead = true;
        n.read = true;
      });
      localStorage.setItem("dinelink_notifications", JSON.stringify(notifications));
      loadNotifications();
      updateNotificationBadge();
      if (navigator.vibrate) navigator.vibrate(10);
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
  const unreadCount = notifications.filter((n) => !(n.isRead === true || n.read === true)).length;

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

// Show mobile-optimized delete all confirmation
function showDeleteAllConfirmation() {
  const modal = document.createElement("div");
  modal.className = "delete-modal-overlay";
  modal.innerHTML = `
    <div class="delete-modal">
      <h3 class="delete-modal-title">Xóa tất cả thông báo</h3>
      <p class="delete-modal-message">Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.</p>
      <div class="delete-modal-actions">
        <button class="btn-cancel-delete">Hủy</button>
        <button class="btn-confirm-delete">Xóa tất cả</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  const btnCancel = modal.querySelector(".btn-cancel-delete");
  btnCancel.addEventListener("click", () => {
    closeModal(modal);
  });

  const btnConfirm = modal.querySelector(".btn-confirm-delete");
  btnConfirm.addEventListener("click", () => {
    localStorage.setItem("dinelink_notifications", "[]");
    loadNotifications();
    updateNotificationBadge();
    if (navigator.vibrate) navigator.vibrate(10);
    closeModal(modal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
}

function closeModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => modal.remove(), 300);
}
