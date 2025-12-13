// src/views/bookingFormView.js
import { renderTemplate } from "../core/templates.js";
import { restaurants, users, getAvailableTables } from "../data/mockData.js";

const appEl = document.getElementById("app");
const currentUser = users[0]; // Simulate logged in user
let selectedTables = []; // Track selected tables

export function renderBookingForm(restaurantId) {
  // Reset selected tables when entering the page
  selectedTables = [];

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

  // Restore saved booking data if exists (when user comes back from payment)
  const savedBookingData = sessionStorage.getItem("pendingBooking");
  if (savedBookingData) {
    try {
      const bookingData = JSON.parse(savedBookingData);

      // Only restore if it's for the same restaurant
      if (bookingData.restaurantId === restaurant.id) {
        // Restore form fields
        const dateInput = document.getElementById("bookingDate");
        const timeInput = document.getElementById("bookingTime");
        const peopleInput = document.getElementById("peopleCount");
        const nameInput = document.getElementById("customerName");
        const phoneInput = document.getElementById("customerPhone");
        const noteInput = document.getElementById("specialRequest");

        if (dateInput && bookingData.date) dateInput.value = bookingData.date;
        if (timeInput && bookingData.time) timeInput.value = bookingData.time;
        if (peopleInput && bookingData.people)
          peopleInput.value = bookingData.people;
        if (nameInput && bookingData.customerName)
          nameInput.value = bookingData.customerName;
        if (phoneInput && bookingData.customerPhone)
          phoneInput.value = bookingData.customerPhone;
        if (noteInput && bookingData.note) noteInput.value = bookingData.note;

        // Restore selected tables
        if (bookingData.tables && bookingData.tables.length > 0) {
          selectedTables = bookingData.tables;
        }
      }
    } catch (error) {
      console.error("Error restoring booking data:", error);
    }
  }

  // Initialize event listeners
  initBookingFormListeners(restaurant);

  // Setup cleanup when leaving page (except when going to payment)
  setupPageLeaveCleanup();
}

function setupPageLeaveCleanup() {
  let isGoingToPayment = false;

  // Mark when going to payment
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", () => {
      isGoingToPayment = true;
    });
  }

  // Cleanup on hash change if not going to payment
  const cleanupHandler = () => {
    const currentHash = window.location.hash;

    // If not going to payment page, clear sessionStorage
    if (!isGoingToPayment && !currentHash.includes("#/payment")) {
      sessionStorage.removeItem("pendingBooking");
      console.log("Cleared booking form data");
    }

    // Remove this listener after it fires once
    window.removeEventListener("hashchange", cleanupHandler);
  };

  window.addEventListener("hashchange", cleanupHandler);
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
        updateAvailableTables(restaurant.id, currentValue - 1);
      }
    });

    btnIncrease.addEventListener("click", () => {
      const currentValue = parseInt(peopleInput.value);
      peopleInput.value = currentValue + 1;
      updateAvailableTables(restaurant.id, currentValue + 1);
    });

    // Handle Enter key
    peopleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        peopleInput.blur(); // Trigger blur to validate
      }
    });

    // Validate on blur (when user leaves the field or presses Enter)
    peopleInput.addEventListener("blur", () => {
      let value = parseInt(peopleInput.value);

      if (peopleInput.value === "" || isNaN(value) || value < 1) {
        value = 2;
        peopleInput.value = 2;
      }

      updateAvailableTables(restaurant.id, value);
    });

    // Initial load of tables
    updateAvailableTables(restaurant.id, parseInt(peopleInput.value));

    // After loading tables, restore selected tables if any
    setTimeout(() => {
      if (selectedTables.length > 0) {
        renderSelectedTables();
      }
    }, 100);
  }

  // Form submission
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validate table selection
      if (selectedTables.length === 0) {
        alert("Vui lòng chọn bàn trước khi xác nhận đặt bàn!");
        return;
      }

      const formData = new FormData(bookingForm);
      const peopleCount = parseInt(formData.get("people"));
      const selectedCapacity = selectedTables.reduce(
        (sum, t) => sum + t.capacity,
        0
      );

      // Check if selected tables can accommodate people
      if (selectedCapacity < peopleCount) {
        alert(
          `Bàn đã chọn chỉ đủ cho ${selectedCapacity} người. Vui lòng chọn thêm bàn hoặc giảm số người.`
        );
        return;
      }

      const bookingData = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        date: formData.get("date"),
        time: formData.get("time"),
        people: formData.get("people"),
        tables: selectedTables.map((t) => ({
          id: t.id,
          name: t.name,
          type: t.type,
          capacity: t.capacity,
        })),
        customerName: formData.get("name"),
        customerPhone: formData.get("phone"),
        note: formData.get("note"),
        requireDeposit: restaurant.require_deposit,
        depositAmount: restaurant.default_deposit_amount,
      };

      console.log("Booking data:", bookingData);

      // Store booking data and redirect to payment
      const tablesInfo = selectedTables.map((t) => t.name).join(", ");
      bookingData.tablesText = tablesInfo;

      // Store in sessionStorage to pass to payment page
      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));

      // Redirect to payment page
      window.location.hash = "#/payment";
    });
  }

  // Modal close listeners
  initModalListeners();
}

// Update available tables based on people count
function updateAvailableTables(restaurantId, peopleCount) {
  const tablesData = getAvailableTables(restaurantId, peopleCount);
  const tablesSection = document.getElementById("tablesSection");
  const tablesGrid = document.getElementById("tablesGrid");
  const overCapacityWarning = document.getElementById("overCapacityWarning");

  if (!tablesSection || !tablesGrid) return;

  // Show tables section
  tablesSection.style.display = "block";

  // Hide over capacity warning (not used anymore)
  if (overCapacityWarning) {
    overCapacityWarning.style.display = "none";
  }

  // Check if people count exceeds max table capacity
  if (
    peopleCount > tablesData.maxTableCapacity &&
    tablesData.maxTableCapacity > 0
  ) {
    // Show popup to call restaurant
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    showOverCapacityPopup(restaurant);

    // Clear tables grid
    tablesGrid.innerHTML = `<p class="no-tables-message">Số lượng người vượt quá sức chứa. Vui lòng liên hệ nhà hàng.</p>`;
    return;
  }

  // Render tables (only exact matches)
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
    tablesHTML = `<p class="no-tables-message">Không có bàn phù hợp cho ${peopleCount} người. Vui lòng chọn số người khác.</p>`;
  }

  tablesGrid.innerHTML = tablesHTML;

  // Add click listeners to table cards
  attachTableCardListeners();
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
function attachTableCardListeners() {
  const tableCards = document.querySelectorAll(".table-card");
  tableCards.forEach((card) => {
    card.addEventListener("click", () => {
      const tableId = card.dataset.tableId;
      handleTableSelection(tableId);
    });
  });
}

// Handle table selection
function handleTableSelection(tableId) {
  const restaurantId = parseInt(window.location.hash.split("/")[3]);
  const peopleCount = parseInt(document.getElementById("peopleCount").value);
  const tablesData = getAvailableTables(restaurantId, peopleCount);

  // Find the table
  const table = [...tablesData.allAvailable].find((t) => t.id === tableId);
  if (!table) return;

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
function initModalListeners() {
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
  const bookingForm = document.getElementById("bookingForm");

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
      const restaurantId = parseInt(window.location.hash.split("/")[3]);
      const peopleCount = parseInt(
        document.getElementById("peopleCount").value
      );
      updateAvailableTables(restaurantId, peopleCount);
    });
  });
}

// Show popup when people count exceeds restaurant capacity
function showOverCapacityPopup(restaurant) {
  const popup = document.createElement("div");
  popup.className = "over-capacity-popup";
  popup.innerHTML = `
    <div class="popup-overlay"></div>
    <div class="popup-content">
      <div class="popup-icon">⚠️</div>
      <h3>Số lượng người đã vượt quá giới hạn</h3>
      <p>Nhà hàng hiện tại chỉ hỗ trợ đặt bàn qua hệ thống với số lượng giới hạn.</p>
      <p>Vui lòng liên hệ trực tiếp nhà hàng để được hỗ trợ:</p>
      <a href="tel:${restaurant?.phone || "0123456789"}" class="phone-link">
        📞 ${restaurant?.phone || "0123 456 789"}
      </a>
      <button class="btn-close-popup">Đóng</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Animate in
  setTimeout(() => {
    popup.querySelector(".popup-content").style.animation =
      "popupSlideIn 0.3s ease-out";
  }, 10);

  // Close handlers
  const closePopup = () => {
    popup.querySelector(".popup-content").style.animation =
      "popupSlideOut 0.3s ease-out";
    setTimeout(() => {
      popup.remove();
    }, 300);
  };

  popup.querySelector(".btn-close-popup").addEventListener("click", closePopup);
  popup.querySelector(".popup-overlay").addEventListener("click", closePopup);
}
