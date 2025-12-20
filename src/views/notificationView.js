// src/views/notificationView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderNotifications() {
  // Require authentication
  if (!authService.requireAuth("#/notifications")) {
    return;
  }

  console.log("📄 Rendering notifications page...");

  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "home" });
  const contentHtml = renderTemplate("notifications", {});

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Load and render notifications
  loadNotifications();

  // Initialize event listeners
  initNotificationEventListeners();

  console.log("✅ Notifications page rendered and listeners initialized");
}

function loadNotifications(highlightNewId = null) {
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
      let iconSvg = "";

      if (notifType === "booking_confirmed" || notifType === "CONFIRMED") {
        typeClass = "notification-confirmed";
        iconSvg = `
          <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `;
      } else if (
        notifType === "booking_cancelled" ||
        notifType === "CANCELLED"
      ) {
        typeClass = "notification-cancelled";
        iconSvg = `
          <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
      } else if (notifType === "CHECKED_IN") {
        typeClass = "notification-checkedin";
        iconSvg = `
          <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        `;
      } else if (notifType === "REMINDER") {
        typeClass = "notification-reminder";
        iconSvg = `
          <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        `;
      } else {
        iconSvg = `
          <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        `;
      }

      return `
      <div class="notification-item ${typeClass} ${
        notification.isRead === true || notification.read === true
          ? ""
          : "unread"
      } ${
        highlightNewId === notification.id ? "new-item-highlight" : ""
      }" data-id="${notification.id}">
        ${
          !(notification.isRead === true || notification.read === true)
            ? '<div class="unread-dot"></div>'
            : ""
        }
        <div class="notification-icon-wrapper">
          ${iconSvg}
        </div>
        <div class="notification-content">
          <h3 class="notification-title">${notification.title}</h3>
          <p class="notification-message">${notification.message}</p>
          <span class="notification-time">${formatTime(
            notification.timestamp || notification.createdAt
          )}</span>
        </div>
      </div>
    `;
    })
    .join("");

  notificationsList.innerHTML = `<div class="notifications-list">${notificationsHtml}</div>`;

  // Scroll to new item if exists
  if (highlightNewId) {
    setTimeout(() => {
      const newItem = document.querySelector(`[data-id="${highlightNewId}"]`);
      if (newItem) {
        newItem.scrollIntoView({ behavior: "smooth", block: "start" });
        // Remove highlight after animation
        setTimeout(() => {
          newItem.classList.remove("new-item-highlight");
        }, 3000);
      }
    }, 100);
  }

  // Add click listeners to mark as read and toggle expand
  const items = notificationsList.querySelectorAll(".notification-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");

      // Toggle expanded state
      item.classList.toggle("expanded");

      // Mark as read
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
      notifications.forEach((n) => {
        n.isRead = true;
        n.read = true;
      });
      localStorage.setItem(
        "dinelink_notifications",
        JSON.stringify(notifications)
      );
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

  // Listen for new notifications from backend
  const handleNotificationReceived = (event) => {
    const notification = event.detail;
    console.log(
      "🔔 [NotificationView] Received notification event:",
      notification
    );

    // Reload notifications list with highlight for new item
    loadNotifications(notification.id);
    updateNotificationBadge();

    // Show toast for new notification
    showNewNotificationToast(notification);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  console.log(
    "👂 [NotificationView] Registering listener for 'notificationReceived' event"
  );
  window.addEventListener("notificationReceived", handleNotificationReceived);

  // Cleanup listener when page changes
  const cleanupListener = () => {
    console.log("🧹 [NotificationView] Cleaning up notification listener");
    window.removeEventListener(
      "notificationReceived",
      handleNotificationReceived
    );
    window.removeEventListener("hashchange", cleanupListener);
  };

  window.addEventListener("hashchange", cleanupListener, { once: true });
}

// Show toast for new notification
function showNewNotificationToast(notification) {
  const toast = document.createElement("div");
  toast.className = "new-notification-toast";
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">${notification.title || "Thông báo mới"}</div>
      <div class="toast-message">${
        notification.message?.substring(0, 50) || ""
      }...</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
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
  const unreadCount = notifications.filter(
    (n) => !(n.isRead === true || n.read === true)
  ).length;

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
