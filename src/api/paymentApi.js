// src/api/paymentApi.js
import { httpPost } from "./httpClient.js";

// ===== PAYMENT APIs =====

/**
 * Pay deposit for booking
 * @param {number|string} bookingId - Booking ID
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.provider - Payment provider: ZALOPAY | MOMO | VNPAY | CARD (required)
 * @param {string} paymentData.mock_result - Test only: SUCCESS | FAILED (optional)
 * @returns {Promise} API response with payment result
 * @example
 * Response: {
 *   id: 101,
 *   payment_status: "PAID",
 *   payment_status_label: "Đã thanh toán",
 *   payment_provider: "ZALOPAY",
 *   payment_reference: "PAY-101-1703123456789",
 *   paid_at: "2025-12-20 17:00:00",
 *   deposit_amount: 50000,
 *   updated_at: "2025-12-20 17:00:00"
 * }
 *
 * Side Effects:
 * - Update payment_status = PAID
 * - Save payment_reference (transaction ID)
 * - Save paid_at (timestamp)
 * - Send notification to customer
 * - Send notification to restaurant
 * - Send confirmation email
 *
 * Error Cases:
 * - 400: Booking doesn't require deposit
 * - 400: Already paid
 *
 * @example Usage in production
 * ```javascript
 * async function handlePayment(bookingId) {
 *   try {
 *     const result = await payDeposit(bookingId, {
 *       provider: "ZALOPAY",
 *       // Remove mock_result in production
 *     });
 *
 *     if (result.payment_status === "PAID") {
 *       showToast("Thanh toán thành công!");
 *       navigateTo(`/bookings/${bookingId}`);
 *       // User will receive email confirmation
 *     }
 *   } catch (error) {
 *     showToast("Thanh toán thất bại");
 *   }
 * }
 * ```
 */
export async function payDeposit(bookingId, paymentData) {
  try {
    const response = await httpPost(
      `/api/v1/miniapp/bookings/${bookingId}/pay-deposit`,
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error(`Error paying deposit for booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Payment providers enum for reference
 */
export const PaymentProvider = {
  ZALOPAY: "ZALOPAY",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  CARD: "CARD",
};

/**
 * Mock result enum for testing
 */
export const MockPaymentResult = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};
