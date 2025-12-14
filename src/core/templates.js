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
import paymentTpl from "../templates/payment.hbs?raw";
import editBookingTpl from "../templates/edit-booking.hbs?raw";
import bookingDetailTpl from "../templates/booking-detail.hbs?raw";
import historyTpl from "../templates/history.hbs?raw";
import myReviewsTpl from "../templates/my-reviews.hbs?raw";
import helpTpl from "../templates/help.hbs?raw";
import loginTpl from "../templates/login.hbs?raw";
import registerTpl from "../templates/register.hbs?raw";

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
  payment: Handlebars.compile(paymentTpl),
  editBooking: Handlebars.compile(editBookingTpl),
  bookingDetail: Handlebars.compile(bookingDetailTpl),
  history: Handlebars.compile(historyTpl),
  myReviews: Handlebars.compile(myReviewsTpl),
  help: Handlebars.compile(helpTpl),
  login: Handlebars.compile(loginTpl),
  register: Handlebars.compile(registerTpl),
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

  // Helper để tạo range cho rating stars
  Handlebars.registerHelper("range", (n) => {
    return Array.from({ length: n }, (_, i) => i);
  });

  // Helper để subtract
  Handlebars.registerHelper("subtract", (a, b) => {
    return a - b;
  });

  // Helper để format date
  Handlebars.registerHelper("formatDate", (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  });
}

export function renderTemplate(name, data) {
  const tpl = templates[name];
  if (!tpl) {
    throw new Error(`Template not found: ${name}`);
  }
  return tpl(data);
}
