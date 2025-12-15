// src/views/editProfileView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

// Predefined avatar options
const AVATAR_OPTIONS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=13",
  "https://i.pravatar.cc/150?img=14",
  "https://i.pravatar.cc/150?img=16",
  "https://i.pravatar.cc/150?img=20",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=33",
  "https://i.pravatar.cc/150?img=41",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=50",
  "https://i.pravatar.cc/150?img=60",
  "https://i.pravatar.cc/150?img=65",
  "https://i.pravatar.cc/150?img=68",
  "https://i.pravatar.cc/150?img=70",
];

let selectedAvatarUrl = null;

export async function renderEditProfile() {
  // Check authentication
  if (!authService.requireAuth("#/edit-profile")) {
    return;
  }

  // Get current user
  const user = authService.getUser();
  if (!user) {
    window.location.hash = "#/login";
    return;
  }

  const contentHtml = renderTemplate("edit-profile", {
    user,
    avatarOptions: AVATAR_OPTIONS,
  });

  appEl.innerHTML = contentHtml;

  // Initialize
  selectedAvatarUrl = user.avatar_url;
  initEditProfileEventListeners();
}

function initEditProfileEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBackFromEditProfile");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Change avatar button
  const btnChangeAvatar = document.getElementById("btnChangeAvatar");
  const avatarContainer = document.querySelector(".avatar-container");
  if (btnChangeAvatar && avatarContainer) {
    const handler = () => showAvatarModal();
    btnChangeAvatar.addEventListener("click", handler);
    avatarContainer.addEventListener("click", handler);
  }

  // Save button
  const btnSave = document.getElementById("btnSaveProfile");
  if (btnSave) {
    btnSave.addEventListener("click", handleSaveProfile);
  }

  // Form submission
  const form = document.getElementById("editProfileForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSaveProfile();
    });
  }

  // Bio character counter
  const bioTextarea = document.getElementById("bio");
  if (bioTextarea) {
    const hint = bioTextarea.parentElement.nextElementSibling;
    bioTextarea.addEventListener("input", (e) => {
      const length = e.target.value.length;
      const maxLength = 200;
      if (length > maxLength) {
        e.target.value = e.target.value.substring(0, maxLength);
      }
      hint.textContent = `${e.target.value.length}/200 ký tự`;
    });
  }
}

function showAvatarModal() {
  const modal = document.getElementById("avatarModal");
  if (!modal) return;

  modal.style.display = "block";
  setTimeout(() => modal.classList.add("active"), 10);

  // Close modal
  const btnClose = document.getElementById("btnCloseAvatarModal");
  const overlay = modal.querySelector(".modal-overlay");

  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  };

  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  // Avatar options selection
  const avatarOptions = modal.querySelectorAll(".avatar-option");
  avatarOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const avatarUrl = option.getAttribute("data-avatar");
      selectAvatar(avatarUrl);
      closeModal();
    });
  });

  // Upload button
  const btnUpload = document.getElementById("btnUploadAvatar");
  const fileInput = document.getElementById("avatarUpload");

  if (btnUpload && fileInput) {
    btnUpload.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectAvatar(event.target.result);
          closeModal();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function selectAvatar(avatarUrl) {
  selectedAvatarUrl = avatarUrl;
  const avatarImg = document.getElementById("profileAvatar");
  if (avatarImg) {
    avatarImg.src = avatarUrl;

    // Add animation
    avatarImg.style.transform = "scale(0.9)";
    setTimeout(() => {
      avatarImg.style.transform = "scale(1)";
    }, 100);
  }

  if (navigator.vibrate) navigator.vibrate(10);
}

async function handleSaveProfile() {
  const btnSave = document.getElementById("btnSaveProfile");
  const form = document.getElementById("editProfileForm");

  if (!form || !btnSave) return;

  // Get form data
  const formData = new FormData(form);
  const displayName = formData.get("displayName")?.trim();
  const phone = formData.get("phone")?.trim();
  const bio = formData.get("bio")?.trim();

  // Validation
  if (!displayName) {
    showNotification("Vui lòng nhập họ và tên", "error");
    return;
  }

  if (phone && !/^[0-9]{10,11}$/.test(phone)) {
    showNotification("Số điện thoại không hợp lệ", "error");
    return;
  }

  // Show loading
  const originalText = btnSave.textContent;
  btnSave.disabled = true;
  btnSave.textContent = "Đang lưu...";

  try {
    // Get current user
    const currentUser = authService.getUser();

    // Update user data
    const updatedUser = {
      ...currentUser,
      display_name: displayName,
      avatar_url: selectedAvatarUrl || currentUser.avatar_url,
      phone: phone || currentUser.phone,
      bio: bio || currentUser.bio || "",
    };

    // In real app, call API:
    // const response = await fetch('/api/user/profile', {
    //   method: 'PUT',
    //   headers: { 'Authorization': `Bearer ${authService.getAccessToken()}` },
    //   body: JSON.stringify(updatedUser)
    // });

    // For now, just save to local storage
    authService.setUser(updatedUser);

    // Show success
    showNotification("Cập nhật thông tin thành công!", "success");

    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);

    // Redirect back to profile
    setTimeout(() => {
      window.location.hash = "#/profile";
    }, 500);
  } catch (error) {
    console.error("Save profile error:", error);
    showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    btnSave.disabled = false;
    btnSave.textContent = originalText;
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      ${
        type === "success"
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9 12l2 2 4-4"></path></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
      }
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
