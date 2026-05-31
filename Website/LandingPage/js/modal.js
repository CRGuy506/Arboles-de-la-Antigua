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
  document.body.classList.add('modal-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  const restoreY = lockedScrollY;
  document.body.classList.remove('modal-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo({ top: restoreY, behavior: 'instant' });
}

/**
 * Opens a modal with custom title and HTML content.
 * @param {Object} config - { title: string, body: string (HTML) }
 */
function openModal(config) {
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
  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = config.title || '';
  header.appendChild(title);

  // Create body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = config.body || '';

  // Assemble and display modal
  modalContent.innerHTML = '';
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(header);
  modalContent.appendChild(body);

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

    const allTranslations = window.ADLA_TRANSLATIONS || {};
    const lang = localStorage.getItem('adla-lang') || 'es';
    const fallback = allTranslations.es || {};
    const t = allTranslations[lang] || fallback;

    if (modalId === 'about-photo') {
      const titleKey = trigger.getAttribute('data-photo-title-key') || '';
      const altKey = trigger.getAttribute('data-photo-alt-key') || '';
      const photoSrc = (trigger.getAttribute('data-photo-src') || '').trim();

      const title = (titleKey && (t[titleKey] || fallback[titleKey])) || '';
      const alt = (altKey && (t[altKey] || fallback[altKey])) || title || 'Photo';
      const fallbackBody = t.aboutPhotoFallbackBody || fallback.aboutPhotoFallbackBody || '';

      let body = fallbackBody;
      if (photoSrc) {
        body = `
          <img
            src="${photoSrc}"
            alt="${alt}"
            style="width:100%;max-height:min(75vh,780px);object-fit:contain;border-radius:14px;display:block;background:color-mix(in srgb, var(--sky) 70%, #fff 30%);"
          />
        `;
      }

      openModal({ title, body });
      return;
    }

    const modalConfigById = {
      'join-whatsapp': { titleKey: 'joinChatTitle', bodyKey: 'joinChatBodyHtml' },
      'chip-temp': { titleKey: 'valueTemp', bodyKey: 'modalTempBodyHtml' },
      'chip-landscape': { titleKey: 'valueLandscape', bodyKey: 'modalLandscapeBodyHtml' },
      'chip-wildlife': { titleKey: 'valueWildlife', bodyKey: 'modalWildlifeBodyHtml' },
      'chip-climate': { titleKey: 'valueClimate', bodyKey: 'modalClimateBodyHtml' },
      'chip-cohesion': { titleKey: 'valueCohesion', bodyKey: 'modalCohesionBodyHtml' },
      'chip-security': { titleKey: 'valueSecurity', bodyKey: 'modalSecurityBodyHtml' },
      'event-info': { titleKey: 'eventInfoTitle', bodyKey: 'eventInfoBodyHtml' },
      'event-agenda': { titleKey: 'eventAgendaImageTitle', bodyKey: 'eventAgendaImageBodyHtml' }
    };

    const modalConfig = modalConfigById[modalId];
    if (!modalConfig) {
      return;
    }

    const title = t[modalConfig.titleKey] || fallback[modalConfig.titleKey] || '';
    let body = t[modalConfig.bodyKey] || fallback[modalConfig.bodyKey] || '';

    // Append a translatable video CTA for the security modal when URL is provided.
    if (modalId === 'chip-security') {
      const videoUrl = t.modalSecurityVideoUrl || fallback.modalSecurityVideoUrl || '';
      const videoCta = t.modalSecurityVideoCta || fallback.modalSecurityVideoCta || 'Ver video';
      const isValidVideoUrl = /^https?:\/\//i.test(videoUrl);

      if (isValidVideoUrl) {
        body += `
          <p>
            <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block;">
              ${videoCta}
            </a>
          </p>
        `;
      }
    }

    if (modalId === 'event-info' || modalId === 'event-agenda') {
      const imageUrlKey = modalId === 'event-info' ? 'eventInfoImageUrl' : 'eventAgendaImageUrl';
      const imageAltKey = modalId === 'event-info' ? 'eventInfoImageAlt' : 'eventAgendaImageAlt';
      const imageUrl = t[imageUrlKey] || fallback[imageUrlKey] || '';
      const imageAlt = t[imageAltKey] || fallback[imageAltKey] || '';
      const hasImageUrl = imageUrl && !/^\s*$/.test(imageUrl);

      if (hasImageUrl) {
        body += `
          <img
            src="${imageUrl}"
            alt="${imageAlt}"
            style="width:100%;border-radius:14px;margin-top:0.9rem;display:block;"
          />
        `;
      }
    }

    if (modalId === 'join-whatsapp') {
      const qrImageUrl = t.joinChatQrImageUrl || fallback.joinChatQrImageUrl || '';
      const qrImageAlt = t.joinChatQrImageAlt || fallback.joinChatQrImageAlt || '';
      const chatUrl = t.joinChatUrl || fallback.joinChatUrl || '';
      const chatCta = t.joinChatButtonCta || fallback.joinChatButtonCta || 'Unirse al chat';

      if (qrImageUrl && !/^\s*$/.test(qrImageUrl)) {
        body += `
          <img
            src="${qrImageUrl}"
            alt="${qrImageAlt}"
            style="width:min(260px, 100%);border-radius:14px;margin:0.9rem auto 0;display:block;"
          />
        `;
      }

      if (/^https?:\/\//i.test(chatUrl)) {
        body += `
          <p style="text-align:center;margin-top:1.1rem;">
            <a href="${chatUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block;">
              ${chatCta}
            </a>
          </p>
        `;
      }
    }

    openModal({ title, body });
  }
});

// Keyboard support for non-button modal triggers with data-modal.
document.addEventListener('keydown', (e) => {
  const trigger = e.target.closest('[data-modal]');
  if (!trigger) return;

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    trigger.click();
  }
});
