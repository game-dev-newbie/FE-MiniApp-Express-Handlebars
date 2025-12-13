// src/views/paymentView.js
import { renderTemplate } from "../core/templates.js";
import {
  createBookingNotification,
  updateNotificationBadge,
} from "../utils/notificationHelper.js";

const appEl = document.getElementById("app");
let selectedEWallet = null;

export function renderPayment(bookingData) {
  const paymentContent = renderTemplate("payment", {
    booking: bookingData,
  });

  appEl.innerHTML = paymentContent;

  // Initialize event listeners
  initPaymentListeners(bookingData);
}

function initPaymentListeners(bookingData) {
  // Back button
  const btnBack = document.getElementById("btnBackFromPayment");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Payment method selection
  const methodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const cardForm = document.getElementById("cardPaymentForm");
  const qrOptions = document.getElementById("qrPaymentOptions");

  methodRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "card") {
        cardForm.classList.add("active");
        qrOptions.classList.remove("active");
      } else if (e.target.value === "qr") {
        cardForm.classList.remove("active");
        qrOptions.classList.add("active");
      }
    });
  });

  // Card number formatting and preview update
  const cardNumberInput = document.getElementById("cardNumber");
  const previewCardNumber = document.getElementById("previewCardNumber");
  if (cardNumberInput && previewCardNumber) {
    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s/g, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formattedValue;

      // Update preview
      if (value.length === 0) {
        previewCardNumber.textContent = "•••• •••• •••• ••••";
      } else {
        // Mask the card number except last 4 digits
        let masked = value
          .split("")
          .map((char, idx) => {
            if (idx < value.length - 4) return "•";
            return char;
          })
          .join("");
        previewCardNumber.textContent =
          masked.match(/.{1,4}/g)?.join(" ") || masked;
      }
    });
  }

  // Card name update
  const cardNameInput = document.getElementById("cardName");
  const previewCardName = document.getElementById("previewCardName");
  if (cardNameInput && previewCardName) {
    cardNameInput.addEventListener("input", (e) => {
      const value = e.target.value.toUpperCase();
      e.target.value = value;
      previewCardName.textContent = value || "TÊN CHỦ THẺ";
    });
  }

  // Card expiry formatting and preview update
  const cardExpiryInput = document.getElementById("cardExpiry");
  const previewCardExpiry = document.getElementById("previewCardExpiry");
  if (cardExpiryInput && previewCardExpiry) {
    cardExpiryInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      e.target.value = value;
      previewCardExpiry.textContent = value || "MM/YY";
    });
  }

  // CVV input - numbers only
  const cardCVVInput = document.getElementById("cardCVV");
  if (cardCVVInput) {
    cardCVVInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });
  }

  // E-wallet Provider selection
  const ewalletProviderBtns = document.querySelectorAll(".qr-provider-btn");
  ewalletProviderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      ewalletProviderBtns.forEach((b) => b.classList.remove("selected"));
      // Add active class to selected button
      btn.classList.add("selected");
      selectedEWallet = btn.dataset.provider;
    });
  });

  // Payment confirmation
  const btnConfirmPayment = document.getElementById("btnConfirmPayment");
  if (btnConfirmPayment) {
    btnConfirmPayment.addEventListener("click", () => {
      const selectedMethod = document.querySelector(
        'input[name="paymentMethod"]:checked'
      ).value;

      if (selectedMethod === "card") {
        handleCardPayment(bookingData);
      } else if (selectedMethod === "qr") {
        handleEWalletPayment(bookingData);
      }
    });
  }

  // Popup OK button
  const btnPopupOk = document.getElementById("btnPopupOk");
  if (btnPopupOk) {
    btnPopupOk.addEventListener("click", () => {
      window.location.hash = "#/home";
    });
  }
}

function handleCardPayment(bookingData) {
  const cardForm = document.getElementById("cardForm");

  if (!cardForm.checkValidity()) {
    cardForm.reportValidity();
    return;
  }

  const cardNumber = document.getElementById("cardNumber").value;
  const cardName = document.getElementById("cardName").value;
  const cardExpiry = document.getElementById("cardExpiry").value;
  const cardCVV = document.getElementById("cardCVV").value;

  // Mock payment API call
  console.log("Processing card payment:", {
    cardNumber,
    cardName,
    cardExpiry,
    cardCVV,
    amount: bookingData.depositAmount,
    bookingData,
  });

  // Simulate API call
  setTimeout(() => {
    // Save booking to localStorage
    saveBooking(bookingData);

    // Show success popup
    showSuccessPopup();
  }, 1500);
}

function handleEWalletPayment(bookingData) {
  if (!selectedEWallet) {
    alert("Vui lòng chọn ví điện tử để thanh toán!");
    return;
  }

  // Mock e-wallet payment API call
  console.log("Processing e-wallet payment:", {
    provider: selectedEWallet,
    amount: bookingData.depositAmount,
    bookingData,
  });

  // Simulate API call
  setTimeout(() => {
    // Save booking to localStorage
    saveBooking(bookingData);

    // Show success popup
    showSuccessPopup();
  }, 1500);
}

function saveBooking(bookingData) {
  // Get existing bookings from localStorage
  const existingBookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );

  // Create new booking with PENDING status (waiting for dashboard confirmation)
  const newBooking = {
    ...bookingData,
    id: Date.now().toString(),
    status: "PENDING",
    paymentStatus: "PAID",
    createdAt: new Date().toISOString(),
  };

  // Add to bookings array
  existingBookings.unshift(newBooking);

  // Save back to localStorage
  localStorage.setItem("dinelink_bookings", JSON.stringify(existingBookings));

  // Clear pending booking
  sessionStorage.removeItem("pendingBooking");

  console.log("Booking saved with PENDING status:", newBooking);

  // Simulate API call to dashboard for confirmation
  sendBookingToDashboard(newBooking.id);
}

// Mock API: Send booking to dashboard and simulate response
function sendBookingToDashboard(bookingId) {
  console.log("Sending booking to dashboard for confirmation:", bookingId);

  // Simulate API call to dashboard
  // In reality, this would be: await fetch('/api/bookings', { method: 'POST', ... })

  // Simulate dashboard response after 3-5 seconds
  const responseTime = Math.random() * 2000 + 3000; // 3-5 seconds

  setTimeout(() => {
    simulateDashboardResponse(bookingId);
  }, responseTime);
}

// Mock dashboard response: 95% accept, 5% reject
function simulateDashboardResponse(bookingId) {
  const bookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

  if (bookingIndex === -1) {
    console.log("Booking not found:", bookingId);
    return;
  }

  // 95% chance of acceptance
  const isAccepted = Math.random() > 0.05;

  if (isAccepted) {
    // Accept booking
    bookings[bookingIndex].status = "CONFIRMED";
    console.log("\u2705 Dashboard ACCEPTED booking:", bookingId);
    console.log("Nhà hàng đã xác nhận đơn đặt bàn");
    console.log("Trạng thái: CONFIRMED (Đã xác nhận)\n");

    localStorage.setItem("dinelink_bookings", JSON.stringify(bookings));

    // Create notification
    createBookingNotification(bookings[bookingIndex], "CONFIRMED");
    updateNotificationBadge();

    window.dispatchEvent(
      new CustomEvent("bookingStatusUpdated", {
        detail: { bookingId, status: "CONFIRMED" },
      })
    );

    // Simulate dashboard check-in after 15 seconds
    setTimeout(() => {
      simulateDashboardCheckIn(bookingId);
    }, 15000); // 15 seconds after confirmation
  } else {
    // Reject booking
    bookings[bookingIndex].status = "CANCELLED";
    bookings[bookingIndex].cancelReason = "Nhà hàng không còn chỗ trống";
    bookings[bookingIndex].refundStatus = "Đã hoàn tiền";

    console.log("❌ Dashboard REJECTED booking:", bookingId);
    console.log("Nhà hàng từ chối đơn đặt bàn");
    console.log("Lý do: Không còn chỗ trống");
    console.log("Trạng thái: CANCELLED (Đã hủy)");
    console.log("✅ Hoàn tiền: Đã xử lý hoàn tiền cho khách hàng\n");

    localStorage.setItem("dinelink_bookings", JSON.stringify(bookings));

    // Create notification
    createBookingNotification(
      bookings[bookingIndex],
      "CANCELLED",
      bookings[bookingIndex].cancelReason
    );
    updateNotificationBadge();

    window.dispatchEvent(
      new CustomEvent("bookingStatusUpdated", {
        detail: { bookingId, status: "CANCELLED" },
      })
    );
  }
}

// Simulate dashboard check-in (after confirmation)
function simulateDashboardCheckIn(bookingId) {
  const bookings = JSON.parse(
    localStorage.getItem("dinelink_bookings") || "[]"
  );
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

  if (bookingIndex === -1 || bookings[bookingIndex].status !== "CONFIRMED") {
    return;
  }

  // Change status to CHECKED_IN
  bookings[bookingIndex].status = "CHECKED_IN";
  bookings[bookingIndex].checkedInAt = new Date().toISOString();

  console.log("✅ Dashboard CHECK-IN completed:", bookingId);
  console.log("Khách hàng đã check-in tại nhà hàng");
  console.log("Trạng thái: CHECKED_IN (Đã check-in)");
  console.log("Booking chuyển sang trang lịch sử để đánh giá\n");

  localStorage.setItem("dinelink_bookings", JSON.stringify(bookings));

  // Create notification
  createBookingNotification(bookings[bookingIndex], "CHECKED_IN");
  updateNotificationBadge();

  // Dispatch check-in event
  window.dispatchEvent(
    new CustomEvent("bookingCheckedIn", {
      detail: { bookingId, status: "CHECKED_IN" },
    })
  );

  // Also dispatch status update event
  window.dispatchEvent(
    new CustomEvent("bookingStatusUpdated", {
      detail: { bookingId, status: "CHECKED_IN" },
    })
  );
}

function showSuccessPopup() {
  const popup = document.getElementById("paymentSuccessPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}
