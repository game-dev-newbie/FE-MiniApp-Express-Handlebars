// src/views/restaurantDetailView.js
import { renderTemplate } from "../core/templates.js";
import { toggleFavorite, isFavorite } from "../utils/favoritesHelper.js";
import {
  fetchRestaurantDetail,
  fetchRestaurantReviews,
} from "../api/restaurantApi.js";
import authService from "../utils/authService.js";

const appEl = document.getElementById("app");

export async function renderRestaurantDetail(restaurantId) {
  // Show beautiful skeleton loading state
  appEl.innerHTML = `
    <main class="main-content">
      <!-- Image carousel skeleton -->
      <div class="skeleton" style="height: 280px; border-radius: 0; margin: 0;"></div>
      
      <!-- Restaurant info skeleton -->
      <div class="restaurant-info-section" style="padding: 20px;">
        <div class="skeleton skeleton-title" style="width: 70%; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 50%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 40%; margin-bottom: 16px;"></div>
        
        <!-- Rating skeleton -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <div class="skeleton" style="width: 100px; height: 32px; border-radius: 16px;"></div>
          <div class="skeleton" style="width: 100px; height: 32px; border-radius: 16px;"></div>
        </div>
        
        <!-- Action buttons skeleton -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button"></div>
        </div>
      </div>
      
      <!-- Tabs skeleton -->
      <div style="padding: 0 20px; margin-top: 24px;">
        <div style="display: flex; gap: 24px; border-bottom: 2px solid #f0f0f0; margin-bottom: 20px;">
          <div class="skeleton" style="width: 80px; height: 40px;"></div>
          <div class="skeleton" style="width: 80px; height: 40px;"></div>
          <div class="skeleton" style="width: 80px; height: 40px;"></div>
        </div>
      </div>
      
      <!-- Content skeleton -->
      <div style="padding: 0 20px;">
        ${Array(2).fill(`
          <div style="margin-bottom: 20px;">
            <div class="skeleton skeleton-text" style="width: 100%; margin-bottom: 8px;"></div>
            <div class="skeleton skeleton-text" style="width: 90%; margin-bottom: 8px;"></div>
            <div class="skeleton skeleton-text" style="width: 75%;"></div>
          </div>
        `).join('')}
      </div>
    </main>
  `;

  try {
    // Fetch restaurant detail from API (includes info + images + deposit info)
    const restaurant = await fetchRestaurantDetail(restaurantId);

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // Base URL for constructing full URLs
    const baseURL = "https://pyramidally-unborrowed-cherie.ngrok-free.dev";

    // Fetch reviews from API with pagination
    const reviewsResponse = await fetchRestaurantReviews(restaurantId, {
      limit: 20,
      offset: 0,
    });

    // Extract and process reviews from response
    const reviews = (reviewsResponse?.items || []).map(review => {
      // Helper to build avatar URL
      const avatarUrl = review.User?.avatar_url
        ? (review.User.avatar_url.startsWith('http')
            ? review.User.avatar_url
            : `${baseURL}${review.User.avatar_url}`)
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2322c55e'/%3E%3Cpath d='M50 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zm0 7.5c-10 0-30 5-30 15V75h60v-7.5c0-10-20-15-30-15z' fill='white'/%3E%3C/svg%3E"; // Default green avatar

      return {
        id: review.id,
        userName: review.User?.display_name || "Khách hàng",
        userAvatar: avatarUrl,
        rating: review.rating || 0,
        comment: review.comment || "",
        created_at: review.created_at,
        formattedTime: formatReviewDateTime(review.created_at),
        // Restaurant reply
        hasReply: !!review.reply_comment,
        replyComment: review.reply_comment || "",
        replyTime: review.reply_created_at ? formatReviewDateTime(review.reply_created_at) : "",
      };
    });

    console.log("📝 Processed reviews:", reviews);

    // Transform restaurant data to match template expectations
    // Helper function to format image URL
    const formatImageUrl = (url) => {
      if (!url) return null;
      return url.startsWith('http') ? url : `${baseURL}${url}`;
    };
    
    // Fallback image
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
    
    // Get carousel images - ONLY GALLERY type
    const carouselImages = (restaurant.images || [])
      .filter(img => img.type === 'GALLERY')
      .map(img => formatImageUrl(img.file_path))
      .filter(url => url !== null);
    
    // If no GALLERY images, add fallback
    if (carouselImages.length === 0) {
      carouselImages.push(fallbackImage);
    }
    
    const transformedRestaurant = {
      ...restaurant,
      // Format time fields
      opening_hours: restaurant.open_time?.substring(0, 5) || "08:00",
      closing_hours: restaurant.close_time?.substring(0, 5) || "22:00",
      
      // Derive cuisine from tags
      cuisine: restaurant.tags?.split(',')[0] || "Đa dạng",
      
      // Add priceRange from deposit
      priceRange: restaurant.default_deposit_amount > 0
        ? `Đặt cọc: ${restaurant.default_deposit_amount.toLocaleString('vi-VN')}đ`
        : "Miễn phí",
      
      // Main image for compatibility (first GALLERY image or fallback)
      image: carouselImages[0],
      
      // Carousel images for template (GALLERY only)
      carouselImages: carouselImages,
      
      // Format menu images (MENU type only)
      menuImages: (restaurant.images || [])
        .filter(img => img.type === 'MENU')
        .map(img => formatImageUrl(img.file_path))
        .filter(url => url !== null)
    };

    const restaurantDetailContent = renderTemplate("restaurantDetail", {
      restaurant: transformedRestaurant,
      reviews,
    });

    appEl.innerHTML = restaurantDetailContent;

    // Ensure scroll to top after DOM is rendered
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    // Initialize event listeners
    initRestaurantDetailListeners(restaurant);
    initCarousel();
    setupReviewUpdateListeners(restaurantId);
  } catch (error) {
    console.error("Error loading restaurant detail:", error);

    // Show error state
    appEl.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 40px 20px;">
        <h2>Không thể tải thông tin nhà hàng</h2>
        <p style="color: #666; margin: 16px 0;">Vui lòng thử lại sau.</p>
        <button onclick="window.location.hash='#/home'" class="btn-primary">Về trang chủ</button>
      </div>
    `;
  }
}

function initRestaurantDetailListeners(restaurant) {
  // Back button
  const btnBack = document.getElementById("btnBackFromDetail");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Bookmark button with favorites helper
  const btnBookmark = document.querySelector(".btn-bookmark-detail");
  if (btnBookmark) {
    // Set initial state
    if (isFavorite(restaurant.id)) {
      btnBookmark.classList.add("active");
    }

    btnBookmark.addEventListener("click", () => {
      // Check if user is logged in before allowing favorite
      if (!authService.isAuthenticated()) {
        authService.requireAuth(`#/restaurant/${restaurant.id}`);
        return;
      }

      toggleFavorite(restaurant.id);
      btnBookmark.classList.toggle("active");
    });
  }

  // Book restaurant button - updated ID
  const btnBook = document.getElementById("btnBookTable");
  if (btnBook) {
    btnBook.addEventListener("click", () => {
      window.location.hash = `#/booking/new/${restaurant.id}`;
    });
  }

  // Menu Image Lightbox
  initMenuLightbox();
}

// Menu Image Lightbox functionality
function initMenuLightbox() {
  const menuItems = document.querySelectorAll('.menu-image-item');
  const lightbox = document.getElementById('menuLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('closeLightbox');
  const prevBtn = document.getElementById('prevMenu');
  const nextBtn = document.getElementById('nextMenu');
  const overlay = lightbox?.querySelector('.lightbox-overlay');
  
  if (!lightbox || menuItems.length === 0) return;

  let currentIndex = 0;
  const menuImages = Array.from(menuItems).map(item => item.dataset.menuSrc);

  console.log('🖼️ Menu images:', menuImages); // Debug

  // Navigation function
  const showLightboxImage = (index) => {
    const imgSrc = menuImages[index];
    console.log('📸 Loading image:', imgSrc); // Debug
    
    lightboxImage.src = imgSrc;
    lightboxCounter.textContent = `${index + 1} / ${menuImages.length}`;
    
    // Show loading state
    lightboxImage.style.opacity = '0';
    
    // Fade in when loaded
    lightboxImage.onload = () => {
      lightboxImage.style.opacity = '1';
      lightboxImage.style.transition = 'opacity 0.3s ease';
    };
    
    lightboxImage.onerror = () => {
      console.error('❌ Failed to load image:', imgSrc);
      lightboxImage.alt = 'Không thể tải ảnh';
    };
  };

  // Open lightbox
  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIndex = index;
      showLightboxImage(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    });
  });

  // Close lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeLightbox);
  overlay?.addEventListener('click', closeLightbox);

  // Previous image
  prevBtn?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + menuImages.length) % menuImages.length;
    showLightboxImage(currentIndex);
  });

  // Next image
  nextBtn?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % menuImages.length;
    showLightboxImage(currentIndex);
  });

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn?.click();
    if (e.key === 'ArrowRight') nextBtn?.click();
  };
  
  document.addEventListener('keydown', handleKeydown);

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;

  lightboxImage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  lightboxImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextBtn?.click();
    if (touchEndX - touchStartX > 50) prevBtn?.click();
  });
}

// Carousel functionality
function initCarousel() {
  const carousel = document.getElementById("restaurantCarousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(
    ".carousel-indicators .indicator"
  );
  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    indicators.forEach((ind) => ind.classList.remove("active"));

    slides[index].classList.add("active");
    indicators[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Auto play every 3 seconds
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // Manual slide selection
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  carousel.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchStartX - touchEndX > 50) {
      // Swipe left
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
      stopAutoPlay();
      startAutoPlay();
    }
  }

  // Start auto play
  startAutoPlay();

  // Pause on hover (for desktop)
  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
}

// Setup listener for new reviews
let currentReviewListener = null;

function setupReviewListener(restaurantId) {
  // Remove existing listener if any
  if (currentReviewListener) {
    window.removeEventListener("reviewSubmitted", currentReviewListener);
  }

  // Define handler function
  currentReviewListener = (event) => {
    const { restaurantId: reviewRestaurantId } = event.detail;

    console.log(
      "Review submitted event received:",
      reviewRestaurantId,
      "current:",
      restaurantId
    );

    // Only reload if review is for current restaurant and we're still on this page
    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log(
        "✅ New review for current restaurant detected, reloading..."
      );

      // Reload restaurant detail to show new review
      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 800);
    }
  };

  // Attach listener
  window.addEventListener("reviewSubmitted", currentReviewListener);
}

// Setup listener for review updates and deletes
function setupReviewUpdateListeners(restaurantId) {
  // Handler for review updates
  const updateHandler = (event) => {
    const { reviewId, restaurantId: reviewRestaurantId } = event.detail;

    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log("✅ Review updated for current restaurant, reloading...");

      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 300);
    }
  };

  // Handler for review deletes
  const deleteHandler = (event) => {
    const { reviewId, restaurantId: reviewRestaurantId } = event.detail;

    if (parseInt(reviewRestaurantId) === parseInt(restaurantId)) {
      console.log("✅ Review deleted for current restaurant, reloading...");

      setTimeout(() => {
        if (window.location.hash.includes(`restaurant/${restaurantId}`)) {
          renderRestaurantDetail(restaurantId);
        }
      }, 300);
    }
  };

  window.addEventListener("reviewUpdated", updateHandler);
  window.addEventListener("reviewDeleted", deleteHandler);

  // Cleanup on page unload
  window.addEventListener(
    "hashchange",
    () => {
      window.removeEventListener("reviewUpdated", updateHandler);
      window.removeEventListener("reviewDeleted", deleteHandler);
    },
    { once: true }
  );
}

// Format review date time
function formatReviewDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 hour: show "X phút trước"
  if (diffMins < 60) {
    return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
  }
  // Less than 24 hours: show "X giờ trước"
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  // Less than 7 days: show "X ngày trước"
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }
  // Older: show full date and time
  const dateStr = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} lúc ${timeStr}`;
}
