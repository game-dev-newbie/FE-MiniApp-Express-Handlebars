// src/views/notificationView.js
import { renderTemplate } from "../core/templates.js";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead as markAsReadAPI,
  markAllAsRead as markAllAsReadAPI,
  deleteAllRead as deleteAllReadAPI
} from "../api/notificationsApi.js";
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

async function loadNotifications(highlightNewId = null) {
  const notificationsList = document.getElementById("notificationsList");
  if (!notificationsList) return;

  // Show loading
  notificationsList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải thông báo...</p>
    </div>
  `;

  try {
    // Fetch notifications from API
    const response = await getMyNotifications({
      read_status: 'all',
      limit: 50,
      offset: 0
    });

    const notifications = response?.items || [];

    console.log("📬 Fetched notifications from API:", notifications);

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

    const notificationsHtml = notifications
      .map((notification) => {
        // Map notification type to icon and style
        const notifType = notification.type || "";
        let typeClass = "";
        let iconSvg = "";

        // Map API notification types
        if (notifType === "BOOKING_CONFIRMED") {
          typeClass = "notification-confirmed";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          `;
        } else if (notifType === "BOOKING_CANCELLED") {
          typeClass = "notification-cancelled";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          `;
        } else if (notifType === "BOOKING_CHECKED_IN") {
          typeClass = "notification-checkedin";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          `;
        } else if (notifType === "BOOKING_CREATED") {
          typeClass = "notification-created";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          `;
        } else if (notifType === "BOOKING_PAYMENT_SUCCESS") {
          typeClass = "notification-payment-success";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          `;
        } else if (notifType === "BOOKING_PAYMENT_FAILED") {
          typeClass = "notification-payment-failed";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          `;
        } else if (notifType === "BOOKING_REFUND_SUCCESS") {
          typeClass = "notification-refund";
          iconSvg = `
            <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v6m0 6v6m9-9H3"></path>
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
          notification.is_read ? "" : "unread"
        } ${
          highlightNewId === notification.id ? "new-item-highlight" : ""
        }" data-id="${notification.id}">
          ${
            !notification.is_read
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
              notification.created_at
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

    // Add click listeners to mark as read
    const items = notificationsList.querySelectorAll(".notification-item");
    items.forEach((item) => {
      item.addEventListener("click", async () => {
        const id = item.getAttribute("data-id");

        // Toggle expanded state
        item.classList.toggle("expanded");

        // Mark as read via API (non-blocking)
        if (item.classList.contains("unread")) {
          // Update UI immediately for better UX
          item.classList.remove("unread");
          const dot = item.querySelector(".unread-dot");
          if (dot) dot.remove();
          
          // Call API in background (don't wait)
          markAsReadViaAPI(id).catch(err => {
            console.warn("Mark as read failed but UI updated:", err);
          });
          
          // Update badge
          updateNotificationBadge();
        }
      });
    });

  } catch (error) {
    console.error("Error loading notifications:", error);
    notificationsList.innerHTML = `
      <div class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3>Không thể tải thông báo</h3>
        <p>Vui lòng thử lại sau</p>
        <button class="btn-retry" onclick="location.reload()">Thử lại</button>
      </div>
    `;
  }
}

async function markAsReadViaAPI(notificationId) {
  try {
    await markAsReadAPI(notificationId);
  } catch (error) {
    console.error("Error marking as read:", error);
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
    btnMarkAllRead.addEventListener("click", async () => {
      try {
        await markAllAsReadAPI();
        loadNotifications();
        updateNotificationBadge();
        if (navigator.vibrate) navigator.vibrate(10);
      } catch (error) {
        console.error("Error marking all as read:", error);
        alert("Không thể đánh dấu đã đọc. Vui lòng thử lại.");
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
export async function updateNotificationBadge() {
  try {
    const response = await getUnreadCount();
    const unreadCount = response?.unreadCount || 0;

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
  } catch (error) {
    console.error("Error updating badge:", error);
  }
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
  btnConfirm.addEventListener("click", async () => {
    try {
      await deleteAllReadAPI();
      loadNotifications();
      updateNotificationBadge();
      if (navigator.vibrate) navigator.vibrate(10);
      closeModal(modal);
    } catch (error) {
      console.error("Error deleting notifications:", error);
      alert("Không thể xóa thông báo. Vui lòng thử lại.");
      closeModal(modal);
    }
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
