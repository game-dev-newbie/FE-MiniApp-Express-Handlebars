// src/core/templates.js
import Handlebars from "handlebars";
// import raw nội dung file .hbs (Vite hỗ trợ ?raw)
import restaurantListTpl from "../templates/restaurant-list.hbs?raw";
import splashScreenTpl from "../templates/splash-screen.hbs?raw";
import onboardingTpl from "../templates/onboarding.hbs?raw";
import headerTpl from "../templates/header.hbs?raw";
import bottomNavTpl from "../templates/bottom-nav.hbs?raw";
import homeContentTpl from "../templates/home-content.hbs?raw";
import categoryListTpl from "../templates/category-list.hbs?raw";
import notificationsTpl from "../templates/notifications.hbs?raw";
import favoritesTpl from "../templates/favorites.hbs?raw";
import bookingTpl from "../templates/booking.hbs?raw";
import profileTpl from "../templates/profile.hbs?raw";
import searchTpl from "../templates/search.hbs?raw";
import restaurantDetailTpl from "../templates/restaurant-detail.hbs?raw";
import bookingFormTpl from "../templates/booking-form.hbs?raw";

// compile sẵn
const templates = {
  restaurantList: Handlebars.compile(restaurantListTpl),
  splashScreen: Handlebars.compile(splashScreenTpl),
  onboarding: Handlebars.compile(onboardingTpl),
  header: Handlebars.compile(headerTpl),
  bottomNav: Handlebars.compile(bottomNavTpl),
  homeContent: Handlebars.compile(homeContentTpl),
  categoryList: Handlebars.compile(categoryListTpl),
  notifications: Handlebars.compile(notificationsTpl),
  favorites: Handlebars.compile(favoritesTpl),
  booking: Handlebars.compile(bookingTpl),
  profile: Handlebars.compile(profileTpl),
  search: Handlebars.compile(searchTpl),
  restaurantDetail: Handlebars.compile(restaurantDetailTpl),
  bookingForm: Handlebars.compile(bookingFormTpl),
};

// nếu cần register helpers/partials, làm thêm ở đây
export function registerHelpers() {
  Handlebars.registerHelper("uppercase", (str) =>
    String(str || "").toUpperCase()
  );

  // Helper để so sánh bằng
  Handlebars.registerHelper("eq", (a, b) => a === b);

  // Helper để split string
  Handlebars.registerHelper("split", (str, delimiter) => {
    if (!str) return [];
    return String(str).split(delimiter);
  });

  // Helper để format currency
  Handlebars.registerHelper("formatCurrency", (amount) => {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  });
}

export function renderTemplate(name, data) {
  const tpl = templates[name];
  if (!tpl) {
    throw new Error(`Template not found: ${name}`);
  }
  return tpl(data);
}
