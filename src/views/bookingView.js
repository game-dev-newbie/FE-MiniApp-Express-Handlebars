// src/views/bookingView.js
import { renderTemplate } from "../core/templates.js";
import { bookings, restaurants, restaurantTables, users, reviews } from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0];

export async function renderBooking() {
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: "booking" });

  // Get user bookings
  const userBookings = bookings.filter((b) => b.user_id === currentUser.id);

  // Process bookings with restaurant and table info
  const processedBookings = userBookings.map((booking) => {
    const restaurant = restaurants.find((r) => r.id === booking.restaurant_id);
    const table = restaurantTables.find((t) => t.id === booking.table_id);
    const hasReview = reviews.some((r) => r.booking_id === booking.id);

    return {
      ...booking,
      restaurant_name: restaurant?.name || "Nhà hàng",
      table_name: table?.name || "Chưa chọn bàn",
      booking_time: formatBookingTime(booking.booking_time),
      has_review: hasReview,
    };
  });

  const upcomingBookings = processedBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING"
  );

  const completedBookings = processedBookings.filter(
    (b) => b.status === "COMPLETED"
  );

  const contentHtml = renderTemplate("booking", {
    upcomingBookings,
    completedBookings,
  });

  appEl.innerHTML = contentHtml + bottomNavHtml;

  // Initialize event listeners
  initBookingEventListeners();
}

function initBookingEventListeners() {
  // Tab switching
  const tabButtons = document.querySelectorAll(".booking-tab");
  const tabContents = document.querySelectorAll(".booking-tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Update active tab content
      tabContents.forEach((content) => content.classList.remove("active"));
      const targetContent = document.getElementById(`${tabName}-tab`);
      if (targetContent) {
        targetContent.classList.add("active");
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  // Cancel booking buttons
  const cancelButtons = document.querySelectorAll(".btn-cancel");
  cancelButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");

      if (confirm("Bạn có chắc chắn muốn hủy đặt bàn này?")) {
        const card = button.closest(".booking-card");
        card.style.transition = "opacity 0.3s ease";
        card.style.opacity = "0";

        setTimeout(() => {
          card.remove();
          alert(`Đã hủy đặt bàn #${id}`);
        }, 300);
      }
    });
  });

  // View detail buttons
  const detailButtons = document.querySelectorAll(
    '.btn-booking-action.btn-primary:not([data-id=""]):not(.btn-cancel)'
  );
  detailButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");

      if (button.textContent.includes("Đánh giá")) {
        alert(`Đánh giá cho booking #${id}`);
      } else {
        alert(`Xem chi tiết booking #${id}`);
      }
    });
  });

  // Rebook buttons
  const rebookButtons = document.querySelectorAll(".btn-outline");
  rebookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = button.getAttribute("data-id");
      alert(`Đặt lại bàn từ booking #${id}`);
    });
  });

  // Bottom navigation
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("data-page");

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      window.location.hash = `#/${page === "home" ? "" : page}`;
    });
  });
}

// Format booking time
function formatBookingTime(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("vi-VN", options);
}
