// src/views/bookingDetailView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants } from "../data/mockData.js";

const appEl = document.getElementById("app");

export async function renderBookingDetail(bookingId) {
  // Get booking from localStorage
  const bookings = JSON.parse(localStorage.getItem("dinelink_bookings") || "[]");
  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    alert("Không tìm thấy thông tin đặt bàn");
    window.location.hash = "#/booking";
    return;
  }

  // Get restaurant info
  const restaurant = restaurants.find(r => r.id === booking.restaurantId);
  
  if (!restaurant) {
    alert("Không tìm thấy thông tin nhà hàng");
    window.location.hash = "#/booking";
    return;
  }

  // Add deposit amount from restaurant if not in booking
  const bookingWithDeposit = {
    ...booking,
    depositAmount: booking.depositAmount || restaurant.default_deposit_amount
  };

  const contentHtml = renderTemplate("bookingDetail", {
    restaurant,
    booking: bookingWithDeposit,
  });

  appEl.innerHTML = contentHtml;
}
