// src/views/registerView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderRegister() {
  const contentHtml = renderTemplate("register", {});
  appEl.innerHTML = contentHtml;

  initRegisterEventListeners();
}

function initRegisterEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBackFromRegister");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Zalo register button (same as login for Zalo)
  const btnZaloRegister = document.getElementById("btnZaloRegister");
  if (btnZaloRegister) {
    btnZaloRegister.addEventListener("click", handleZaloRegister);
  }

  // Email register form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleEmailRegister);
  }
}

async function handleZaloRegister() {
  const button = document.getElementById("btnZaloRegister");
  const originalText = button.innerHTML;

  try {
    // Show loading state
    button.disabled = true;
    button.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
      </svg>
      <span>Đang xử lý...</span>
    `;

    // Zalo login/register is the same - backend handles auto registration
    const result = await authService.loginWithZalo();

    if (result.success) {
      console.log("✅ Zalo registration/login successful:", result.user);

      // Show success message
      showNotification("Đăng ký thành công!", "success");

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Redirect to intended page or home
      setTimeout(() => {
        const redirectPath = authService.getRedirectPath();
        // Use replace to avoid keeping register page in history
        window.location.replace(redirectPath);
      }, 500);
    } else {
      throw new Error(result.error || "Đăng ký Zalo thất bại");
    }
  } catch (error) {
    console.error("Zalo register error:", error);
    showNotification(error.message, "error");
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

async function handleEmailRegister(event) {
  event.preventDefault();

  const form = event.target;
  const button = document.getElementById("btnSubmitRegister");
  const originalText = button.textContent;

  const displayName = form.displayName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const passwordConfirm = form.passwordConfirm.value;

  // Validation
  if (!displayName || !email || !password || !passwordConfirm) {
    showNotification("Vui lòng điền đầy đủ thông tin", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Mật khẩu phải có ít nhất 6 ký tự", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showNotification("Mật khẩu xác nhận không khớp", "error");
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Email không hợp lệ", "error");
    return;
  }

  try {
    // Show loading state
    button.disabled = true;
    button.textContent = "Đang đăng ký...";

    const result = await authService.registerWithEmail(
      email,
      password,
      displayName,
      passwordConfirm
    );

    if (result.success) {
      console.log("✅ Email registration successful:", result.user);

      // Show success message
      showNotification("Đăng ký thành công!", "success");

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Redirect to intended page or home
      setTimeout(() => {
        const redirectPath = authService.getRedirectPath();
        // Use replace to avoid keeping register page in history
        window.location.replace(redirectPath);
      }, 500);
    } else {
      throw new Error(result.error || "Đăng ký thất bại");
    }
  } catch (error) {
    console.error("Email register error:", error);
    showNotification(error.message, "error");
    button.disabled = false;
    button.textContent = originalText;
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `auth-notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
