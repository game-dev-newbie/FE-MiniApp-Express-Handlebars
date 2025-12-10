// src/views/bookingFormView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants, users } from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0]; // Simulate logged in user

export function renderBookingForm(restaurantId) {
  // Find restaurant by ID
  const restaurant = restaurants.find((r) => r.id === parseInt(restaurantId));

  if (!restaurant) {
    // Restaurant not found, redirect to home
    window.location.hash = "#/home";
    return;
  }

  // Get min date (today)
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const bookingFormContent = renderTemplate("bookingForm", {
    restaurant,
    userName: currentUser.display_name,
    userPhone: currentUser.phone,
    minDate,
  });

  appEl.innerHTML = bookingFormContent;

  // Initialize event listeners
  initBookingFormListeners(restaurant);
}

function initBookingFormListeners(restaurant) {
  // Back button
  const btnBack = document.getElementById("btnBackFromBooking");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // People count buttons
  const btnDecrease = document.getElementById("btnDecrease");
  const btnIncrease = document.getElementById("btnIncrease");
  const peopleInput = document.getElementById("peopleCount");

  if (btnDecrease && btnIncrease && peopleInput) {
    btnDecrease.addEventListener("click", () => {
      const currentValue = parseInt(peopleInput.value);
      if (currentValue > 1) {
        peopleInput.value = currentValue - 1;
      }
    });

    btnIncrease.addEventListener("click", () => {
      const currentValue = parseInt(peopleInput.value);
      if (currentValue < 20) {
        peopleInput.value = currentValue + 1;
      }
    });
  }

  // Form submission
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(bookingForm);
      const bookingData = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        date: formData.get("date"),
        time: formData.get("time"),
        people: formData.get("people"),
        customerName: formData.get("name"),
        customerPhone: formData.get("phone"),
        note: formData.get("note"),
        requireDeposit: restaurant.require_deposit,
        depositAmount: restaurant.default_deposit_amount,
      };

      console.log("Booking data:", bookingData);

      // Show success message
      alert(
        `Đặt bàn thành công!\n\nNhà hàng: ${bookingData.restaurantName}\nNgày: ${bookingData.date}\nGiờ: ${bookingData.time}\nSố người: ${bookingData.people}\n\nChúng tôi sẽ liên hệ với bạn để xác nhận.`
      );

      // Redirect to booking page
      window.location.hash = "#/booking";
    });
  }
}
