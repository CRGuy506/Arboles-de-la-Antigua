/**
 * modal.js - Modal/popup system with frosted glass backdrop
 * 
 * Public API:
 *   openModal(config)  - Opens modal with { title, body }
 *   closeModal()       - Closes the modal
 * 
 * Features:
 *   - Frosted glass backdrop (blur + semi-transparent overlay)
 *   - Smooth fade-in/slide animations
 *   - Multiple close triggers: Esc key, outside click, close button
 *   - Accessibility: aria-hidden, aria-modal attributes
 *   - Scroll lock on body while modal open
 */

const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
let lockedScrollY = 0;

function lockBodyScroll() {
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.scrollBehavior = 'auto';
}

function unlockBodyScroll() {
  document.documentElement.style.overflow = '';
  document.documentElement.style.scrollBehavior = '';
  window.scrollTo(0, lockedScrollY);
}

/**
 * Opens a modal with custom title and HTML content.
 * Supports both direct content (title/body) or translation keys (titleKey/bodyKey).
 * @param {Object} config - { title, body } or { titleKey, bodyKey } or mix
 */
function openModal(config) {
  // Resolve translations if keys are provided
  let title = config.title || '';
  let body = config.body || '';
  
  if (config.titleKey) {
    try {
      const locale = localStorage.getItem('adla-lang') || 'es';
      const translations = (window.ADLA_TRANSLATIONS && window.ADLA_TRANSLATIONS[locale]) 
        || (window.ADLA_TRANSLATIONS && window.ADLA_TRANSLATIONS['es']) 
        || {};
      title = translations[config.titleKey] || config.title || '';
    } catch (e) {
      title = config.title || '';
    }
  }
  
  if (config.bodyKey) {
    try {
      const locale = localStorage.getItem('adla-lang') || 'es';
      const translations = (window.ADLA_TRANSLATIONS && window.ADLA_TRANSLATIONS[locale]) 
        || (window.ADLA_TRANSLATIONS && window.ADLA_TRANSLATIONS['es']) 
        || {};
      body = translations[config.bodyKey] || config.body || '';
    } catch (e) {
      body = config.body || '';
    }
  }
  
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Cerrar ventana');
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', closeModal);

  // Create header
  const header = document.createElement('div');
  header.className = 'modal-header';
  const titleEl = document.createElement('h2');
  titleEl.className = 'modal-title';
  titleEl.textContent = title || '';
  header.appendChild(titleEl);

  // Create body
  const bodyEl = document.createElement('div');
  bodyEl.className = 'modal-body';
  bodyEl.innerHTML = body || '';

  // Assemble and display modal
  modalContent.innerHTML = '';
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(header);
  modalContent.appendChild(bodyEl);

  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  lockBodyScroll();
}

/**
 * Closes the modal and restores scroll.
 */
function closeModal() {
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();
}

// Close modal on overlay click (click outside the modal box).
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// On iOS Safari, prevent touch-dragging the page when touching the backdrop.
modalOverlay.addEventListener('touchmove', (e) => {
  if (e.target === modalOverlay) {
    e.preventDefault();
  }
}, { passive: false });

// Close modal on Escape key press.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// Hook for buttons with data-modal attribute to trigger modals.
// Usage: <button data-modal="example">Click me</button>
// Then route in click handler based on modalId.
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-modal]');
  if (trigger) {
    const modalId = trigger.getAttribute('data-modal');

    const modals = {
      'beneficio-1': { titleKey: 'beneficioTitle1', bodyKey: 'beneficioBody1' },
      'beneficio-2': { titleKey: 'beneficioTitle2', bodyKey: 'beneficioBody2' },
      'beneficio-3': { titleKey: 'beneficioTitle3', bodyKey: 'beneficioBody3' },
      'beneficio-4': { titleKey: 'beneficioTitle4', bodyKey: 'beneficioBody4' },
      'beneficio-5': { titleKey: 'beneficioTitle5', bodyKey: 'beneficioBody5' },
      'beneficio-6': { titleKey: 'beneficioTitle6', bodyKey: 'beneficioBody6' }
    };

    if (modals[modalId]) {
      openModal(modals[modalId]);
    }
  }
});

// Keyboard support: Enter and Space activate data-modal triggers (for role="button" divs).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const trigger = e.target.closest('[data-modal]');
    if (trigger) {
      e.preventDefault();
      trigger.click();
    }
  }
});
