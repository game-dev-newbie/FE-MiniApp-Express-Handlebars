// src/utils/notificationHelper.js

// Create a notification for booking status change
export function createBookingNotification(booking, status, cancelReason = null) {
  const notifications = JSON.parse(localStorage.getItem("dinelink_notifications") || "[]");
  
  const isConfirmed = status === "CONFIRMED";
  const notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    bookingId: booking.id,
    status: status,
    title: isConfirmed 
      ? "✅ Đặt bàn đã được xác nhận!" 
      : "❌ Đặt bàn bị hủy",
    message: isConfirmed
      ? `Đặt bàn tại ${booking.restaurantName || 'nhà hàng'} vào ${booking.date} lúc ${booking.time} đã được xác nhận. Chúc bạn có trải nghiệm tuyệt vời!`
      : `Đặt bàn tại ${booking.restaurantName || 'nhà hàng'} đã bị hủy. ${cancelReason ? `Lý do: ${cancelReason}` : 'Vui lòng liên hệ nhà hàng để biết thêm chi tiết.'}`,
    createdAt: new Date().toISOString(),
    isRead: false
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
  const notifications = JSON.parse(localStorage.getItem("dinelink_notifications") || "[]");
  return notifications.filter(n => !n.isRead).length;
}

// Update notification badge in UI
export function updateNotificationBadge() {
  const unreadCount = getUnreadCount();
  const notificationBadges = document.querySelectorAll('.notification-badge');
  
  notificationBadges.forEach(badge => {
    if (unreadCount > 0) {
      badge.style.display = 'flex';
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    } else {
      badge.style.display = 'none';
    }
  });
}
