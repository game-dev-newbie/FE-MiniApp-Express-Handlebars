// src/views/onboardingView.js
import { renderTemplate } from "../core/templates.js";

let currentSlide = 1;
const totalSlides = 3;
let autoAdvanceTimer = null;

export function renderOnboarding() {
  const appEl = document.getElementById("app");
  const html = renderTemplate("onboarding", {});
  appEl.innerHTML = html;
  
  // Initialize onboarding logic
  initOnboarding();
}

function initOnboarding() {
  const onboardingSlides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.dot');
  const actionBtn = document.getElementById('actionBtn');
  
  function showSlide(slideNumber) {
    // Clear existing timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    
    // Remove active class from all slides and dots
    onboardingSlides.forEach(slide => {
      slide.classList.remove('active', 'prev');
    });
    dots.forEach(dot => {
      dot.classList.remove('active');
    });
    
    // Add active class to current slide and dot
    const currentSlideElement = document.querySelector(`.onboarding-slide[data-slide="${slideNumber}"]`);
    const currentDot = document.querySelector(`.dot[data-slide="${slideNumber}"]`);
    
    if (currentSlideElement) {
      currentSlideElement.classList.add('active');
    }
    if (currentDot) {
      currentDot.classList.add('active');
    }
    
    // Update button text and style for last slide
    if (actionBtn) {
      if (slideNumber === totalSlides) {
        actionBtn.textContent = 'Get Started';
        actionBtn.classList.add('get-started');
      } else {
        actionBtn.textContent = 'Skip';
        actionBtn.classList.remove('get-started');
      }
    }
    
    // Auto-advance to next slide after 5 seconds (except on last slide)
    if (slideNumber < totalSlides) {
      autoAdvanceTimer = setTimeout(() => {
        currentSlide++;
        showSlide(currentSlide);
      }, 5000);
    }
  }
  
  function completeOnboarding() {
    // Clear timer
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    
    // Mark onboarding as completed
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Navigate to home
    window.location.hash = "#/";
  }
  
  // Event listener for action button
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      if (currentSlide === totalSlides) {
        completeOnboarding();
      } else {
        currentSlide++;
        showSlide(currentSlide);
      }
    });
  }
  
  // Dot navigation
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideNumber = parseInt(dot.getAttribute('data-slide'));
      currentSlide = slideNumber;
      showSlide(currentSlide);
    });
  });
  
  // Start with first slide
  showSlide(currentSlide);
}
