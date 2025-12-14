// src/views/bookingDetailView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";

const appEl = document.getElementById("app");

export async function renderBookingDetail(bookingId) {
  // Get booking from localStorage
  const bookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    alert("Không tìm thấy thông tin đặt bàn");
    window.location.hash = "#/booking";
    return;
  }

  // Get restaurant info
  const restaurant = restaurants.find((r) => r.id === booking.restaurantId);

  if (!restaurant) {
    alert("Không tìm thấy thông tin nhà hàng");
    window.location.hash = "#/booking";
    return;
  }

  // Format tables for display
  let formattedTables = [];
  if (booking.tables) {
    if (Array.isArray(booking.tables)) {
      formattedTables = booking.tables.map((t) => {
        if (typeof t === "object") {
          return `${t.name} (${t.type || t.capacity + " người"})`;
        }
        return t;
      });
    } else if (typeof booking.tables === "string") {
      formattedTables = [booking.tables];
    }
  }

  // Add deposit amount from restaurant if not in booking
  const bookingWithDeposit = {
    ...booking,
    tables: formattedTables,
    depositAmount: booking.depositAmount || restaurant.default_deposit_amount,
  };

  const contentHtml = renderTemplate("bookingDetail", {
    restaurant,
    booking: bookingWithDeposit,
  });

  appEl.innerHTML = contentHtml;

  // Initialize event listeners
  initBookingDetailEventListeners(bookingId);
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
      // Reload the booking detail to show updated status
      renderBookingDetail(bookingId);
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
