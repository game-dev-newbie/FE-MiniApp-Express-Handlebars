// src/views/editProfileView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";
import { chooseImage } from "zmp-sdk/apis";
import { DEFAULT_AVATAR } from "../utils/avatarHelper.js";

const appEl = document.getElementById("app");

let selectedAvatarUrl = null;

export async function renderEditProfile() {
  // Check authentication
  if (!authService.requireAuth("#/edit-profile")) {
    return;
  }

  // Show loading state
  appEl.innerHTML = `
    <div class="loading-container" style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    // Fetch user profile from API
    const { getMyProfile } = await import("../api/userApi.js");
    const userData = await getMyProfile();

    console.log("👤 Fetched user profile for editing:", userData);

    // Transform API data to match template format
    const user = {
      id: userData.id,
      display_name: userData.display_name || "",
      name: userData.display_name || "User",
      email: userData.email || "",
      phone: userData.phone || "",
      avatar_url: userData.avatar_url || DEFAULT_AVATAR,
      bio: userData.bio || ""
    };

    const contentHtml = renderTemplate("edit-profile", {
      user,
    });

    appEl.innerHTML = contentHtml;

    // Initialize
    selectedAvatarUrl = user.avatar_url;
    initEditProfileEventListeners();
  } catch (error) {
    console.error("Error loading edit profile:", error);
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <p>Không thể tải thông tin. Vui lòng thử lại.</p>
        <button onclick="window.history.back()" class="btn-primary">Quay lại</button>
      </div>
    `;
  }
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

// Helper function to compress image before upload
async function compressImage(file, maxWidth = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showAvatarModal() {
  const modal = document.getElementById("avatarModal");
  if (!modal) {
    console.error("❌ Avatar modal not found");
    return;
  }

  console.log("📸 Opening avatar modal");

  // Show modal with animation
  modal.classList.add("active");

  // Close modal function  
  const closeModal = () => {
    console.log("🔒 Closing modal");
    modal.classList.remove("active");
  };

  // Close button
  const btnClose = modal.querySelector("#btnCloseAvatarModal");
  if (btnClose) {
    btnClose.onclick = (e) => {
      e.stopPropagation();
      closeModal();
    };
  }

  // Overlay click to close
  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.onclick = (e) => {
      e.stopPropagation();
      closeModal();
    };
  }

  // Upload button - trigger file input
  const btnUpload = modal.querySelector("#btnUploadAvatar");
  const fileInput = modal.querySelector("#avatarUpload");
  
  if (btnUpload && fileInput) {
    btnUpload.onclick = (e) => {
      e.stopPropagation();
      console.log("📤 Upload button clicked");
      fileInput.click();
    };

    // Handle file selection - auto upload
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      console.log("📁 File selected:", file?.name, `(${(file?.size / 1024 / 1024).toFixed(2)}MB)`);
      
      if (file && file.type.startsWith("image/")) {
        try {
          // Show loading state
          btnUpload.disabled = true;
          btnUpload.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Đang nén ảnh...
          `;

          // Compress image first
          console.log("🗜️ Compressing image...");
          const compressedFile = await compressImage(file);
          console.log("✅ Compressed:", `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

          // Update loading text
          btnUpload.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinner">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Đang tải lên...
          `;

          // Upload compressed image to server
          const { uploadAvatar } = await import("../api/userApi.js");
          const uploadResult = await uploadAvatar(compressedFile);
          
          console.log("✅ Upload successful:", uploadResult);

          // Update profile with new avatar path
          const { updateMyProfile } = await import("../api/userApi.js");
          await updateMyProfile({
            avatar_url: uploadResult.path  // Use relative path for DB
          });

          console.log("✅ Profile updated with new avatar");

          // Update local display with full URL
          selectAvatar(uploadResult.url);
          
          // Close modal
          closeModal();
          
          // Show success notification
          showNotification("Cập nhật ảnh đại diện thành công!", "success");

          // Reset file input
          fileInput.value = "";
        } catch (error) {
          console.error("Upload error:", error);
          showNotification(
            error.message || "Tải ảnh lên thất bại. Vui lòng thử lại.",
            "error"
          );
          
          // Reset button
          btnUpload.disabled = false;
          btnUpload.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Chọn ảnh
          `;
          
          // Reset file input
          fileInput.value = "";
        }
      } else if (file) {
        showNotification("Vui lòng chọn file ảnh hợp lệ", "error");
        fileInput.value = "";
      }
    };
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

  console.log(
    "✅ Avatar selected (will be saved when clicking Save button):",
    avatarUrl.substring(0, 50) + "..."
  );
}

async function handleSaveProfile() {
  const btnSave = document.getElementById("btnSaveProfile");
  const form = document.getElementById("editProfileForm");

  if (!form || !btnSave) return;

  // Get form data
  const formData = new FormData(form);
  const displayName = formData.get("displayName")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();

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
    let avatarUrl = selectedAvatarUrl;

    // If avatar is a local Zalo path or base64, upload it to server first
    if (
      avatarUrl &&
      (avatarUrl.startsWith("zalo://") || avatarUrl.startsWith("data:image"))
    ) {
      console.log("📤 Uploading avatar to server...");
      try {
        const uploadResult = await uploadAvatarToServer(avatarUrl);
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
          console.log("✅ Avatar uploaded successfully:", avatarUrl);
        }
      } catch (uploadError) {
        console.warn("⚠️ Avatar upload failed, skipping avatar update:", uploadError);
        avatarUrl = null; // Don't update avatar if upload fails
      }
    }

    // Prepare update data - only include non-empty fields
    const profileData = {};
    
    if (displayName) profileData.display_name = displayName;
    if (phone) profileData.phone = phone;
    if (email) profileData.email = email;
    if (avatarUrl && avatarUrl !== selectedAvatarUrl) {
      profileData.avatar_url = avatarUrl;
    }

    console.log("📝 Updating profile with data:", profileData);

    // Call API to update profile
    const { updateMyProfile } = await import("../api/userApi.js");
    const updatedUser = await updateMyProfile(profileData);

    console.log("✅ Profile updated successfully:", updatedUser);

    // Show success
    showNotification("Cập nhật thông tin thành công!", "success");

    if (navigator.vibrate) navigator.vibrate([50, 100, 50]);

    // Redirect back to profile
    setTimeout(() => {
      window.location.hash = "#/profile";
    }, 500);
  } catch (error) {
    console.error("Save profile error:", error);
    showNotification(
      error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      "error"
    );
    btnSave.disabled = false;
    btnSave.textContent = originalText;
  }
}

// Helper function to upload avatar to server
async function uploadAvatarToServer(localPath) {
  try {
    // Import uploadAvatar from userApi
    const { uploadAvatar } = await import("../api/userApi.js");
    
    // If it's base64, convert to File/Blob
    if (localPath.startsWith("data:image")) {
      // Convert base64 to blob
      const response = await fetch(localPath);
      const blob = await response.blob();
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      
      console.log("📤 Uploading avatar file to server...");
      const result = await uploadAvatar(file);
      
      return { success: true, url: result.url };
    }

    // For Zalo local path, you might need to fetch it first
    // This is a placeholder - Zalo paths need special handling
    console.warn("Zalo local path - using directly:", localPath);
    return { success: false, url: localPath };
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
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
