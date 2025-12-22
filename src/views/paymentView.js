// src/views/paymentView.js
import { renderTemplate } from "../core/templates.js";
import {
  createBookingNotification,
  updateNotificationBadge,
} from "../utils/notificationHelper.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");
let selectedEWallet = null;
let paymentTestMode = "success"; // success or failure

// Show mobile-friendly notification
function showNotification(message, type = "warning") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;

  let iconSvg = "";
  if (type === "warning") {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  } else if (type === "success") {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else if (type === "error") {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);

  if (navigator.vibrate) {
    navigator.vibrate(
      type === "error" || type === "warning" ? [50, 30, 50] : 100
    );
  }
}

export async function renderPayment(bookingId) {
  // Check authentication before allowing payment
  if (!authService.requireAuth(`#/payment/${bookingId}`)) {
    return;
  }

  console.log(`💳 Payment page loading for booking ID: ${bookingId}`);

  try {
    // Import booking API
    const { getBookingDetail } = await import('../api/bookingApi.js');
    
    console.log("📡 Fetching booking detail from API...");
    
    // Fetch booking details from API
    const booking = await getBookingDetail(bookingId);
    
    console.log("📦 Booking detail response:", booking);
    
    if (!booking) {
      console.error("❌ Booking not found!");
      showNotification("Không tìm thấy thông tin đặt bàn", "error");
      window.location.hash = "#/booking";
      return;
    }

    console.log("✅ Booking found, rendering payment page");

    // Process booking data to match template expectations
    const processedBooking = {
      id: booking.id,
      restaurantName: booking.Restaurant?.name || "Nhà hàng",
      restaurantId: booking.restaurant_id,
      // Split booking_time into date and time
      date: booking.booking_time?.split(" ")[0] || "",
      time: booking.booking_time?.split(" ")[1]?.substring(0, 5) || "",
      people: booking.people_count || 0,
      // Format table info
      tablesText: booking.RestaurantTable?.name || "Chưa chọn bàn",
      depositAmount: booking.deposit_amount || 0,
      paymentStatus: booking.payment_status,
      customerName: booking.customer_name || "",
      phone: booking.phone || "",
    };

    console.log("📝 Processed booking for payment:", processedBooking);

    const paymentContent = renderTemplate("payment", {
      booking: processedBooking,
    });

    appEl.innerHTML = paymentContent;

    // Initialize event listeners
    initPaymentListeners(booking);

    // Initialize test buttons
    initTestButtons();

    // Load saved card if exists
    loadSavedCard();
  } catch (error) {
    console.error("❌ Error loading payment page:", error);
    showNotification("Không thể tải trang thanh toán", "error");
    window.location.hash = "#/booking";
  }
}

function initTestButtons() {
  const btnTestSuccess = document.getElementById("btnTestSuccess");
  const btnTestFailure = document.getElementById("btnTestFailure");

  // Set initial state
  btnTestSuccess.classList.add("active");
  paymentTestMode = "success";

  if (btnTestSuccess) {
    btnTestSuccess.addEventListener("click", () => {
      paymentTestMode = "success";
      btnTestSuccess.classList.add("active");
      btnTestFailure.classList.remove("active");
      if (navigator.vibrate) navigator.vibrate(10);
    });
  }

  if (btnTestFailure) {
    btnTestFailure.addEventListener("click", () => {
      paymentTestMode = "failure";
      btnTestFailure.classList.add("active");
      btnTestSuccess.classList.remove("active");
      if (navigator.vibrate) navigator.vibrate(10);
    });
  }
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
  const saveCardCheckbox = document.getElementById("saveCard");

  if (cardNumberInput && previewCardNumber) {
    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s/g, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formattedValue;

      // Reset save card checkbox when user changes card info
      if (saveCardCheckbox) {
        saveCardCheckbox.checked = false;
      }

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

      // Reset save card checkbox when user changes card info
      if (saveCardCheckbox) {
        saveCardCheckbox.checked = false;
      }
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

      // Reset save card checkbox when user changes card info
      if (saveCardCheckbox) {
        saveCardCheckbox.checked = false;
      }
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
        // Check if user selected an e-wallet provider
        if (!selectedEWallet) {
          showNotification(
            "Vui lòng chọn ví điện tử để thanh toán!",
            "warning"
          );
          return;
        }
        handleEWalletPayment(bookingData);
      }
    });
  }

  // Popup OK button
  const btnPopupOk = document.getElementById("btnPopupOk");
  if (btnPopupOk) {
    btnPopupOk.addEventListener("click", () => {
      window.location.hash = "#/booking";
    });
  }
}

async function handleCardPayment(bookingData) {
  const cardForm = document.getElementById("cardForm");

  if (!cardForm.checkValidity()) {
    cardForm.reportValidity();
    return;
  }

  const cardNumber = document.getElementById("cardNumber").value;
  const cardName = document.getElementById("cardName").value;
  const cardExpiry = document.getElementById("cardExpiry").value;
  const cardCVV = document.getElementById("cardCVV").value;

  try {
    // Import payment API
    const { payDeposit } = await import('../api/paymentApi.js');
    
    // Show loading
    const btnConfirm = document.getElementById("btnConfirmPayment");
    const originalText = btnConfirm.textContent;
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Đang xử lý...";

    // Call payment API
    const paymentResult = await payDeposit(bookingData.id, {
      provider: "CARD",
      mock_result: paymentTestMode === "success" ? "SUCCESS" : "FAILED"
    });

    console.log("✅ Payment API response:", paymentResult);

    // Save card info if checkbox is checked and payment succeeded
    if (paymentTestMode === "success") {
      const saveCardCheckbox = document.getElementById("saveCard");
      if (saveCardCheckbox && saveCardCheckbox.checked) {
        const savedCard = {
          cardNumber,
          cardName,
          cardExpiry,
        };
        localStorage.setItem("dinelink_saved_card", JSON.stringify(savedCard));
        console.log("Card saved for future use");
      }

      // Show success and redirect
      showSuccessPopup();
    } else {
      // Show failure popup
      showFailurePopup();
      btnConfirm.disabled = false;
      btnConfirm.textContent = originalText;
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    showNotification("Thanh toán thất bại. Vui lòng thử lại.", "error");
    
    // Restore button
    const btnConfirm = document.getElementById("btnConfirmPayment");
    btnConfirm.disabled = false;
    btnConfirm.textContent = "Xác nhận thanh toán";
  }
}

async function handleEWalletPayment(bookingData) {
  // Double check (redundant but safe)
  if (!selectedEWallet) {
    showNotification("Vui lòng chọn ví điện tử để thanh toán!", "warning");
    return;
  }

  try {
    // Import payment API
    const { payDeposit } = await import('../api/paymentApi.js');
    
    // Show loading
    const btnConfirm = document.getElementById("btnConfirmPayment");
    const originalText = btnConfirm.textContent;
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Đang xử lý...";

    // Map selectedEWallet to uppercase provider name
    const providerMap = {
      'momo': 'MOMO',
      'vnpay': 'VNPAY',
      'zalopay': 'ZALOPAY'
    };
    const provider = providerMap[selectedEWallet] || selectedEWallet.toUpperCase();

    // Call payment API
    const paymentResult = await payDeposit(bookingData.id, {
      provider: provider,
      mock_result: paymentTestMode === "success" ? "SUCCESS" : "FAILED"
    });

    console.log("✅ Payment API response:", paymentResult);

    if (paymentTestMode === "success") {
      // Show success and redirect
      showSuccessPopup();
    } else {
      // Show failure popup
      showFailurePopup();
      btnConfirm.disabled = false;
      btnConfirm.textContent = originalText;
    }
  } catch (error) {
    console.error("❌ Payment error:", error);
    showNotification("Thanh toán thất bại. Vui lòng thử lại.", "error");
    
    // Restore button
    const btnConfirm = document.getElementById("btnConfirmPayment");
    btnConfirm.disabled = false;
    btnConfirm.textContent = "Xác nhận thanh toán";
  }
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

// Show payment failure popup
function showFailurePopup() {
  const popup = document.createElement("div");
  popup.className = "payment-popup";
  popup.innerHTML = `
    <div class="payment-popup-overlay"></div>
    <div class="payment-popup-content payment-failure">
      <div class="popup-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2>Thanh toán thất bại!</h2>
      <p class="popup-message">
        Không thể xử lý thanh toán của bạn. Vui lòng kiểm tra lại thông tin và thử lại.
      </p>
      <button class="btn-popup-retry" id="btnPopupRetry">Thử lại</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Retry button - close popup and stay on payment page
  const btnRetry = popup.querySelector("#btnPopupRetry");
  btnRetry.addEventListener("click", () => {
    popup.remove();
    // User stays on payment page to try again
    console.log("User will retry payment");
  });
}

// Load saved card information
function loadSavedCard() {
  const savedCardJSON = localStorage.getItem("dinelink_saved_card");
  if (!savedCardJSON) return;

  try {
    const savedCard = JSON.parse(savedCardJSON);

    // Fill card inputs
    const cardNumberInput = document.getElementById("cardNumber");
    const cardNameInput = document.getElementById("cardName");
    const cardExpiryInput = document.getElementById("cardExpiry");
    const saveCardCheckbox = document.getElementById("saveCard");

    if (cardNumberInput && savedCard.cardNumber) {
      cardNumberInput.value = savedCard.cardNumber;
      // Trigger input event to update preview
      cardNumberInput.dispatchEvent(new Event("input"));
    }

    if (cardNameInput && savedCard.cardName) {
      cardNameInput.value = savedCard.cardName;
      cardNameInput.dispatchEvent(new Event("input"));
    }

    if (cardExpiryInput && savedCard.cardExpiry) {
      cardExpiryInput.value = savedCard.cardExpiry;
      cardExpiryInput.dispatchEvent(new Event("input"));
    }

    // Check the save card checkbox
    if (saveCardCheckbox) {
      saveCardCheckbox.checked = true;
    }

    console.log("Loaded saved card information");
  } catch (error) {
    console.error("Error loading saved card:", error);
  }
}

function showSuccessPopup() {
  const popup = document.getElementById("paymentSuccessPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}
