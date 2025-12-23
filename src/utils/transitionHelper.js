// src/utils/transitionHelper.js
// Helper utilities for smooth page transitions

/**
 * Execute page transition with fade effect
 * @param {Function} renderFunction - Function to render new content
 * @param {Array} args - Arguments to pass to render function
 * @param {number} duration - Transition duration in ms (default 200)
 */
export async function transitionTo(renderFunction, args = [], duration = 200) {
  const app = document.getElementById('app');
  if (!app) return;

  // Phase 1: Fade out current content
  app.classList.add('page-transition-out');
  
  // Wait for fade out animation
  await new Promise(resolve => setTimeout(resolve, duration));
  
  // Phase 2: Render new content
  await renderFunction(...args);
  
  // Phase 3: Fade in new content
  app.classList.remove('page-transition-out');
  app.classList.add('page-transition-in');
  
  // Clean up transition class after animation
  setTimeout(() => {
    app.classList.remove('page-transition-in');
  }, 300);
}

/**
 * Show loading skeleton with smooth transition
 * @param {string} skeletonType - Type of skeleton to show ('restaurant', 'booking', 'profile')
 * @param {number} count - Number of skeleton items to show
 */
export function showSkeleton(skeletonType, count = 3) {
  const skeletons = {
    restaurant: `
      <div class="restaurant-card-skeleton">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
          <div class="skeleton skeleton-text" style="width: 40%;"></div>
        </div>
      </div>
    `,
    booking: `
      <div class="booking-card-skeleton">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button"></div>
        </div>
      </div>
    `,
    grid: `
      <div class="grid-card-skeleton">
        <div class="skeleton skeleton-image" style="height: 140px;"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `,
    profile: `
      <div class="profile-section-skeleton">
        <div class="profile-header-skeleton">
          <div class="skeleton skeleton-avatar-lg"></div>
          <div class="profile-info-skeleton">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </div>
    `
  };

  const template = skeletons[skeletonType] || skeletons.restaurant;
  return `<div class="skeleton-list">${template.repeat(count)}</div>`;
}

/**
 * Replace skeleton with real content smoothly
 * @param {HTMLElement} container - Container element
 * @param {string} newContent - New HTML content
 */
export function replaceSkeleton(container, newContent) {
  if (!container) return;

  // Fade out skeleton
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.15s ease';

  setTimeout(() => {
    // Replace content
    container.innerHTML = newContent;
    
    // Fade in new content
    container.style.opacity = '1';
    container.classList.add('content-fade-in');
    
    // Add stagger animation to children if applicable
    const items = container.querySelectorAll('.restaurant-card, .booking-card, .grid-card');
    items.forEach((item, index) => {
      if (index < 7) {
        item.classList.add('stagger-item');
      }
    });
  }, 150);
}

/**
 * Smooth tab switching
 * @param {string} activeTabId - ID of tab to show
 * @param {string} containerSelector - Selector for tab container
 */
export function switchTab(activeTabId, containerSelector = '.booking-tab-content') {
  const tabs = document.querySelectorAll(containerSelector);
  
  tabs.forEach(tab => {
    if (tab.id === activeTabId) {
      // Show active tab with animation
      tab.classList.remove('hidden');
      tab.classList.add('active');
      
      // Trigger fade in
      requestAnimationFrame(() => {
        tab.style.opacity = '0';
        setTimeout(() => {
          tab.style.opacity = '1';
        }, 10);
      });
    } else {
      // Hide inactive tabs
      tab.classList.remove('active');
      setTimeout(() => {
        tab.classList.add('hidden');
      }, 200);
    }
  });
}

/**
 * Progressive content loading helper
 * @param {Object} options - Loading options
 */
export async function progressiveLoad(options) {
  const {
    shellTemplate,
    shellData = {},
    contentSelector,
    fetchData,
    contentTemplate,
    containerId = 'app'
  } = options;

  const app = document.getElementById(containerId);
  if (!app) return;

  // Step 1: Show shell with skeleton immediately
  app.innerHTML = shellTemplate(shellData);

  // Step 2: Fetch data in background
  try {
    const data = await fetchData();

    // Step 3: Replace skeleton with content
    const contentContainer = document.querySelector(contentSelector);
    if (contentContainer) {
      const content = contentTemplate(data);
      replaceSkeleton(contentContainer, content);
    }

    return data;
  } catch (error) {
    console.error('Progressive load error:', error);
    throw error;
  }
}

/**
 * Lazy load images with fade in
 * @param {string} selector - Image selector
 */
export function lazyLoadImages(selector = 'img[data-src]') {
  const images = document.querySelectorAll(selector);
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('lazy-image');
        
        // Load image
        img.src = img.dataset.src;
        
        // Fade in when loaded
        img.onload = () => {
          img.classList.add('loaded');
        };
        
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px' // Start loading 50px before visible
  });
  
  images.forEach(img => imageObserver.observe(img));
}

/**
 * Add stagger animation to list items
 * @param {string} selector - Item selector
 */
export function staggerAnimate(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach((item, index) => {
    if (index < 7) {
      item.classList.add('stagger-item');
      item.style.animationDelay = `${index * 0.05}s`;
    }
  });
}
