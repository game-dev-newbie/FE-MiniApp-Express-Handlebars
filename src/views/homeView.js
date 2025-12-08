// src/views/homeView.js
import { fetchRestaurants } from "../api/restaurantApi.js";
import { renderTemplate } from "../core/templates.js";

const appEl = document.getElementById("app");

export async function renderHome() {
  // Render header and bottom nav
  const headerHtml = renderTemplate("header", {});
  const bottomNavHtml = renderTemplate("bottomNav", { activePage: 'home' });
  
  // Sample data for restaurants
  const restaurants = [
    { 
      id: 1, 
      name: "Phòng VIP Sang Trọng", 
      address: "Quận 1, TP.HCM", 
      price: "500.000đ / bàn",
      category: "recommended",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    { 
      id: 2, 
      name: "Bàn Riêng Tư 4-6 Người", 
      address: "Quận 3, TP.HCM", 
      price: "350.000đ / bàn",
      category: "recommended",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    { 
      id: 3, 
      name: "Sân Vườn Ngoài Trời", 
      address: "Quận 2, TP.HCM", 
      price: "400.000đ / bàn",
      category: "popular",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    { 
      id: 4, 
      name: "Rooftop View Lãng Mạn", 
      address: "Quận 7, TP.HCM", 
      price: "600.000đ / bàn",
      category: "trending",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    { 
      id: 5, 
      name: "Phòng Gia Đình Rộng Rãi", 
      address: "Quận 5, TP.HCM", 
      price: "450.000đ / bàn",
      category: "popular",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
    },
    { 
      id: 6, 
      name: "Bàn Cạnh Cửa Sổ", 
      address: "Quận 10, TP.HCM", 
      price: "300.000đ / bàn",
      category: "trending",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    },
  ];

  const recentBooking = {
    name: "President Restaurant",
    address: "Quận 1, TP.HCM",
    rating: "4.8",
    reviews: "6,283",
    price: "350.000đ",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  };

  const contentHtml = renderTemplate("homeContent", {
    userName: "Nguyễn Văn A",
    restaurants,
    recentBooking
  });

  appEl.innerHTML = headerHtml + contentHtml + bottomNavHtml;

  // Initialize event listeners
  initHomeEventListeners();
}

function initHomeEventListeners() {
  // Filter tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const restaurantCards = document.querySelectorAll('.restaurant-card');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const selectedCategory = button.getAttribute('data-category');
      
      restaurantCards.forEach((card, index) => {
        const cardCategory = card.getAttribute('data-category');
        
        if (selectedCategory === 'recommended' || cardCategory === selectedCategory) {
          card.style.display = 'block';
          card.style.animation = 'none';
          setTimeout(() => {
            card.style.animation = `fadeIn 350ms ease-out ${index * 100}ms both`;
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      restaurantCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const location = card.querySelector('.card-location').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || location.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }, 300));
  }
  
  // Bottom navigation
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
  
  // Bookmark functionality
  const bookmarkCardButtons = document.querySelectorAll('.bookmark-card-btn');
  bookmarkCardButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      button.classList.toggle('active');
      
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
  
  // Header buttons
  const notificationBtn = document.getElementById('notificationBtn');
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const profileBtn = document.getElementById('profileBtn');
  const filterBtn = document.getElementById('filterBtn');
  
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      alert('Bạn có 3 thông báo mới!');
    });
  }
  
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      alert('Danh sách đã lưu');
    });
  }
  
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.location.hash = '#/profile';
    });
  }
  
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      alert('Bộ lọc nâng cao đang được phát triển!');
    });
  }
  
  // Restaurant card click
  restaurantCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.card-title').textContent;
      alert(`Bạn đã chọn: ${title}`);
    });
  });
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

