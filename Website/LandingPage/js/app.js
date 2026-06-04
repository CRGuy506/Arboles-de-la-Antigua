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
let landingAudioUnlockListenersBound = false;

function updateLandingAudioToggleState() {
  if (!landingAudio || !landingAudioFallbackToggle) {
    return;
  }

  const isPlaying = !landingAudio.paused && !landingAudio.ended;
  const isMuted = landingAudio.muted || landingAudio.volume === 0;
  const showMuteIcon = isPlaying && !isMuted;

  landingAudioFallbackToggle.classList.toggle('audio-show-mute', showMuteIcon);

  let label = 'Reproducir sonido';
  if (showMuteIcon) {
    label = 'Silenciar audio';
  } else if (isPlaying && isMuted) {
    label = 'Activar sonido';
  }
  landingAudioFallbackToggle.setAttribute('aria-label', label);
  landingAudioFallbackToggle.setAttribute('title', label);

  const srOnly = landingAudioFallbackToggle.querySelector('.sr-only');
  if (srOnly) {
    srOnly.textContent = label;
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
    updateLandingAudioToggleState();
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
  if (!landingAudio) {
    return;
  }

  landingAudio.currentTime = 0;
  const playAttempt = landingAudio.play();

  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt
      .then(() => {
        removeLandingAudioUnlockListeners();
        updateLandingAudioToggleState();
      })
      .catch(() => {
        showLandingAudioFallbackToggle();
        ensureLandingAudioUnlockListeners();
        updateLandingAudioToggleState();
      });
    return;
  }

  updateLandingAudioToggleState();
}

function tryPlayLandingAudioOnInteraction() {
  tryPlayLandingAudio();
}

if (landingAudioFallbackToggle) {
  landingAudioFallbackToggle.addEventListener('click', () => {
    if (!landingAudio) {
      return;
    }

    if (landingAudio.paused) {
      landingAudio.muted = false;
      tryPlayLandingAudio();
      return;
    }

    landingAudio.muted = !landingAudio.muted;
    updateLandingAudioToggleState();
  });
}

if (landingAudio) {
  landingAudio.addEventListener('play', updateLandingAudioToggleState);
  landingAudio.addEventListener('pause', updateLandingAudioToggleState);
  landingAudio.addEventListener('ended', updateLandingAudioToggleState);
  landingAudio.addEventListener('volumechange', updateLandingAudioToggleState);
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

// Keep the about mosaic constrained to the adjacent content height on desktop.
const aboutSection = document.querySelector('.section-about');
const aboutLayout = aboutSection ? aboutSection.querySelector('.about-layout') : null;
const aboutContent = aboutSection ? aboutSection.querySelector('.about-content') : null;
const aboutVisual = aboutSection ? aboutSection.querySelector('.about-visual') : null;
const aboutMosaic = aboutSection ? aboutSection.querySelector('.about-mosaic') : null;
const aboutDesktopMq = window.matchMedia('(min-width: 901px)');

function resetAboutMosaicSizing() {
  if (!aboutMosaic || !aboutVisual) {
    return;
  }

  aboutVisual.style.height = '';
  aboutMosaic.style.height = '';
  aboutMosaic.style.setProperty('--mosaic-scale', '1');
  aboutMosaic.style.setProperty('--mosaic-inv-scale', '1');
}

function syncAboutMosaicHeight() {
  if (!aboutLayout || !aboutContent || !aboutVisual || !aboutMosaic) {
    return;
  }

  if (!aboutDesktopMq.matches) {
    resetAboutMosaicSizing();
    return;
  }

  const layoutStyles = window.getComputedStyle(aboutLayout);
  if (layoutStyles.gridTemplateColumns.split(' ').length < 2) {
    resetAboutMosaicSizing();
    return;
  }

  // Reset before measuring intrinsic mosaic height.
  aboutMosaic.style.height = '';
  aboutMosaic.style.setProperty('--mosaic-scale', '1');
  aboutMosaic.style.setProperty('--mosaic-inv-scale', '1');
  aboutMosaic.style.width = '';
  aboutVisual.style.height = '';

  const contentHeight = Math.ceil(aboutContent.getBoundingClientRect().height);
  const naturalMosaicHeight = Math.ceil(aboutMosaic.scrollHeight);

  if (!contentHeight || !naturalMosaicHeight) {
    resetAboutMosaicSizing();
    return;
  }

  const scale = Math.min(1, contentHeight / naturalMosaicHeight);
  const inverseScale = scale > 0 ? 1 / scale : 1;

  aboutVisual.style.height = `${contentHeight}px`;
  aboutMosaic.style.height = `${contentHeight}px`;
  aboutMosaic.style.setProperty('--mosaic-scale', `${scale}`);
  aboutMosaic.style.setProperty('--mosaic-inv-scale', `${inverseScale}`);
}

let aboutMosaicFrame = null;
function scheduleAboutMosaicSync() {
  if (aboutMosaicFrame !== null) {
    window.cancelAnimationFrame(aboutMosaicFrame);
  }

  aboutMosaicFrame = window.requestAnimationFrame(() => {
    aboutMosaicFrame = null;
    syncAboutMosaicHeight();
  });
}

if (aboutLayout && aboutContent && aboutVisual && aboutMosaic) {
  window.addEventListener('resize', scheduleAboutMosaicSync);
  aboutDesktopMq.addEventListener('change', scheduleAboutMosaicSync);

  if (window.ResizeObserver) {
    const aboutObserver = new ResizeObserver(() => {
      scheduleAboutMosaicSync();
    });
    aboutObserver.observe(aboutContent);
    aboutObserver.observe(aboutMosaic);
  }

  aboutMosaic.querySelectorAll('img').forEach((image) => {
    if (!image.complete) {
      image.addEventListener('load', scheduleAboutMosaicSync, { once: true });
      image.addEventListener('error', scheduleAboutMosaicSync, { once: true });
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleAboutMosaicSync);
  }

  scheduleAboutMosaicSync();
}

// Mitigate transient CDN/origin failures (e.g., 503) on gallery tiles by retrying.
const aboutTileImages = Array.from(document.querySelectorAll('.about-photo-tile img'));
const maxTileImageRetries = 2;

function withRetryParam(url, attempt) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}retry=${attempt}`;
}

function withUppercaseJpg(url) {
  return url.replace(/\.jpg(\?.*)?$/i, (match, suffix = '') => `.JPG${suffix}`);
}

function handleTileImageError(event) {
  const image = event.currentTarget;
  const baseSrc = image.dataset.baseSrc || image.getAttribute('src') || '';
  const currentRetry = Number(image.dataset.retryCount || '0');

  if (!baseSrc) {
    return;
  }

  if (currentRetry < maxTileImageRetries) {
    const nextRetry = currentRetry + 1;
    image.dataset.retryCount = String(nextRetry);

    window.setTimeout(() => {
      image.src = withRetryParam(baseSrc, nextRetry);
    }, 600 * nextRetry);
    return;
  }

  if (image.dataset.triedUppercaseExt !== 'true' && /\.jpg(\?.*)?$/i.test(baseSrc)) {
    image.dataset.triedUppercaseExt = 'true';
    image.dataset.retryCount = '0';
    image.src = withUppercaseJpg(baseSrc);
  }
}

aboutTileImages.forEach((image) => {
  const src = image.getAttribute('src');
  if (!src) {
    return;
  }

  image.dataset.baseSrc = src;
  image.dataset.retryCount = '0';
  image.addEventListener('error', handleTileImageError);
});

window.addEventListener('load', () => {
  scheduleAboutMosaicSync();

  if (!landingAudio) {
    return;
  }

  // Keep the audio control visible so visitors can replay on demand.
  showLandingAudioFallbackToggle();

  window.setTimeout(() => {
    tryPlayLandingAudio();
  }, landingAudioDelayMs);
});
