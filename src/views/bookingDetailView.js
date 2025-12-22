// src/views/bookingDetailView.js
import { renderTemplate } from "../core/templates.js";
import { getBookingDetail } from "../api/bookingApi.js";
import { BASE_URL } from "../api/httpClient.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderBookingDetail(bookingId) {
  // Check authentication
  if (!authService.requireAuth(`#/booking/detail/${bookingId}`)) {
    return;
  }

  // Show loading
  appEl.innerHTML = `
    <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    console.log(`📖 Fetching booking detail for ID: ${bookingId}`);
    
    // Fetch booking detail from API
    const booking = await getBookingDetail(bookingId);

    console.log("📦 Booking detail response:", booking);

    if (!booking) {
      alert("Không tìm thấy thông tin đặt bàn");
      window.location.hash = "#/booking";
      return;
    }

    // Process booking data to match template expectations
    const processedBooking = {
      id: booking.id,
      restaurantId: booking.restaurant_id,
      restaurantName: booking.Restaurant?.name || "Nhà hàng",
      restaurant_name: booking.Restaurant?.name || "Nhà hàng",
      restaurantAddress: booking.Restaurant?.address || "",
      restaurantPhone: booking.Restaurant?.phone || "",
      restaurantImage: booking.Restaurant?.main_image_url || "",
      tableName: booking.RestaurantTable?.name || "Chưa chọn bàn",
      table_name: booking.RestaurantTable?.name || "Chưa chọn bàn",
      tableCapacity: booking.RestaurantTable?.capacity || 0,
      tableLocation: booking.RestaurantTable?.location || "",
      people: booking.people_count,
      customerName: booking.customer_name,
      customerPhone: booking.phone, // Template expects customerPhone
      phone: booking.phone,
      date: booking.booking_time?.split(' ')[0] || "",
      time: booking.booking_time?.split(' ')[1] || "",
      booking_time: booking.booking_time,
      status: booking.status,
      status_label: booking.status_label,
      payment_status: booking.payment_status,
      payment_status_label: booking.payment_status_label,
      depositAmount: booking.deposit_amount,
      deposit_amount: booking.deposit_amount,
      payment_provider: booking.payment_provider,
      payment_reference: booking.payment_reference,
      paid_at: booking.paid_at,
      refunded_at: booking.refunded_at,
      note: booking.note,
      notes: booking.note, // Template might use 'notes'
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      tables: [booking.RestaurantTable?.name || "Chưa chọn bàn"], // For compatibility
      requireDeposit: booking.deposit_amount > 0, // For showing payment section
      paymentStatus: booking.payment_status_label || booking.payment_status,
    };

    // Helper function to build full image URL
    // Images don't go through Vite proxy, so we need to use the full backend URL
    const getFullImageUrl = (relativePath) => {
      if (!relativePath) return "";
      if (relativePath.startsWith("http")) return relativePath;
      // Use backend domain for images (not proxied)
      const BACKEND_URL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
      return `${BACKEND_URL}${relativePath}`;
    };

    // Create restaurant object
    const restaurant = {
      name: booking.Restaurant?.name || "Nhà hàng",
      address: booking.Restaurant?.address || "",
      phone: booking.Restaurant?.phone || "",
      image: getFullImageUrl(booking.Restaurant?.main_image_url),
      main_image_url: getFullImageUrl(booking.Restaurant?.main_image_url),
      average_rating: booking.Restaurant?.average_rating || 0,
      cuisine: booking.Restaurant?.tags || "",
      default_deposit_amount: booking.deposit_amount || 0,
    };

    const contentHtml = renderTemplate("bookingDetail", {
      restaurant,
      booking: processedBooking,
    });

    appEl.innerHTML = contentHtml;

    // Initialize event listeners
    initBookingDetailEventListeners(bookingId);
  } catch (error) {
    console.error("❌ Error loading booking detail:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p>Không thể tải thông tin đặt bàn. Vui lòng thử lại.</p>
        <button onclick="location.reload()" class="btn-primary">Tải lại</button>
      </div>
    `;
  }
}

function initBookingDetailEventListeners(bookingId) {
  // Back button - check referrer
  const btnBack = document.getElementById("btnBackFromDetail");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      const referrer = sessionStorage.getItem("bookingDetailReferrer");

      if (referrer === "history") {
        sessionStorage.removeItem("bookingDetailReferrer");
        window.location.hash = "#/history";
      } else {
        window.location.hash = "#/booking";
      }
    });
  }

  // Listen for booking status updates
  const statusUpdateHandler = (event) => {
    if (event.detail.bookingId === bookingId) {
      // Only reload if we're still on the booking detail page
      const currentHash = window.location.hash;
      if (currentHash === `#/booking/${bookingId}`) {
        // Reload the booking detail to show updated status
        renderBookingDetail(bookingId);
      }
    }
  };

  window.addEventListener("bookingStatusUpdated", statusUpdateHandler);
  window.addEventListener("bookingCheckedIn", statusUpdateHandler);

  // Cleanup on route change
  const cleanupHandler = () => {
    window.removeEventListener("bookingStatusUpdated", statusUpdateHandler);
    window.removeEventListener("bookingCheckedIn", statusUpdateHandler);
    window.removeEventListener("hashchange", cleanupHandler);
  };

  window.addEventListener("hashchange", cleanupHandler, { once: true });
}
