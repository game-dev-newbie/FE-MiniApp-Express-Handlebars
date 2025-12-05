// src/core/router.js

import { renderHome } from "../views/homeView.js";

export function initRouter() {
  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange(); // chạy lần đầu
}

function handleRouteChange() {
  const hash = window.location.hash || "#/";
  // hiện tại chỉ có mỗi trang home thôi
  renderHome();
}
