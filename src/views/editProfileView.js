// src/views/editProfileView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";
import { chooseImage } from "zmp-sdk/apis";

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
  if (!modal) {
    console.error("❌ Avatar modal not found");
    return;
  }

  console.log("📸 Opening avatar modal");

  // Show modal with animation
  modal.classList.add("active");
  
  // Debug: check modal state
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(modal);
    console.log("Modal display:", computedStyle.display);
    console.log("Modal opacity:", computedStyle.opacity);
    console.log("Modal pointer-events:", computedStyle.pointerEvents);
  }, 100);

  // Close modal function
  const closeModal = () => {
    console.log("🔒 Closing modal");
    modal.classList.remove("active");
  };

  // Close button
  const btnClose = modal.querySelector("#btnCloseAvatarModal");
  if (btnClose) {
    console.log("✅ Close button found");
    btnClose.onclick = (e) => {
      e.stopPropagation();
      console.log("❌ Close button clicked");
      closeModal();
    };
  }

  // Overlay click to close
  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    console.log("✅ Overlay found");
    overlay.onclick = (e) => {
      e.stopPropagation();
      console.log("🖱️ Overlay clicked");
      closeModal();
    };
  }

  // Avatar options selection
  const avatarOptions = modal.querySelectorAll(".avatar-option");
  console.log(`Found ${avatarOptions.length} avatar options`);
  
  avatarOptions.forEach((option, index) => {
    option.onclick = (e) => {
      e.stopPropagation();
      const avatarUrl = option.getAttribute("data-avatar");
      console.log(`🎭 Avatar ${index + 1} clicked:`, avatarUrl);
      selectAvatar(avatarUrl);
      closeModal();
    };
  });

  // Upload button - Use Zalo chooseImage API
  const btnUpload = modal.querySelector("#btnUploadAvatar");
  console.log("Upload button found:", !!btnUpload);
  
  if (btnUpload) {
    btnUpload.onclick = async (e) => {
      e.stopPropagation();
      console.log("📤 Upload button clicked");
      
      try {
        // Try to use Zalo Mini App chooseImage API first
        const { filePaths } = await chooseImage({
          count: 1,
          sourceType: ["album", "camera"],
          cameraType: "front",
        });

        if (filePaths && filePaths.length > 0) {
          const imagePath = filePaths[0];
          selectAvatar(imagePath);
          closeModal();
          console.log("✅ Image selected from Zalo:", imagePath);
        }
      } catch (error) {
        console.warn("Zalo chooseImage not available, falling back to HTML input:", error);

        // Fallback to HTML file input
        const fileInput = modal.querySelector("#avatarUpload");
        if (fileInput) {
          fileInput.click();
        }
      }
    };

    // Fallback file input handler
    const fileInput = modal.querySelector("#avatarUpload");
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        console.log("📁 File selected:", file?.name);
        
        if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            selectAvatar(event.target.result);
            closeModal();
          };
          reader.readAsDataURL(file);
        }
      };
    }
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

    let avatarUrl = selectedAvatarUrl || currentUser.avatar_url;

    // If avatar is a local Zalo path or base64, upload it to server first
    if (
      avatarUrl &&
      (avatarUrl.startsWith("zalo://") || avatarUrl.startsWith("data:image"))
    ) {
      console.log("📤 Uploading avatar to server...");
      try {
        // Upload avatar to backend
        const uploadResult = await uploadAvatarToServer(avatarUrl);
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
          console.log("✅ Avatar uploaded successfully:", avatarUrl);
        }
      } catch (uploadError) {
        console.warn("⚠️ Avatar upload failed, using local path:", uploadError);
        // Continue with local path if upload fails
      }
    }

    // Prepare update data
    const profileData = {
      display_name: displayName,
      avatar_url: avatarUrl,
      phone: phone || currentUser.phone,
      bio: bio || currentUser.bio || "",
    };

    console.log("📝 Updating profile with data:", profileData);

    // Call API to update profile
    const result = await authService.updateProfile(profileData);

    if (!result.success) {
      throw new Error(result.error || "Cập nhật thất bại");
    }

    console.log("✅ Profile updated successfully:", result.user);

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
