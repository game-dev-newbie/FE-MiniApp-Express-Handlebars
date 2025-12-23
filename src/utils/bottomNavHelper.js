// src/utils/bottomNavHelper.js
// Helper to update bottom nav active state without re-rendering

/**
 * Update bottom nav active state
 * @param {string} activePage - 'home' | 'search' | 'booking' | 'profile'
 */
export function updateBottomNavActive(activePage) {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(btn => {
    const page = btn.getAttribute('data-page');
    
    if (page === activePage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Setup bottom nav event listeners (call once)
 */
export function initBottomNav() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const page = button.getAttribute('data-page');
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // Navigate
      window.location.hash = `#/${page === 'home' ? '' : page}`;
    });
  });
}
