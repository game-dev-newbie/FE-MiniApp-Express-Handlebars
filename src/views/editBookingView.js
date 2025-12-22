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
  // Show loading
  appEl.innerHTML = '<div class="loading-spinner">Đang tải...</div>';

  try {
    // Fetch booking detail from API
    const { getBookingDetail } = await import("../api/bookingApi.js");
    const booking = await getBookingDetail(bookingId);

    if (!booking) {
      alert("Không tìm thấy thông tin đặt bàn");
      window.location.hash = "#/booking";
      return;
    }

    console.log("📦 Booking detail for editing:", booking);

    // Get restaurant info from booking
    const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
    const restaurantImage = booking.Restaurant?.main_image_url
      ? (booking.Restaurant.main_image_url.startsWith('http')
          ? booking.Restaurant.main_image_url
          : `${baseURL}${booking.Restaurant.main_image_url}`)
      : "";

    const restaurant = {
      id: booking.restaurant_id,
      name: booking.Restaurant?.name || "Nhà hàng",
      address: booking.Restaurant?.address || "",
      phone: booking.Restaurant?.phone || "",
      image: restaurantImage,
      require_deposit: booking.Restaurant?.require_deposit || false,
      default_deposit_amount: booking.Restaurant?.default_deposit_amount || 0,
    };

    // Format booking data for template
    const formattedBooking = {
      id: booking.id,
      restaurantId: booking.restaurant_id,
      date: booking.booking_time.split(" ")[0],
      time: booking.booking_time.split(" ")[1].substring(0, 5),
      people: booking.people_count,
      tables: booking.RestaurantTable ? [booking.RestaurantTable.name] : [],
      customerName: booking.customer_name,
      customerPhone: booking.phone,
      notes: booking.note || "",
      status: booking.status,
    };

    const contentHtml = renderTemplate("editBooking", {
      restaurant,
      booking: formattedBooking,
    });

    appEl.innerHTML = contentHtml;

    // Initialize selected tables from booking
    selectedTables = [];
    if (booking.RestaurantTable) {
      selectedTables.push({
        id: booking.table_id,
        name: booking.RestaurantTable.name,
        capacity: booking.RestaurantTable.capacity,
      });
    }

    // Initialize event listeners
    initEditBookingListeners(formattedBooking, restaurant);
  } catch (error) {
    console.error("Error loading booking for edit:", error);
    alert("Không thể tải thông tin đặt bàn. Vui lòng thử lại.");
    window.location.hash = "#/booking";
  }
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

  // Don't show capacity popup on initial load
  // Only show when user changes people count

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

    // Prepare update data for API (separate date and time fields)
    const bookingDate = document.getElementById("bookingDate").value;
    const bookingTime = document.getElementById("bookingTime").value;
    const formattedTime = bookingTime.length > 5 ? bookingTime.substring(0, 5) : bookingTime;

    const updateData = {
      booking_date: bookingDate,           // YYYY-MM-DD
      booking_time: formattedTime,         // HH:mm
      people_count: parseInt(document.getElementById("peopleCount").value),
      table_id: selectedTables.length > 0 ? selectedTables[0].id : null,
      customer_name: document.getElementById("customerName").value,
      phone: document.getElementById("customerPhone").value,
      note: document.getElementById("bookingNote").value || null,
    };

    console.log("📤 Updating booking via API:", updateData);

    // Show loading
    const btnSubmit = document.querySelector(".btn-submit-booking");
    const originalText = btnSubmit?.textContent;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Đang cập nhật...";
    }

    try {
      // Call update booking API
      const { updateBooking } = await import("../api/bookingApi.js");
      const updatedBooking = await updateBooking(originalBooking.id, updateData);

      console.log("✅ Booking updated successfully:", updatedBooking);

      // Show success popup
      showSuccessPopup();

      // Redirect to upcoming bookings after popup
      setTimeout(() => {
        window.location.hash = "#/booking";
      }, 2000);
    } catch (error) {
      console.error("❌ Error updating booking:", error);
      
      // Show error message
      alert(error.message || "Không thể cập nhật đặt bàn. Vui lòng thử lại!");
      
      // Re-enable button
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
      }
    }
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

// Get available tables from API
async function fetchAvailableTablesForEdit(restaurantId, peopleCount, date, time) {
  try {
    const { getAvailableTables: getAvailableTablesAPI } = await import("../api/bookingApi.js");
    
    // Format time to HH:mm (remove seconds if present)
    const formattedTime = time.length > 5 ? time.substring(0, 5) : time;
    
    const response = await getAvailableTablesAPI({
      restaurant_id: restaurantId,
      booking_date: date,        // YYYY-MM-DD format
      booking_time: formattedTime, // HH:mm format
      people_count: peopleCount,
    });
    
    console.log("📋 Available tables query:", { restaurant_id: restaurantId, booking_date: date, booking_time: formattedTime, people_count: peopleCount });
    
    return response.items || [];
  } catch (error) {
    console.error("Error fetching available tables:", error);
    return [];
  }
}

// Update available tables based on people count
async function updateAvailableTables(restaurantId, peopleCount) {
  const tablesSection = document.getElementById("tablesSection");
  const tablesGrid = document.getElementById("tablesGrid");

  if (!tablesSection || !tablesGrid) return;

  // Show loading
  tablesGrid.innerHTML = '<p class="loading-message">Đang tải danh sách bàn...</p>';
  tablesSection.style.display = "block";

  // Get booking date and time from form
  const bookingDate = document.getElementById("bookingDate").value;
  const bookingTime = document.getElementById("bookingTime").value;

  // Fetch available tables from API
  const availableTables = await fetchAvailableTablesForEdit(
    restaurantId,
    peopleCount,
    bookingDate,
    bookingTime
  );

  // Store globally for click handlers
  currentAvailableTables = availableTables;

  console.log("🪑 Available tables from API:", availableTables);

  // Categorize tables by type (like create form)
  const standardTables = availableTables.filter(t => !t.name?.toLowerCase().includes('vip'));
  const vipTables = availableTables.filter(t => t.name?.toLowerCase().includes('vip'));

  // Render tables
  let tablesHTML = "";

  if (availableTables.length === 0) {
    tablesHTML = '<p class="no-tables-message">Không có bàn phù hợp. Vui lòng thay đổi ngày giờ hoặc số người.</p>';
  } else {
    // Standard tables
    if (standardTables.length > 0) {
      tablesHTML += `
        <div class="table-type-section">
          <h3 class="table-type-title">Bàn thường</h3>
          <div class="table-cards">
            ${standardTables.map((table) => createTableCard(table)).join("")}
          </div>
        </div>
      `;
    }

    // VIP tables  
    if (vipTables.length > 0) {
      tablesHTML += `
        <div class="table-type-section">
          <h3 class="table-type-title">Bàn VIP</h3>
          <div class="table-cards">
            ${vipTables.map((table) => createTableCard(table)).join("")}
          </div>
        </div>
      `;
    }
  }



  tablesGrid.innerHTML = tablesHTML;

  // Add click listeners to table cards
  attachTableCardListeners(restaurantId);
  updateSelectedTablesSummary();
}

// Create table card HTML
function createTableCard(table) {
  const isSelected = selectedTables.some((t) => t.id === table.id);
  // Determine type from name (check if name contains 'VIP')
  const tableType = table.name?.toLowerCase().includes('vip') ? 'vip' : 'standard';
  
  return `
    <div class="table-card ${tableType} ${isSelected ? "selected" : ""}" data-table-id="${table.id}">
      <div class="table-card-header">
        <span class="table-name">${table.name}</span>
        <span class="table-capacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          ${table.capacity}
        </span>
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
let currentAvailableTables = []; // Global storage for available tables

function handleTableSelection(tableId, restaurantId) {
  const peopleCount = parseInt(document.getElementById("peopleCount").value);
  
  // Find the table from stored available tables
  const table = currentAvailableTables.find((t) => t.id === parseInt(tableId));
  if (!table) {
    console.error("Table not found:", tableId);
    return;
  }

  // Check if already selected
  const isAlreadySelected = selectedTables.some((t) => t.id === parseInt(tableId));

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

  // Format image URL from API response
  const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";
  const formatImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${baseURL}${url}`;
  };

  const tableImage = formatImageUrl(table.view_image_url) || 
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EKhông có ảnh%3C/text%3E%3C/svg%3E";

  modalBody.innerHTML = `
    <div class="table-preview">
      <img src="${tableImage}" alt="${table.name}" class="table-preview-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\'%3E%3Crect fill=\\'%23f0f0f0\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext fill=\\'%23999\\' font-family=\\'sans-serif\\' font-size=\\'24\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3EKhông có ảnh%3C/text%3E%3C/svg%3E'" />
      <div class="table-preview-info">
        <h2>${table.name}</h2>
        <div class="table-preview-meta">
          <span class="table-preview-type ${table.name?.toLowerCase().includes('vip') ? 'vip' : 'standard'}">
            ${table.name?.toLowerCase().includes('vip') ? "⭐ Bàn VIP" : "🍽️ Bàn Thường"}
          </span>
          <span class="table-preview-capacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            Sức chứa: ${table.capacity} người
          </span>
        </div>
        ${table.location ? `<p class="table-location"><strong>📍 Vị trí:</strong> ${table.location}</p>` : ''}
        ${table.view_note ? `<p class="table-note"><strong>📝 Ghi chú:</strong> ${table.view_note}</p>` : ''}
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
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tableId = parseInt(btn.dataset.tableId); // Convert to number
      console.log("🗑️ Removing table ID:", tableId);
      selectedTables = selectedTables.filter((t) => t.id !== tableId);
      // Get restaurantId from form data
      const restaurantId = parseInt(
        document.getElementById("restaurantId")?.value || 
        document.querySelector("[data-restaurant-id]")?.dataset.restaurantId || 
        0
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
