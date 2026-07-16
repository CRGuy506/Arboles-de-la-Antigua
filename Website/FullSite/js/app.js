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

function ensurePageAccessibilityBasics() {
  const main = document.querySelector('main.site-shell, main');
  const pageTitle = document.querySelector('.page-title');

  // Enforce a single page-level H1 for semantic structure.
  if (pageTitle && pageTitle.tagName !== 'H1') {
    const h1 = document.createElement('h1');
    h1.className = pageTitle.className;
    h1.innerHTML = pageTitle.innerHTML;
    Array.from(pageTitle.attributes).forEach((attr) => {
      h1.setAttribute(attr.name, attr.value);
    });
    pageTitle.replaceWith(h1);
  }

  const resolvedTitle = document.querySelector('.page-title');
  if (main && resolvedTitle) {
    if (!resolvedTitle.id) {
      resolvedTitle.id = 'pageTitle';
    }
    main.setAttribute('aria-labelledby', resolvedTitle.id);
    main.removeAttribute('aria-label');
  }

  // Ensure modal triggers that are anchors expose button semantics for AT.
  document.querySelectorAll('a[data-modal]').forEach((el) => {
    el.setAttribute('role', 'button');
  });
}

function createAccessibleCard(config) {
  const card = document.createElement('article');
  card.className = `card${config.className ? ` ${config.className}` : ''}`;

  const heading = document.createElement('h2');
  if (config.titleKey) {
    heading.setAttribute('data-i18n', config.titleKey);
    heading.textContent = config.titleFallback || '';
  } else {
    heading.textContent = config.title || '';
  }

  const body = document.createElement('p');
  if (config.bodyKey) {
    body.setAttribute('data-i18n', config.bodyKey);
    body.textContent = config.bodyFallback || '';
  } else {
    body.textContent = config.body || '';
  }

  card.appendChild(heading);
  card.appendChild(body);

  if (config.modalId) {
    const action = document.createElement('a');
    action.href = '#';
    action.className = 'btn-cta-sm';
    action.setAttribute('data-modal', config.modalId);
    action.setAttribute('role', 'button');
    action.textContent = config.actionLabel || 'Ver más';
    card.appendChild(action);
  }

  return card;
}

window.ADLA_ACCESSIBILITY = {
  ensurePageAccessibilityBasics,
  createAccessibleCard
};

function ensureJoinUsWhatsAppIcon() {
  const iconSvg = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='M12.04 2C6.63 2 2.24 6.39 2.24 11.8c0 1.9.55 3.74 1.58 5.32L2 22l5.06-1.76a9.73 9.73 0 0 0 4.98 1.35h.01c5.4 0 9.79-4.4 9.79-9.8C21.83 6.4 17.44 2 12.04 2Zm0 17.95h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3 .99 1-2.92-.2-.3a8.13 8.13 0 0 1-1.24-4.3c0-4.48 3.65-8.13 8.14-8.13 2.17 0 4.2.84 5.74 2.38a8.08 8.08 0 0 1 2.38 5.75c0 4.48-3.65 8.13-8.14 8.13Zm4.46-6.1c-.24-.12-1.4-.69-1.61-.77-.22-.08-.37-.12-.53.12-.16.24-.61.77-.75.93-.14.16-.27.18-.5.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.38-1.31-1.62-.14-.24-.01-.36.1-.48.1-.1.24-.27.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.53-.4h-.45c-.16 0-.41.06-.62.3-.22.24-.83.81-.83 1.98 0 1.16.85 2.29.97 2.44.12.16 1.67 2.54 4.05 3.56.56.24 1 .39 1.34.5.56.18 1.07.15 1.48.09.45-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.05-.1-.2-.16-.43-.28Z'/></svg>";

  document.querySelectorAll('.btn-cta-sm').forEach((button) => {
    const iconHost = button.querySelector('.cta-wa-icon');
    if (!iconHost) {
      return;
    }

    if (!iconHost.querySelector('svg')) {
      iconHost.innerHTML = iconSvg;
    }

    const fallback = button.querySelector('.cta-wa-fallback');
    if (fallback) {
      fallback.hidden = true;
    }
  });
}

function markActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.main-nav a[data-nav-key]').forEach((link) => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === currentPath);
  });
}

function setupTabTransitions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bodyEl = document.body;

  if (!bodyEl || reduceMotion) {
    return;
  }

  bodyEl.classList.add('page-enter');
  window.requestAnimationFrame(() => {
    bodyEl.classList.add('page-enter-active');
    window.setTimeout(() => {
      bodyEl.classList.remove('page-enter', 'page-enter-active');
    }, 260);
  });

  const navLinks = document.querySelectorAll('.main-nav a[href]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.origin !== window.location.origin || targetUrl.pathname === window.location.pathname) {
        return;
      }

      event.preventDefault();
      bodyEl.classList.add('page-exit');
      window.setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 190);
    });
  });
}

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
    if (!href || href === '#') {
      return;
    }

    let target = null;
    try {
      target = document.querySelector(href);
    } catch (_err) {
      return;
    }

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
  ensurePageAccessibilityBasics();
  ensureJoinUsWhatsAppIcon();
  markActiveNavLink();
  setupTabTransitions();
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
