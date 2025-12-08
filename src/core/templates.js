// src/core/templates.js
import Handlebars from "handlebars";
// import raw nội dung file .hbs (Vite hỗ trợ ?raw)
import restaurantListTpl from "../templates/restaurant-list.hbs?raw";
import splashScreenTpl from "../templates/splash-screen.hbs?raw";
import onboardingTpl from "../templates/onboarding.hbs?raw";
import headerTpl from "../templates/header.hbs?raw";
import bottomNavTpl from "../templates/bottom-nav.hbs?raw";
import homeContentTpl from "../templates/home-content.hbs?raw";

// compile sẵn
const templates = {
  restaurantList: Handlebars.compile(restaurantListTpl),
  splashScreen: Handlebars.compile(splashScreenTpl),
  onboarding: Handlebars.compile(onboardingTpl),
  header: Handlebars.compile(headerTpl),
  bottomNav: Handlebars.compile(bottomNavTpl),
  homeContent: Handlebars.compile(homeContentTpl),
};

// nếu cần register helpers/partials, làm thêm ở đây
export function registerHelpers() {
  Handlebars.registerHelper("uppercase", (str) =>
    String(str || "").toUpperCase()
  );
  
  // Helper để so sánh bằng
  Handlebars.registerHelper("eq", (a, b) => a === b);
}

export function renderTemplate(name, data) {
  const tpl = templates[name];
  if (!tpl) {
    throw new Error(`Template not found: ${name}`);
  }
  return tpl(data);
}
