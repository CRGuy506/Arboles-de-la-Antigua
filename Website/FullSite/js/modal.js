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

function ensureModalShell() {
  let overlay = document.getElementById('modalOverlay');
  let content = document.getElementById('modalContent');

  if (overlay && content) {
    return { overlay, content };
  }

  overlay = document.createElement('div');
  overlay.id = 'modalOverlay';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  content = document.createElement('div');
  content.id = 'modalContent';
  content.className = 'modal';

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  return { overlay, content };
}

const { overlay: modalOverlay, content: modalContent } = ensureModalShell();
let lockedScrollY = 0;
let lastFocusedElement = null;
let hiddenSiblings = [];

function getFocusableElements() {
  const selectors = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
  ];

  return Array.from(modalContent.querySelectorAll(selectors.join(','))).filter((el) => {
    if (!(el instanceof HTMLElement)) {
      return false;
    }
    return el.offsetParent !== null || el === document.activeElement;
  });
}

function hideBackgroundFromAssistiveTech() {
  hiddenSiblings = [];
  Array.from(document.body.children).forEach((child) => {
    if (child === modalOverlay) {
      return;
    }
    const prev = child.getAttribute('aria-hidden');
    hiddenSiblings.push({ element: child, prev });
    child.setAttribute('aria-hidden', 'true');
  });
}

function restoreBackgroundAssistiveTechState() {
  hiddenSiblings.forEach(({ element, prev }) => {
    if (prev === null) {
      element.removeAttribute('aria-hidden');
      return;
    }
    element.setAttribute('aria-hidden', prev);
  });
  hiddenSiblings = [];
}

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
 * @param {Object} config - { title: string, body: string (HTML), modalClass?: string }
 */
function openModal(config) {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', config.closeLabel || 'Cerrar ventana');
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', closeModal);

  // Create body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = config.body || '';

  // Assemble and display modal
  modalContent.innerHTML = '';
  modalContent.className = 'modal';
  modalContent.setAttribute('role', 'dialog');
  modalContent.setAttribute('aria-modal', 'true');

  const modalInstanceId = `adla-modal-${Date.now()}`;
  const titleId = `${modalInstanceId}-title`;
  const bodyId = `${modalInstanceId}-body`;
  modalContent.removeAttribute('aria-label');
  modalContent.removeAttribute('aria-labelledby');
  modalContent.removeAttribute('aria-describedby');

  if (config.modalClass) {
    modalContent.classList.add(config.modalClass);
  }
  modalContent.appendChild(closeBtn);

  if (config.title) {
    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.id = titleId;
    title.textContent = config.title;
    header.appendChild(title);
    modalContent.appendChild(header);
    modalContent.setAttribute('aria-labelledby', titleId);
  } else if (config.ariaLabel) {
    modalContent.setAttribute('aria-label', config.ariaLabel);
  }

  body.id = bodyId;
  modalContent.appendChild(body);
  modalContent.setAttribute('aria-describedby', bodyId);

  modalOverlay.classList.add('active');
  modalOverlay.setAttribute('aria-hidden', 'false');
  lockBodyScroll();
  hideBackgroundFromAssistiveTech();

  const focusables = getFocusableElements();
  const focusTarget = typeof config.initialFocusSelector === 'string'
    ? modalContent.querySelector(config.initialFocusSelector)
    : null;

  if (focusTarget instanceof HTMLElement) {
    focusTarget.focus();
  } else if (focusables.length) {
    focusables[0].focus();
  } else {
    closeBtn.focus();
  }
}

/**
 * Closes the modal and restores scroll.
 */
function closeModal() {
  modalOverlay.classList.remove('active');
  modalOverlay.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();
  restoreBackgroundAssistiveTechState();

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
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
  if (!modalOverlay.classList.contains('active')) {
    return;
  }

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  if (e.key === 'Tab') {
    const focusables = getFocusableElements();
    if (!focusables.length) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

window.ADLA_MODAL = {
  openModal,
  closeModal,
  openTranslatedModal(config) {
    const allTranslations = window.ADLA_TRANSLATIONS || {};
    const lang = localStorage.getItem('adla-lang') || localStorage.getItem('siteLang') || 'es';
    const fallback = allTranslations.es || {};
    const t = allTranslations[lang] || fallback;

    const title = config.title || t[config.titleKey] || fallback[config.titleKey] || '';
    const body = config.body || t[config.bodyKey] || fallback[config.bodyKey] || '';

    openModal({
      title,
      body,
      modalClass: config.modalClass,
      closeLabel: config.closeLabel || 'Cerrar ventana',
      ariaLabel: config.ariaLabel,
      initialFocusSelector: config.initialFocusSelector
    });
  }
};

function appendPdfModalViewer(bodyHtml, config) {
  const {
    pdfUrl,
    openLinkCta,
    loadingText,
    pageLabel,
    prevCta,
    nextCta,
    fileProtocolText,
    loadFailedText
  } = config;

  if (!pdfUrl || /^\s*$/.test(pdfUrl)) {
    return { body: bodyHtml, renderConfig: null };
  }

  if (window.ADLA_PDF_VIEWER && typeof window.ADLA_PDF_VIEWER.createViewer === 'function') {
    const viewerBundle = window.ADLA_PDF_VIEWER.createViewer({
      pdfUrl,
      openLinkCta,
      loadingText,
      pageLabel,
      prevCta,
      nextCta,
      fileProtocolText,
      loadFailedText
    });

    if (viewerBundle && viewerBundle.html && viewerBundle.renderConfig) {
      return {
        body: `${bodyHtml}${viewerBundle.html}`,
        renderConfig: viewerBundle.renderConfig
      };
    }
  }

  // Graceful fallback when PDF module is unavailable.
  const fallbackBody = `${bodyHtml}
    <p style="margin-top:0.8rem;text-align:center;">
      <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn-ghost" style="display:inline-block;">
        ${openLinkCta}
      </a>
    </p>
  `;

  return { body: fallbackBody, renderConfig: null };
}

// Hook for buttons with data-modal attribute to trigger modals.
// Usage: <button data-modal="example">Click me</button>
// Then route in click handler based on modalId.
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-modal]');
  if (trigger) {
    const modalId = trigger.getAttribute('data-modal');

    const allTranslations = window.ADLA_TRANSLATIONS || {};
    const lang = localStorage.getItem('adla-lang') || localStorage.getItem('siteLang') || 'es';
    const fallback = allTranslations.es || {};
    const t = allTranslations[lang] || fallback;

    if (modalId === 'about-photo') {
      const altKey = trigger.getAttribute('data-photo-alt-key') || '';
      const photoSrc = (trigger.getAttribute('data-photo-src') || '').trim();

      const alt = (altKey && (t[altKey] || fallback[altKey])) || 'Photo';
      const fallbackBody = t.aboutPhotoFallbackBody || fallback.aboutPhotoFallbackBody || '';

      let body = fallbackBody;
      if (photoSrc) {
        body = `
          <img
            src="${photoSrc}"
            alt="${alt}"
            style="width:100%;max-height:min(82vh,900px);object-fit:contain;border-radius:10px;display:block;"
          />
        `;
      }

      openModal({ body, modalClass: 'modal-photo-wide' });
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
      'event-agenda': { titleKey: 'eventAgendaImageTitle', bodyKey: 'eventAgendaImageBodyHtml' },
      'annual-report': { titleKey: 'annualReportTitle', bodyKey: 'annualReportBodyHtml' }
    };

    const modalConfig = modalConfigById[modalId];
    if (!modalConfig) {
      return;
    }

    const title = t[modalConfig.titleKey] || fallback[modalConfig.titleKey] || '';
    let body = t[modalConfig.bodyKey] || fallback[modalConfig.bodyKey] || '';

    // Append a translatable video CTA for the security modal when URL is provided.
    if (modalId === 'chip-security') {
      const videoEmbedHtml = t.modalSecurityVideoEmbedHtml || fallback.modalSecurityVideoEmbedHtml || '';
      const videoUrl = t.modalSecurityVideoUrl || fallback.modalSecurityVideoUrl || '';
      const videoCta = t.modalSecurityVideoCta || fallback.modalSecurityVideoCta || 'Ver video';
      const isValidVideoUrl = /^https?:\/\//i.test(videoUrl);
      const hasEmbed = typeof videoEmbedHtml === 'string' && videoEmbedHtml.trim().length > 0;

      if (hasEmbed) {
        body += videoEmbedHtml;
      } else if (isValidVideoUrl) {
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

    let annualReportRenderConfig = null;

    if (modalId === 'annual-report') {
      const reportPdfUrl = t.annualReportPdfUrl || fallback.annualReportPdfUrl || '';
      const reportPdfLinkCta = t.annualReportPdfLinkCta || fallback.annualReportPdfLinkCta || 'Open PDF in a new tab';
      const previewLoadingText = t.annualReportPreviewLoading || fallback.annualReportPreviewLoading || 'Loading PDF preview...';
      const previewFileProtocolText = t.annualReportPreviewFileProtocol || fallback.annualReportPreviewFileProtocol || 'PDF preview is not available in local file mode. Use the button to open the PDF or run the site with a local server (http://).';
      const previewLoadFailedText = t.annualReportPreviewLoadFailed || fallback.annualReportPreviewLoadFailed || 'Could not display the PDF preview in this browser. Use the button to open the file.';
      const previewPageLabel = t.annualReportPreviewPageLabel || fallback.annualReportPreviewPageLabel || 'Page';
      const previewPrevCta = t.annualReportPreviewPrevCta || fallback.annualReportPreviewPrevCta || 'Previous';
      const previewNextCta = t.annualReportPreviewNextCta || fallback.annualReportPreviewNextCta || 'Next';
      const hasPdfUrl = reportPdfUrl && !/^\s*$/.test(reportPdfUrl);

      if (hasPdfUrl) {
        const encodedReportPdfUrl = encodeURI(reportPdfUrl.trim());
        const pdfModal = appendPdfModalViewer(body, {
          pdfUrl: encodedReportPdfUrl,
          openLinkCta: reportPdfLinkCta,
          loadingText: previewLoadingText,
          pageLabel: previewPageLabel,
          prevCta: previewPrevCta,
          nextCta: previewNextCta,
          fileProtocolText: previewFileProtocolText,
          loadFailedText: previewLoadFailedText
        });

        body = pdfModal.body;
        annualReportRenderConfig = pdfModal.renderConfig;
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

    if (annualReportRenderConfig && window.ADLA_PDF_VIEWER && typeof window.ADLA_PDF_VIEWER.mount === 'function') {
      window.ADLA_PDF_VIEWER.mount(annualReportRenderConfig);
    }
  }
});

// Keyboard support for non-button modal triggers with data-modal.
document.addEventListener('keydown', (e) => {
  if (!(e.target instanceof Element)) {
    return;
  }

  const trigger = e.target.closest('[data-modal]');
  if (!trigger) return;

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    trigger.click();
  }
});
