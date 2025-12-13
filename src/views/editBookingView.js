// src/views/editBookingView.js
import { renderTemplate } from "../core/templates.js";
import {
  restaurants,
  restaurantTables,
  getAvailableTables as getAvailableTablesFromData,
} from "../data/mockData.js";
import {
  createBookingNotification,
  updateNotificationBadge,
} from "../utils/notificationHelper.js";

const appEl = document.getElementById("app");
let selectedTables = [];

export async function renderEditBooking(bookingId) {
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

  const contentHtml = renderTemplate("editBooking", {
    restaurant,
    booking,
  });

  appEl.innerHTML = contentHtml;

  // Initialize selected tables from booking
  selectedTables = [];
  const bookingTableNames = booking.tables || [];
  const allTablesData = getAvailableTablesFromData(
    booking.restaurantId,
    booking.people
  );
  bookingTableNames.forEach((tableName) => {
    const table = [...allTablesData.allAvailable].find(
      (t) => t.name === tableName
    );
    if (table) {
      selectedTables.push(table);
    }
  });

  // Initialize event listeners
  initEditBookingListeners(booking, restaurant);
}

function initEditBookingListeners(originalBooking, restaurant) {
  // Guest counter
  const peopleCountInput = document.getElementById("peopleCount");
  const btnDecrease = document.getElementById("btnDecrease");
  const btnIncrease = document.getElementById("btnIncrease");

  btnDecrease?.addEventListener("click", () => {
    const current = parseInt(peopleCountInput.value);
    if (current > 1) {
      peopleCountInput.value = current - 1;
      updateAvailableTables(originalBooking.restaurantId, current - 1);
    }
  });

  btnIncrease?.addEventListener("click", () => {
    const current = parseInt(peopleCountInput.value);
    peopleCountInput.value = current + 1;
    updateAvailableTables(originalBooking.restaurantId, current + 1);
  });

  // Handle Enter key
  peopleCountInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      peopleCountInput.blur(); // Trigger blur to validate
    }
  });

  // Validate on blur (when user leaves the field or presses Enter)
  peopleCountInput?.addEventListener("blur", () => {
    let value = parseInt(peopleCountInput.value);

    if (peopleCountInput.value === "" || isNaN(value) || value < 1) {
      value = originalBooking.people;
      peopleCountInput.value = value;
    }

    updateAvailableTables(originalBooking.restaurantId, value);
  });

  // Initialize with current people count
  const initialPeople = parseInt(peopleCountInput.value);
  updateAvailableTables(originalBooking.restaurantId, initialPeople);

  // Initialize modal listeners
  initModalListeners(originalBooking.restaurantId);

  // Form submission
  const editForm = document.getElementById("editBookingForm");
  editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedTables.length === 0) {
      alert("Vui lòng chọn ít nhất một bàn!");
      return;
    }

    // Collect form data
    const updatedBookingData = {
      id: originalBooking.id,
      restaurantId: originalBooking.restaurantId,
      restaurantName: restaurant.name,
      date: document.getElementById("bookingDate").value,
      time: document.getElementById("bookingTime").value,
      people: parseInt(document.getElementById("peopleCount").value),
      tables: selectedTables.map((t) => t.name), // Store as array of table names
      customerName: document.getElementById("customerName").value,
      customerPhone: document.getElementById("customerPhone").value,
      notes: document.getElementById("bookingNote").value,
      status: originalBooking.status, // Keep original status
      paymentStatus: originalBooking.paymentStatus, // Keep original payment status
      depositAmount: originalBooking.depositAmount, // Keep original deposit
      createdAt: originalBooking.createdAt, // Keep original creation time
      updatedAt: new Date().toISOString(), // Add update timestamp
    };

    // Show loading
    const btnSubmit = document.querySelector(".btn-submit-booking");
    const originalText = btnSubmit?.textContent;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Đang cập nhật...";
    }

    // Simulate API call to update booking
    console.log("Updating booking:", updatedBookingData);

    setTimeout(() => {
      // Update booking in localStorage
      const bookings = JSON.parse(
        localStorage.getItem("dinelink_bookings") || "[]"
      );
      const bookingIndex = bookings.findIndex(
        (b) => b.id === originalBooking.id
      );

      if (bookingIndex !== -1) {
        // Update the booking with new data
        bookings[bookingIndex] = {
          ...bookings[bookingIndex],
          ...updatedBookingData,
          status: "PENDING", // Reset to PENDING for dashboard re-confirmation
        };

        localStorage.setItem("dinelink_bookings", JSON.stringify(bookings));

        console.log("✅ Booking updated successfully");
        console.log("📤 Sending update request to dashboard...");

        // Simulate dashboard re-confirmation
        simulateDashboardUpdate(originalBooking.id);

        // Show custom popup
        showSuccessPopup();

        // Redirect after popup
        setTimeout(() => {
          window.location.hash = "#/booking";
        }, 2000);
      } else {
        alert("Lỗi: Không tìm thấy đặt bàn để cập nhật");
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = originalText;
        }
      }
    }, 1500);
  });
}

// Simulate dashboard re-confirmation after update
function simulateDashboardUpdate(bookingId) {
  console.log("🔄 Dashboard processing update for booking:", bookingId);

  // After 5 seconds, dashboard confirms the update
  setTimeout(() => {
    const bookings = JSON.parse(
      localStorage.getItem("dinelink_bookings") || "[]"
    );
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex !== -1) {
      // Dashboard accepts the update (95% chance)
      const isAccepted = Math.random() > 0.05;

      if (isAccepted) {
        bookings[bookingIndex].status = "CONFIRMED";
        console.log("✅ Dashboard CONFIRMED the update");

        // Create notification
        createBookingNotification(bookings[bookingIndex], "CONFIRMED");
      } else {
        bookings[bookingIndex].status = "CANCELLED";
        bookings[bookingIndex].cancelReason =
          "Nhà hàng không thể đáp ứng yêu cầu thay đổi";
        console.log("❌ Dashboard REJECTED the update");

        // Create notification
        createBookingNotification(
          bookings[bookingIndex],
          "CANCELLED",
          bookings[bookingIndex].cancelReason
        );
      }

      localStorage.setItem("dinelink_bookings", JSON.stringify(bookings));
      updateNotificationBadge();

      // Notify if user is on booking page
      window.dispatchEvent(
        new CustomEvent("bookingStatusUpdated", {
          detail: { bookingId, status: bookings[bookingIndex].status },
        })
      );
    }
  }, 5000);
}

// Get available tables based on people count (wrapper around mockData function)
function getAvailableTables(restaurantId, peopleCount) {
  // Use the same function from mockData.js as booking form
  return getAvailableTablesFromData(restaurantId, peopleCount);
}

// Update available tables based on people count
function updateAvailableTables(restaurantId, peopleCount) {
  const tablesData = getAvailableTables(restaurantId, peopleCount);
  const tablesSection = document.getElementById("tablesSection");
  const tablesGrid = document.getElementById("tablesGrid");

  if (!tablesSection || !tablesGrid) return;

  // Show tables section
  tablesSection.style.display = "block";

  // Check if people count exceeds max capacity
  if (peopleCount > tablesData.maxTableCapacity) {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    showOverCapacityPopup(restaurant);
    return;
  }

  const noSuitableSingleTable =
    tablesData.standard.length === 0 && tablesData.vip.length === 0;

  // Render tables - only exact matches
  let tablesHTML = "";

  if (tablesData.standard.length > 0) {
    tablesHTML += `
      <div class="table-type-section">
        <h3 class="table-type-title">Bàn thường</h3>
        <div class="table-cards">
          ${tablesData.standard.map((table) => createTableCard(table)).join("")}
        </div>
      </div>
    `;
  }

  if (tablesData.vip.length > 0) {
    tablesHTML += `
      <div class="table-type-section">
        <h3 class="table-type-title">Bàn VIP</h3>
        <div class="table-cards">
          ${tablesData.vip.map((table) => createTableCard(table)).join("")}
        </div>
      </div>
    `;
  }

  if (tablesHTML === "") {
    tablesHTML = `<p class="no-tables-message">Không có bàn phù hợp. Vui lòng giảm số người hoặc chọn ngày khác.</p>`;
  }

  tablesGrid.innerHTML = tablesHTML;

  // Add click listeners to table cards
  attachTableCardListeners(restaurantId);
  updateSelectedTablesSummary();
}

// Create table card HTML
function createTableCard(table) {
  const isSelected = selectedTables.some((t) => t.id === table.id);
  return `
    <div class="table-card ${isSelected ? "selected" : ""}" data-table-id="${
    table.id
  }">
      <div class="table-card-header">
        <span class="table-name">${table.name}</span>
        <span class="table-capacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          ${table.capacity} người
        </span>
      </div>
      <div class="table-card-type ${table.type}">
        ${table.type === "vip" ? "⭐ VIP" : "🍽️ Thường"}
      </div>
    </div>
  `;
}

// Attach listeners to table cards
function attachTableCardListeners(restaurantId) {
  const tableCards = document.querySelectorAll(".table-card");
  tableCards.forEach((card) => {
    card.addEventListener("click", () => {
      const tableId = card.dataset.tableId;
      handleTableSelection(tableId, restaurantId);
    });
  });
}

// Handle table selection
function handleTableSelection(tableId, restaurantId) {
  const peopleCount = parseInt(document.getElementById("peopleCount").value);
  const tablesData = getAvailableTables(restaurantId, peopleCount);

  // Find the table - tableId is already a string from data-table-id attribute
  const table = [...tablesData.allAvailable].find((t) => t.id === tableId);
  if (!table) {
    console.log(
      "Table not found:",
      tableId,
      "Available:",
      tablesData.allAvailable.map((t) => t.id)
    );
    return;
  }

  // Check if already selected
  const isAlreadySelected = selectedTables.some((t) => t.id === tableId);

  if (isAlreadySelected) {
    // Deselect - remove the table
    selectedTables = [];
    // Update UI
    updateAvailableTables(restaurantId, peopleCount);
  } else {
    // Show modal first
    showTablePreviewModal(table, restaurantId, peopleCount);
  }
}

// Show table preview modal
function showTablePreviewModal(table, restaurantId, peopleCount) {
  const modal = document.getElementById("tablePreviewModal");
  const modalBody = document.getElementById("tableModalBody");

  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="table-preview">
      <img src="${table.image}" alt="${
    table.name
  }" class="table-preview-image" />
      <div class="table-preview-info">
        <h2>${table.name}</h2>
        <div class="table-preview-meta">
          <span class="table-preview-type ${table.type}">
            ${table.type === "vip" ? "⭐ Bàn VIP" : "🍽️ Bàn Thường"}
          </span>
          <span class="table-preview-capacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            Sức chứa: ${table.capacity} người
          </span>
        </div>
        <button class="btn-confirm-table" id="btnConfirmTable">Chọn bàn này</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  // Add confirm listener
  const btnConfirm = document.getElementById("btnConfirmTable");
  if (btnConfirm) {
    btnConfirm.addEventListener("click", () => {
      // Replace with new selection - only allow 1 table
      selectedTables = [table];
      modal.style.display = "none";
      updateAvailableTables(restaurantId, peopleCount);
    });
  }
}

// Initialize modal listeners
function initModalListeners(restaurantId) {
  const modal = document.getElementById("tablePreviewModal");
  const overlay = document.getElementById("tableModalOverlay");
  const btnClose = document.getElementById("btnCloseModal");

  if (overlay) {
    overlay.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  if (btnClose) {
    btnClose.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }
}

// Update selected tables summary
function updateSelectedTablesSummary() {
  const summary = document.getElementById("selectedTablesSummary");
  const list = document.getElementById("selectedTablesList");
  const totalCapacityDiv = document.getElementById("totalCapacity");
  const bookingForm = document.getElementById("editBookingForm");

  if (!summary || !list || !totalCapacityDiv) return;

  if (selectedTables.length === 0) {
    summary.style.display = "none";
    // Keep padding when no tables selected to show note field
    if (bookingForm) {
      bookingForm.style.paddingBottom = "100px";
    }
    return;
  }

  summary.style.display = "block";
  // Add more padding to form to prevent content from being hidden by fixed summary
  if (bookingForm) {
    bookingForm.style.paddingBottom = "250px";
  }

  const totalCapacity = selectedTables.reduce((sum, t) => sum + t.capacity, 0);

  list.innerHTML = selectedTables
    .map(
      (table) => `
      <div class="selected-table-item">
        <span>${table.name} (${table.capacity} người)</span>
        <button class="btn-remove-table" data-table-id="${table.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `
    )
    .join("");

  totalCapacityDiv.innerHTML = `Tổng: ${totalCapacity} người`;

  // Add remove listeners
  const removeButtons = list.querySelectorAll(".btn-remove-table");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tableId = btn.dataset.tableId;
      selectedTables = selectedTables.filter((t) => t.id !== tableId);
      // Get restaurantId from hidden input
      const restaurantId = parseInt(
        document.getElementById("restaurantId").value
      );
      const peopleCount = parseInt(
        document.getElementById("peopleCount").value
      );
      updateAvailableTables(restaurantId, peopleCount);
    });
  });
}

// Show success popup
function showSuccessPopup() {
  const popup = document.createElement("div");
  popup.className = "edit-success-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-icon">✓</div>
      <h3>Yêu cầu chỉnh sửa của bạn đã được ghi nhận</h3>
      <p>Đang chuyển về trang đặt bàn...</p>
    </div>
  `;
  document.body.appendChild(popup);

  // Animate in
  setTimeout(() => {
    popup.classList.add("show");
  }, 100);

  // Remove after redirect
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.remove();
    }, 300);
  }, 1800);
}

// Show over capacity popup
function showOverCapacityPopup(restaurant) {
  const popup = document.createElement("div");
  popup.className = "over-capacity-popup";
  popup.innerHTML = `
    <div class="popup-overlay"></div>
    <div class="popup-content">
      <div class="popup-icon">⚠️</div>
      <h3>Số lượng người đã vượt quá sức chứa</h3>
      <p>Rất tiếc, số lượng người bạn nhập đã vượt quá sức chứa tối đa của nhà hàng.</p>
      <p>Vui lòng liên hệ trực tiếp với nhà hàng để được tư vấn:</p>
      <a href="tel:${restaurant.phone}" class="phone-link">${restaurant.phone}</a>
      <button class="btn-close-popup">Đóng</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Animate in
  const content = popup.querySelector(".popup-content");
  content.style.animation = "popupSlideIn 0.3s ease";

  // Close handlers
  const overlay = popup.querySelector(".popup-overlay");
  const btnClose = popup.querySelector(".btn-close-popup");

  const closePopup = () => {
    content.style.animation = "popupSlideOut 0.3s ease";
    setTimeout(() => {
      popup.remove();
    }, 300);
  };

  overlay.addEventListener("click", closePopup);
  btnClose.addEventListener("click", closePopup);
}
