// src/views/loginView.js
import { renderTemplate } from "../core/templates.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderLogin() {
  const contentHtml = renderTemplate("login", {});
  appEl.innerHTML = contentHtml;

  initLoginEventListeners();
}

function initLoginEventListeners() {
  // Back button
  const btnBack = document.getElementById("btnBackFromLogin");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Zalo login button
  const btnZaloLogin = document.getElementById("btnZaloLogin");
  if (btnZaloLogin) {
    btnZaloLogin.addEventListener("click", handleZaloLogin);
  }

  // Email login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleEmailLogin);
  }
}

async function handleZaloLogin() {
  const button = document.getElementById("btnZaloLogin");
  const originalText = button.innerHTML;

  try {
    // Show loading state
    button.disabled = true;
    button.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
      </svg>
      <span>Đang đăng nhập...</span>
    `;

    const result = await authService.loginWithZalo();

    if (result.success) {
      console.log("✅ Zalo login successful:", result.user);

      // Show success message
      showNotification("Đăng nhập thành công!", "success");

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Redirect to intended page or home
      setTimeout(() => {
        const redirectPath = authService.getRedirectPath();
        window.location.hash = redirectPath;
      }, 500);
    } else {
      throw new Error(result.error || "Đăng nhập Zalo thất bại");
    }
  } catch (error) {
    console.error("Zalo login error:", error);
    showNotification(error.message, "error");
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

async function handleEmailLogin(event) {
  event.preventDefault();

  const form = event.target;
  const button = document.getElementById("btnSubmitLogin");
  const originalText = button.textContent;

  const email = form.email.value.trim();
  const password = form.password.value;

  // Validation
  if (!email || !password) {
    showNotification("Vui lòng điền đầy đủ thông tin", "error");
    return;
  }

  try {
    // Show loading state
    button.disabled = true;
    button.textContent = "Đang đăng nhập...";

    const result = await authService.loginWithEmail(email, password);

    if (result.success) {
      console.log("✅ Email login successful:", result.user);

      // Show success message
      showNotification("Đăng nhập thành công!", "success");

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Redirect to intended page or home
      setTimeout(() => {
        const redirectPath = authService.getRedirectPath();
        window.location.hash = redirectPath;
      }, 500);
    } else {
      throw new Error(result.error || "Đăng nhập thất bại");
    }
  } catch (error) {
    console.error("Email login error:", error);
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
