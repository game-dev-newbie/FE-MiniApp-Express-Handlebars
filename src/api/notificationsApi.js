// src/api/notificationsApi.js
import { httpGet, httpPatch, httpDelete } from "./httpClient.js";

// ===== NOTIFICATIONS APIs =====

/**
 * Notification types enum
 */
export const NotificationType = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_CHECKED_IN: "BOOKING_CHECKED_IN",
  BOOKING_PAYMENT_SUCCESS: "BOOKING_PAYMENT_SUCCESS",
  BOOKING_PAYMENT_FAILED: "BOOKING_PAYMENT_FAILED",
  BOOKING_REFUND_SUCCESS: "BOOKING_REFUND_SUCCESS",
};

/**
 * Get list of my notifications
 * @param {Object} params - Query parameters
 * @param {string} params.read_status - all | read | unread
 * @param {string} params.type - Notification type (see NotificationType enum)
 * @param {string} params.from_time - Start time (optional)
 * @param {string} params.to_time - End time (optional)
 * @param {number} params.limit - Number of records
 * @param {number} params.offset - Offset for pagination
 * @returns {Promise} API response with notifications list
 * @example
 * Response: {
 *   items: [{
 *     id, user_id, restaurant_id,
 *     type, title, message,
 *     target_type, target_id,
 *     is_read, created_at
 *   }],
 *   pagination: { total, limit, offset }
 * }
 */
export async function getMyNotifications(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(`/api/v1/miniapp/notifications${q}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Get unread notifications count
 * @returns {Promise} API response with unread count
 * @example
 * Response: { success: true, data: { unread_count: 3 } }
 */
export async function getUnreadCount() {
  try {
    const response = await httpGet("/api/v1/miniapp/notifications/unread-count");
    // Parse nested structure: response.data.unread_count
    const unreadCount = response?.data?.unread_count ?? 0;
    console.log("📬 [API] Unread count response:", { response, unreadCount });
    return { unreadCount };
  } catch (error) {
    console.warn("⚠️ Notifications API not available (backend offline):", error.message);
    // Return default value instead of throwing - allows app to work without backend
    return { unreadCount: 0 };
  }
}

/**
 * Mark notification as read
 * @param {number|string} notificationId - Notification ID
 * @returns {Promise} API response
 * @example
 * Response: {
 *   id, is_read: true, updated_at
 * }
 */
export async function markAsRead(notificationId) {
  try {
    const response = await httpPatch(
      `/api/v1/miniapp/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking notification ${notificationId} as read:`,
      error
    );
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise} API response
 * @example
 * Response: { affected_rows: 5 }
 */
export async function markAllAsRead() {
  try {
    const response = await httpPatch("/api/v1/miniapp/notifications/read-all", {});
    return response.data;
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
}

/**
 * Delete all read notifications
 * @returns {Promise} API response
 * @example
 * Response: { deleted_rows: 3 }
 */
export async function deleteAllRead() {
  try {
    const response = await httpDelete("/api/v1/miniapp/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error deleting all read notifications:", error);
    throw error;
  }
}
