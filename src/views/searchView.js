// src/views/searchView.js
import { renderTemplate } from "../core/templates.js";

const appEl = document.getElementById("app");

export function renderSearch() {
  const headerHtml = renderTemplate("header", {});
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: 'search' });
  
  const searchContent = `
    <main class="main-content">
      <header class="page-header">
        <h1>Tìm kiếm nhà hàng</h1>
      </header>
      <div style="padding: var(--spacing-lg);">
        <p>Trang search (đang phát triển)...</p>
      </div>
    </main>
  `;
  
  appEl.innerHTML = headerHtml + searchContent + bottomNavHtml;
  
  // Initialize bottom nav
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.getAttribute('data-page');
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      window.location.hash = `#/${page === 'home' ? '' : page}`;
    });
  });
}
