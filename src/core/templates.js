// src/core/templates.js
import Handlebars from "handlebars";
// import raw nội dung file .hbs (Vite hỗ trợ ?raw)
import restaurantListTpl from "../templates/restaurant-list.hbs?raw";

// compile sẵn
const templates = {
  restaurantList: Handlebars.compile(restaurantListTpl),
};

// nếu cần register helpers/partials, làm thêm ở đây
export function registerHelpers() {
  Handlebars.registerHelper("uppercase", (str) =>
    String(str || "").toUpperCase()
  );
}

export function renderTemplate(name, data) {
  const tpl = templates[name];
  if (!tpl) {
    throw new Error(`Template not found: ${name}`);
  }
  return tpl(data);
}
