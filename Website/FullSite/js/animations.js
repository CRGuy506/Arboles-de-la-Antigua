/**
 * animations.js - Scroll animations and intersection observer
 * 
 * Features:
 *   - Navbar scroll shadow effect
 *   - Agenda items revealed as they enter viewport
 *   - Staggered animation delays for visual rhythm
 *   - Smooth scroll behavior via CSS
 */

/**
 * Navbar scroll effect: add shadow when user scrolls down.
 * Passive event listener for performance optimization.
 */
const navbar = document.getElementById('navbar');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// ═══════════════════════════════════════════════════════════════════════
// Agenda Animation Setup
// ═══════════════════════════════════════════════════════════════════════

/**
 * Intersection Observer: reveals agenda items as they enter viewport.
 * This avoids animating everything at page load and improves performance.
 */
const agendaObserver = prefersReducedMotion
  ? null
  : new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(0)';
        }
      });
    }, { threshold: 0.1 });

/**
 * Preconfigure each agenda item as hidden.
 * IntersectionObserver will reveal them with staggered timing.
 */
document.querySelectorAll('.agenda-item').forEach((el, i) => {
  if (prefersReducedMotion) {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
    return;
  }

  el.style.opacity = '0';
  el.style.transform = 'translateX(-16px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  agendaObserver.observe(el);
});
