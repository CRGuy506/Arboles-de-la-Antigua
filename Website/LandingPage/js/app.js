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
const landingAudio = document.getElementById('landingAudio');
const landingAudioFallbackToggle = document.getElementById('landingAudioFallbackToggle');
const prefersReducedMotionApp = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const landingAudioDelayMs = 1200;
const landingAudioSessionKey = 'adla-landing-audio-played';
let landingAudioUnlockListenersBound = false;

function markLandingAudioPlayed() {
  try {
    sessionStorage.setItem(landingAudioSessionKey, 'true');
  } catch (error) {
    // Ignore storage access failures in hardened/private browsing contexts.
  }
}

function hasPlayedLandingAudio() {
  try {
    return sessionStorage.getItem(landingAudioSessionKey) === 'true';
  } catch (error) {
    return false;
  }
}

function removeLandingAudioUnlockListeners() {
  if (!landingAudioUnlockListenersBound) {
    return;
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    document.removeEventListener(eventName, tryPlayLandingAudioOnInteraction);
  });
  landingAudioUnlockListenersBound = false;
}

function showLandingAudioFallbackToggle() {
  if (landingAudioFallbackToggle) {
    landingAudioFallbackToggle.hidden = false;
  }
}

function hideLandingAudioFallbackToggle() {
  if (landingAudioFallbackToggle) {
    landingAudioFallbackToggle.hidden = true;
  }
}

function ensureLandingAudioUnlockListeners() {
  if (landingAudioUnlockListenersBound) {
    return;
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    document.addEventListener(eventName, tryPlayLandingAudioOnInteraction, { once: true });
  });
  landingAudioUnlockListenersBound = true;
}

function tryPlayLandingAudio() {
  if (!landingAudio || hasPlayedLandingAudio()) {
    hideLandingAudioFallbackToggle();
    return;
  }

  landingAudio.currentTime = 0;
  const playAttempt = landingAudio.play();

  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt
      .then(() => {
        markLandingAudioPlayed();
        hideLandingAudioFallbackToggle();
        removeLandingAudioUnlockListeners();
      })
      .catch(() => {
        showLandingAudioFallbackToggle();
        ensureLandingAudioUnlockListeners();
      });
    return;
  }

  markLandingAudioPlayed();
  hideLandingAudioFallbackToggle();
}

function tryPlayLandingAudioOnInteraction() {
  tryPlayLandingAudio();
}

if (landingAudioFallbackToggle) {
  landingAudioFallbackToggle.addEventListener('click', () => {
    tryPlayLandingAudio();
  });
}

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

// Tap support for stat bubbles on touch devices.
const statBoxesWithDetail = Array.from(document.querySelectorAll('.stat-box.has-detail'));
const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

function closeAllStatBubbles() {
  statBoxesWithDetail.forEach((box) => {
    box.classList.remove('show-detail');
  });
}

if (isCoarsePointer && statBoxesWithDetail.length) {
  statBoxesWithDetail.forEach((box) => {
    box.addEventListener('click', (event) => {
      const wasOpen = box.classList.contains('show-detail');
      closeAllStatBubbles();
      if (!wasOpen) {
        box.classList.add('show-detail');
      }
      event.stopPropagation();
    });

    box.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const wasOpen = box.classList.contains('show-detail');
        closeAllStatBubbles();
        if (!wasOpen) {
          box.classList.add('show-detail');
        }
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.stat-box.has-detail')) {
      closeAllStatBubbles();
    }
  });
}

window.addEventListener('load', () => {
  if (!landingAudio || hasPlayedLandingAudio()) {
    hideLandingAudioFallbackToggle();
    return;
  }

  window.setTimeout(() => {
    tryPlayLandingAudio();
  }, landingAudioDelayMs);
});
