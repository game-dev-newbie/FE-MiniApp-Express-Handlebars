// src/api/bookingApi.js
import { httpGet, httpPost, httpPatch } from "./httpClient.js";

// ===== BOOKING FLOW APIs =====

/**
 * Get available tables for booking
 * @param {Object} params - Query parameters (all required)
 * @param {number} params.restaurant_id - Restaurant ID
 * @param {string} params.booking_date - Booking date YYYY-MM-DD
 * @param {string} params.booking_time - Booking time HH:mm
 * @param {number} params.people_count - Number of people
 * @returns {Promise} API response with available tables
 * @example
 * Response: {
 *   items: [{
 *     id, name, capacity, location, status,
 *     view_image_url, view_note, is_available
 *   }]
 * }
 * Business Logic:
 * - Only tables with capacity >= people_count
 * - Only status = ACTIVE
 * - No conflicting bookings at that time
 */
export async function getAvailableTables(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await httpGet(
      `/api/v1/miniapp/bookings/available-tables?${query}`
    );
    return response?.data || { items: [] };
  } catch (error) {
    console.error("Error fetching available tables:", error);
    return { items: [] };
  }
}

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @param {number} bookingData.restaurant_id - Restaurant ID (required)
 * @param {number} bookingData.table_id - Table ID from available-tables (required)
 * @param {string} bookingData.phone - Customer phone (required)
 * @param {string} bookingData.customer_name - Customer name (required)
 * @param {number} bookingData.people_count - Number of people min: 1 (required)
 * @param {string} bookingData.booking_date - Booking date YYYY-MM-DD (required)
 * @param {string} bookingData.booking_time - Booking time HH:mm (required)
 * @param {string} bookingData.note - Optional note
 * @returns {Promise} API response with created booking
 * @example
 * Response: {
 *   id, restaurant_id, table_id, user_id,
 *   phone, customer_name, people_count,
 *   booking_time: "2025-12-25 19:00:00",
 *   status: "PENDING",
 *   status_label: "Chờ xác nhận",
 *   deposit_amount: 50000,
 *   payment_status: "PENDING",
 *   payment_status_label: "Chờ thanh toán",
 *   note, created_at, updated_at
 * }
 *
 * Side Effects:
 * - Auto calculate deposit_amount from restaurant.default_deposit_amount
 * - Set payment_status = PENDING if deposit required
 * - Set payment_status = NONE if no deposit
 * - Send notification to customer
 * - Send notification to restaurant (dashboard)
 *
 * Error Cases:
 * - 400: Table already booked
 * - 400: Cannot book in the past
 * - 400: Table capacity insufficient
 */
export async function createBooking(bookingData) {
  try {
    const response = await httpPost("/api/v1/miniapp/bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Get list of user's bookings
 * @param {Object} params - Query parameters
 * @param {string} params.category - upcoming | history | cancelled | all (default: all)
 * @param {number} params.limit - Number of records
 * @param {number} params.offset - Offset for pagination
 * @returns {Promise} API response with bookings list and pagination
 * @example
 * Response: {
 *   items: [{
 *     id, restaurant_id, table_id, people_count,
 *     phone, customer_name, booking_time,
 *     status, status_label,
 *     deposit_amount, payment_status, payment_status_label,
 *     note, created_at,
 *     restaurant: { id, name, address, phone, main_image_url },
 *     table: { id, name, capacity, location }
 *   }],
 *   pagination: { total, limit, offset }
 * }
 *
 * Category Filters:
 * - upcoming: Future + PENDING/CONFIRMED
 * - history: Past + COMPLETED
 * - cancelled: CANCELLED status
 * - all: All bookings
 */
export async function getMyBookings(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const q = query ? `?${query}` : "";
    const response = await httpGet(`/api/v1/miniapp/bookings${q}`);
    // Return empty array if data is null/undefined
    return response?.data || { items: [], pagination: { total: 0 } };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    // Return empty data instead of throwing
    return { items: [], pagination: { total: 0 } };
  }
}

/**
 * Get booking detail by ID
 * @param {number|string} bookingId - Booking ID
 * @returns {Promise} API response with booking detail
 * @example
 * Response: {
 *   id, restaurant_id, table_id, people_count,
 *   phone, customer_name, booking_time,
 *   status, status_label,
 *   deposit_amount, payment_status, payment_status_label,
 *   payment_provider, payment_reference, paid_at, refunded_at,
 *   note, created_at, updated_at,
 *   restaurant: { id, name, address, phone, main_image_url },
 *   table: { id, name, capacity, location, view_image_url }
 * }
 */
export async function getBookingDetail(bookingId) {
  try {
    const response = await httpGet(`/api/v1/miniapp/bookings/${bookingId}`);
    return response?.data || null;
  } catch (error) {
    console.error(`Error fetching booking detail for ID ${bookingId}:`, error);
    return null;
  }
}

/**
 * Update booking (only when status = PENDING)
 * @param {number|string} bookingId - Booking ID
 * @param {Object} updateData - Data to update (all optional)
 * @param {string} updateData.customer_name - Updated customer name
 * @param {string} updateData.phone - Updated phone
 * @param {number} updateData.people_count - Updated people count
 * @param {string} updateData.booking_date - Updated date YYYY-MM-DD
 * @param {string} updateData.booking_time - Updated time HH:mm
 * @param {number} updateData.table_id - Updated table ID
 * @param {string} updateData.note - Updated note
 * @returns {Promise} API response with updated booking
 * @example
 * Response: {
 *   id, customer_name, phone, people_count,
 *   booking_time, table_id, note, updated_at
 * }
 *
 * Business Logic:
 * - Only allow update when status = PENDING
 * - If time/table changed → Check conflict
 * - If people_count changed → Check capacity
 * - Send notification to restaurant
 *
 * Error Cases:
 * - 400: Can only edit PENDING bookings
 */
export async function updateBooking(bookingId, updateData) {
  try {
    const response = await httpPatch(
      `/api/v1/miniapp/bookings/${bookingId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Cancel booking (only when status = PENDING/CONFIRMED)
 * @param {number|string} bookingId - Booking ID
 * @returns {Promise} API response
 * @example
 * Response: {
 *   id, status: "CANCELLED",
 *   payment_status: "REFUNDED",
 *   refunded_at, updated_at
 * }
 *
 * Side Effects:
 * - If paid → Refund (payment_status = REFUNDED)
 * - Send notification + email to customer
 * - Send notification to restaurant
 *
 * Error Cases:
 * - 400: Cannot cancel COMPLETED or NO_SHOW bookings
 */
export async function cancelBooking(bookingId) {
  try {
    const response = await httpPatch(
      `/api/v1/miniapp/bookings/${bookingId}/cancel`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    throw error;
  }
}
