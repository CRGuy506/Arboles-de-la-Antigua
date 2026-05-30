/**
 * app.js - Main application initialization
 *
 * Features:
 *   - Mobile navigation toggle (open/close, Escape key, outside-click, resize reset)
 *   - Smooth scroll behavior for all in-page anchor links
 *
 * Note: uses prefersReducedMotionApp (not prefersReducedMotion) to avoid
 * global const collision with the identically-named variable in animations.js.
 */

const mainNav = document.getElementById('mainNav');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const prefersReducedMotionApp = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function closeMobileMenu() {
  if (!mainNav || !mobileMenuToggle) return;
  mainNav.classList.remove('open');
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
  mobileMenuToggle.setAttribute('aria-label', 'Abrir menú');
}

function toggleMobileMenu() {
  if (!mainNav || !mobileMenuToggle) return;
  const nextState = !mainNav.classList.contains('open');
  mainNav.classList.toggle('open', nextState);
  mobileMenuToggle.setAttribute('aria-expanded', String(nextState));
  mobileMenuToggle.setAttribute('aria-label', nextState ? 'Cerrar menú' : 'Abrir menú');
}

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Close mobile nav after clicking any internal nav link.
document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// Close mobile nav when user clicks outside navbar.
document.addEventListener('click', (event) => {
  if (!mainNav || !mobileMenuToggle) return;
  if (!mainNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
    closeMobileMenu();
  }
});

// Close mobile nav on Escape for keyboard users.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileMenu();
  }
});

// Ensure nav state resets when returning to desktop size.
window.addEventListener('resize', () => {
  if (window.innerWidth > 600) {
    closeMobileMenu();
  }
});

/**
 * Smooth scroll navigation for all anchor links (e.g., #nosotros, #evento, #agenda).
 * Prevents default jump behavior and smoothly scrolls to target.
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    const target = document.querySelector(href);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotionApp ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
});
