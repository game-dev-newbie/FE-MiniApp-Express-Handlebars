// src/views/homeView.js
import { fetchRestaurants } from "../api/restaurantApi.js";
import { renderTemplate } from "../core/templates.js";

const appEl = document.getElementById("app");

export async function renderHome() {
  appEl.innerHTML = `
    <header class="page-header">
      <h1>Danh sách nhà hàng</h1>
    </header>
    <main id="home-content">
      <p>Đang tải danh sách nhà hàng...</p>
    </main>
  `;

  const contentEl = document.getElementById("home-content");

  try {
    // const restaurants = await fetchRestaurants();

    // // giả sử API trả về { data: [...] } hoặc [] – tuỳ backend của bạn
    // const list = Array.isArray(restaurants.data)
    //   ? restaurants.data
    //   : Array.isArray(restaurants)
    //   ? restaurants
    //   : [];

    // const html = renderTemplate("restaurantList", {
    //   restaurants: list,
    // });
    const restaurants = [
      { id: 1, name: "Nhà hàng A", address: "123 Lê Lợi" },
      { id: 2, name: "Nhà hàng B", address: "456 Nguyễn Huệ" },
    ];

    const html = renderTemplate("restaurantList", { restaurants });

    contentEl.innerHTML = html;

    // delegate click nút Đặt bàn
    contentEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn[data-id]");
      if (!btn) return;

      const id = btn.dataset.id;
      // TODO: lưu id vào state / query, tạm thời cứ chuyển route
      window.location.hash = "#/booking";
    });
  } catch (err) {
    contentEl.innerHTML = `<p class="error">Lỗi tải nhà hàng: ${err.message}</p>`;
  }
}
