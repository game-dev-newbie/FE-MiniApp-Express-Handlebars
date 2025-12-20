// src/utils/notificationHelper.js

// Create a notification for booking status change
export function createBookingNotification(
  booking,
  status,
  cancelReason = null
) {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );

  let title, message;

  switch (status) {
    case "CONFIRMED":
      title = "Đặt bàn đã được xác nhận!";
      message = `Đặt bàn tại ${booking.restaurantName || "nhà hàng"} vào ${
        booking.date
      } lúc ${
        booking.time
      } đã được xác nhận. Chúc bạn có trải nghiệm tuyệt vời!`;
      break;
    case "CHECKED_IN":
      title = "Bạn đã check-in thành công!";
      message = `Bạn đã check-in tại ${
        booking.restaurantName || "nhà hàng"
      }. Hãy đánh giá trải nghiệm của bạn sau bữa ăn!`;
      break;
    case "CANCELLED":
      title = "Đặt bàn bị hủy";
      message = `Đặt bàn tại ${
        booking.restaurantName || "nhà hàng"
      } đã bị hủy. ${
        cancelReason
          ? `Lý do: ${cancelReason}`
          : "Vui lòng liên hệ nhà hàng để biết thêm chi tiết."
      }`;
      break;
    case "REMINDER":
      title = "Nhắc nhở đặt bàn!";
      message = `Đặt bàn của bạn tại ${booking.restaurantName || "nhà hàng"} sẽ bắt đầu trong 30 phút nữa (lúc ${booking.time}). Chuẩn bị khởi hành thôi!`;
      break;
    default:
      title = "Thông báo đặt bàn";
      message = `Trạng thái đặt bàn của bạn đã được cập nhật.`;
  }

  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookingId: booking.id,
    status: status,
    title: title,
    message: message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  notifications.unshift(notification);

  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }

  localStorage.setItem("dinelink_notifications", JSON.stringify(notifications));

  console.log(`🔔 Notification created: ${notification.title}`);

  // Update badge
  updateNotificationBadge();

  // Dispatch event for UI to update and show popup
  window.dispatchEvent(
    new CustomEvent("notificationReceived", {
      detail: notification,
    })
  );

  return notification;
}

// Get unread notification count
export function getUnreadCount() {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );
  return notifications.filter((n) => !n.isRead).length;
}

// Update notification badge in UI
export function updateNotificationBadge() {
  const unreadCount = getUnreadCount();
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

// Receive notification from backend (called when backend pushes notification)
export function receiveBackendNotification(notificationData) {
  const notifications = JSON.parse(
    localStorage.getItem("dinelink_notifications") || "[]"
  );

  const notification = {
    id: notificationData.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookingId: notificationData.bookingId,
    type: notificationData.type || notificationData.status,
    status: notificationData.status,
    title: notificationData.title,
    message: notificationData.message,
    createdAt: notificationData.createdAt || new Date().toISOString(),
    isRead: false,
  };

  notifications.unshift(notification);

  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }

  localStorage.setItem("dinelink_notifications", JSON.stringify(notifications));

  // Update badge
  updateNotificationBadge();

  // Dispatch event for UI to update
  window.dispatchEvent(
    new CustomEvent("notificationReceived", {
      detail: notification,
    })
  );

  console.log(`🔔 Notification received from backend: ${notification.title}`);

  return notification;
}

// Poll for new notifications from backend
let pollIntervalId = null;

export function startNotificationPolling(intervalMs = 60000) {
  // Poll every 60 seconds by default
  if (pollIntervalId) {
    console.log("⚠️ Notification polling already started");
    return;
  }

  console.log(`🔔 Starting notification polling (every ${intervalMs / 1000}s)`);

  pollIntervalId = setInterval(async () => {
    try {
      const token = localStorage.getItem("dinelink_access_token");
      if (!token) {
        console.log("No auth token, skipping notification poll");
        return;
      }

      // Get last notification timestamp
      const notifications = JSON.parse(
        localStorage.getItem("dinelink_notifications") || "[]"
      );
      const lastTimestamp = notifications[0]?.createdAt || new Date(0).toISOString();

      // Call backend API to get new notifications
      const response = await fetch(
        `https://pyramidally-unborrowed-cherie.ngrok-free.dev/notifications?since=${lastTimestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.data || data;

        // Process each new notification
        if (Array.isArray(newNotifications) && newNotifications.length > 0) {
          newNotifications.forEach((notif) => {
            receiveBackendNotification(notif);
          });
          console.log(`🔔 Received ${newNotifications.length} new notification(s)`);
        }
      }
    } catch (error) {
      console.error("Error polling notifications:", error);
    }
  }, intervalMs);
}

export function stopNotificationPolling() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
    console.log("🔕 Notification polling stopped");
  }
}

// Test function to manually create a notification (for development/testing)
export function createTestNotification() {
  const testNotification = {
    id: `test_${Date.now()}`,
    bookingId: Math.floor(Math.random() * 1000),
    type: "REMINDER",
    status: "REMINDER",
    title: "🧪 Test Notification",
    message: "Đây là thông báo test để kiểm tra real-time update. Nếu bạn thấy notification này xuất hiện ngay lập tức, hệ thống đang hoạt động tốt!",
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  console.log("🧪 Creating test notification:", testNotification);
  
  receiveBackendNotification(testNotification);
  
  return testNotification;
}

// Make it available globally for testing in console
if (typeof window !== 'undefined') {
  window.createTestNotification = createTestNotification;
}
