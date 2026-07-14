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
const PDFJS_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs';
const PDFJS_WORKER_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';
let pdfJsModulePromise = null;

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
  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Cerrar ventana');
  closeBtn.innerHTML = '×';
  closeBtn.addEventListener('click', closeModal);

  // Create body
  const body = document.createElement('div');
  body.className = 'modal-body';
  body.innerHTML = config.body || '';

  // Assemble and display modal
  modalContent.innerHTML = '';
  modalContent.className = 'modal';
  if (config.modalClass) {
    modalContent.classList.add(config.modalClass);
  }
  modalContent.appendChild(closeBtn);
  if (config.title) {
    const header = document.createElement('div');
    header.className = 'modal-header';
    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = config.title;
    header.appendChild(title);
    modalContent.appendChild(header);
  }
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

async function ensurePdfJsModule() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import(PDFJS_CDN_URL)
      .then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN_URL;
        return mod;
      })
      .catch((err) => {
        pdfJsModulePromise = null;
        throw err;
      });
  }

  return pdfJsModulePromise;
}

async function renderPdfFirstPage(canvasEl, loadingEl, pdfUrl, messages = {}) {
  const loadingText = messages.loading || 'Loading PDF preview...';
  const fileProtocolText = messages.fileProtocol || 'PDF preview is not available in local file mode. Use the button to open the PDF or run the site with a local server (http://).';
  const loadFailedText = messages.loadFailed || 'Could not display the PDF preview in this browser. Use the button to open the file.';

  if (window.location.protocol === 'file:') {
    if (loadingEl) {
      loadingEl.textContent = fileProtocolText;
    }
    return;
  }

  const withTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('pdf_render_timeout'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

  try {
    const pdfjs = await withTimeout(ensurePdfJsModule(), 5000);
    const loadingTask = pdfjs.getDocument({ url: pdfUrl, withCredentials: false });
    const pdf = await withTimeout(loadingTask.promise, 5000);
    const page = await pdf.getPage(1);
    const containerWidth = canvasEl.parentElement ? canvasEl.parentElement.clientWidth : 900;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(Math.max(containerWidth / baseViewport.width, 0.55), 1.8);
    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;
    const context = canvasEl.getContext('2d', { alpha: false });

    canvasEl.width = Math.floor(viewport.width * outputScale);
    canvasEl.height = Math.floor(viewport.height * outputScale);
    canvasEl.style.width = `${Math.floor(viewport.width)}px`;
    canvasEl.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
    await page.render({
      canvasContext: context,
      viewport,
      transform
    }).promise;

    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  } catch (err) {
    if (loadingEl) {
      const isFileProtocol = window.location.protocol === 'file:';
      loadingEl.textContent = isFileProtocol
        ? fileProtocolText
        : loadFailedText;
    }
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
      const hasPdfUrl = reportPdfUrl && !/^\s*$/.test(reportPdfUrl);

      if (hasPdfUrl) {
        const encodedReportPdfUrl = encodeURI(reportPdfUrl.trim());
        const viewerPdfUrl = encodedReportPdfUrl.includes('#')
          ? encodedReportPdfUrl
          : `${encodedReportPdfUrl}#page=1&view=FitH`;
        const previewId = `annualReportPreview-${Date.now()}`;
        const loadingId = `annualReportLoading-${Date.now()}`;

        annualReportRenderConfig = {
          previewId,
          loadingId,
          viewerPdfUrl,
          messages: {
            loading: previewLoadingText,
            fileProtocol: previewFileProtocolText,
            loadFailed: previewLoadFailedText
          }
        };

        body += `
          <div style="position:relative; margin-top:0.9rem; border:1px solid color-mix(in srgb, var(--moss) 20%, transparent); border-radius:14px; overflow:auto; background:var(--warm-white); max-height:min(70vh,760px); padding:0.6rem; display:flex; justify-content:center;">
            <div style="width:100%; display:flex; justify-content:center;">
              <canvas id="${previewId}" style="display:block; max-width:100%; border-radius:8px; background:#fff;"></canvas>
            </div>
            <div id="${loadingId}" style="position:absolute; top:0.65rem; left:50%; transform:translateX(-50%); max-width:calc(100% - 1.2rem); text-align:center; font-size:0.84rem; color:color-mix(in srgb, var(--bark) 62%, transparent); background:color-mix(in srgb, var(--warm-white) 92%, transparent); padding:0.15rem 0.3rem; border-radius:8px;">
              ${previewLoadingText}
            </div>
          </div>
          <p style="margin-top:0.8rem;text-align:center;">
            <a href="${encodedReportPdfUrl}" target="_blank" rel="noopener noreferrer" class="btn-ghost" style="display:inline-block;">
              ${reportPdfLinkCta}
            </a>
          </p>
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

    if (annualReportRenderConfig) {
      const canvasEl = document.getElementById(annualReportRenderConfig.previewId);
      const loadingEl = document.getElementById(annualReportRenderConfig.loadingId);
      if (canvasEl) {
        renderPdfFirstPage(canvasEl, loadingEl, annualReportRenderConfig.viewerPdfUrl, annualReportRenderConfig.messages);
      }
    }
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
