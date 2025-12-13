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
      title = "✅ Đặt bàn đã được xác nhận!";
      message = `Đặt bàn tại ${booking.restaurantName || "nhà hàng"} vào ${
        booking.date
      } lúc ${
        booking.time
      } đã được xác nhận. Chúc bạn có trải nghiệm tuyệt vời!`;
      break;
    case "CHECKED_IN":
      title = "🎉 Bạn đã check-in thành công!";
      message = `Bạn đã check-in tại ${
        booking.restaurantName || "nhà hàng"
      }. Hãy đánh giá trải nghiệm của bạn sau bữa ăn!`;
      break;
    case "CANCELLED":
      title = "❌ Đặt bàn bị hủy";
      message = `Đặt bàn tại ${booking.restaurantName || "nhà hàng"} đã bị hủy. ${
        cancelReason
          ? `Lý do: ${cancelReason}`
          : "Vui lòng liên hệ nhà hàng để biết thêm chi tiết."
      }`;
      break;
    default:
      title = "📬 Thông báo đặt bàn";
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

  console.log(`📬 Notification created: ${notification.title}`);

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
