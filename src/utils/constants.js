// src/utils/constants.js

/**
 * Booking Status Definitions
 * Trạng thái của booking trong hệ thống
 */
export const BookingStatus = {
  PENDING: "PENDING", // Chờ xác nhận
  CONFIRMED: "CONFIRMED", // Đã xác nhận
  CANCELLED: "CANCELLED", // Đã hủy
  COMPLETED: "COMPLETED", // Đã hoàn thành
  NO_SHOW: "NO_SHOW", // Khách không đến
};

/**
 * Payment Status Definitions
 * Trạng thái thanh toán của booking
 */
export const PaymentStatus = {
  NONE: "NONE", // Không yêu cầu cọc
  PENDING: "PENDING", // Chờ thanh toán
  PAID: "PAID", // Đã thanh toán
  FAILED: "FAILED", // Thanh toán thất bại
  REFUNDED: "REFUNDED", // Đã hoàn tiền
};

/**
 * Table Status Definitions
 * Trạng thái của bàn trong nhà hàng
 */
export const TableStatus = {
  ACTIVE: "ACTIVE", // Đang hoạt động
  INACTIVE: "INACTIVE", // Không hoạt động
};

/**
 * Restaurant Account Status Definitions
 * Trạng thái tài khoản nhà hàng
 */
export const RestaurantAccountStatus = {
  INVITED: "INVITED", // Chờ phê duyệt (staff only)
  ACTIVE: "ACTIVE", // Đang hoạt động
  REJECTED: "REJECTED", // Bị từ chối (staff only)
};

/**
 * Notification Type Definitions
 * Các loại thông báo trong hệ thống
 */
export const NotificationType = {
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED", // Booking được xác nhận
  BOOKING_CANCELLED: "BOOKING_CANCELLED", // Booking bị hủy
  BOOKING_REMINDER: "BOOKING_REMINDER", // Nhắc nhở booking
  BOOKING_UPDATED: "BOOKING_UPDATED", // Booking được cập nhật
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS", // Thanh toán thành công
  PAYMENT_FAILED: "PAYMENT_FAILED", // Thanh toán thất bại
  REFUND_SUCCESS: "REFUND_SUCCESS", // Hoàn tiền thành công
};

/**
 * Payment Provider Definitions
 * Các nhà cung cấp thanh toán
 */
export const PaymentProvider = {
  ZALOPAY: "ZALOPAY",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  BANK_TRANSFER: "BANK_TRANSFER",
};

/**
 * Mock Payment Result (for testing)
 * Kết quả thanh toán giả lập
 */
export const MockPaymentResult = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

/**
 * Booking Category Filters
 * Các bộ lọc danh mục booking
 */
export const BookingCategory = {
  ALL: "all", // Tất cả
  UPCOMING: "upcoming", // Sắp tới (PENDING/CONFIRMED)
  HISTORY: "history", // Lịch sử (COMPLETED)
  CANCELLED: "cancelled", // Đã hủy (CANCELLED)
};

/**
 * HTTP Error Codes
 * Mã lỗi HTTP phổ biến từ backend
 */
export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED", // 401 - Chưa đăng nhập hoặc token hết hạn
  FORBIDDEN: "FORBIDDEN", // 403 - Không có quyền truy cập
  BAD_REQUEST: "BAD_REQUEST", // 400 - Dữ liệu không hợp lệ
  NOT_FOUND: "NOT_FOUND", // 404 - Tài nguyên không tồn tại
  CONFLICT: "CONFLICT", // 409 - Xung đột dữ liệu (email đã tồn tại, etc.)
  INTERNAL_ERROR: "INTERNAL_ERROR", // 500 - Lỗi server
};

/**
 * Email Event Types
 * Các sự kiện tự động gửi email
 */
export const EmailEventType = {
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS", // Thanh toán thành công
  PAYMENT_FAILED: "PAYMENT_FAILED", // Thanh toán thất bại
  REFUND_SUCCESS: "REFUND_SUCCESS", // Hoàn tiền thành công
  BOOKING_REMINDER_24H: "BOOKING_REMINDER_24H", // Nhắc nhở 24h trước
  BOOKING_REMINDER_2H: "BOOKING_REMINDER_2H", // Nhắc nhở 2h trước
};

/**
 * Helper function to get booking status label
 * @param {string} status - Booking status code
 * @returns {string} Human-readable status label
 */
export function getBookingStatusLabel(status) {
  const labels = {
    [BookingStatus.PENDING]: "Chờ xác nhận",
    [BookingStatus.CONFIRMED]: "Đã xác nhận",
    [BookingStatus.CANCELLED]: "Đã hủy",
    [BookingStatus.COMPLETED]: "Đã hoàn thành",
    [BookingStatus.NO_SHOW]: "Khách không đến",
  };
  return labels[status] || status;
}

/**
 * Helper function to get payment status label
 * @param {string} status - Payment status code
 * @returns {string} Human-readable status label
 */
export function getPaymentStatusLabel(status) {
  const labels = {
    [PaymentStatus.NONE]: "Không yêu cầu cọc",
    [PaymentStatus.PENDING]: "Chờ thanh toán",
    [PaymentStatus.PAID]: "Đã thanh toán",
    [PaymentStatus.FAILED]: "Thanh toán thất bại",
    [PaymentStatus.REFUNDED]: "Đã hoàn tiền",
  };
  return labels[status] || status;
}

/**
 * Helper function to check if booking can be edited
 * @param {string} status - Booking status
 * @returns {boolean}
 */
export function canEditBooking(status) {
  return status === BookingStatus.PENDING;
}

/**
 * Helper function to check if booking can be cancelled
 * @param {string} status - Booking status
 * @returns {boolean}
 */
export function canCancelBooking(status) {
  return (
    status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED
  );
}

/**
 * Helper function to check if booking can be reviewed
 * @param {string} status - Booking status
 * @returns {boolean}
 */
export function canReviewBooking(status) {
  return status === BookingStatus.COMPLETED;
}
