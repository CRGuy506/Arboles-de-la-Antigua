/**
 * pdf-viewer.js
 * Reusable PDF.js modal viewer module.
 *
 * Public API:
 *   window.ADLA_PDF_VIEWER.createViewer(config)
 *   window.ADLA_PDF_VIEWER.mount(renderConfig)
 */
(function initPdfViewerModule(global) {
  const PDFJS_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs';
  const PDFJS_WORKER_CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';
  let pdfJsModulePromise = null;

  function uniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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

  function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('pdf_render_timeout')), timeoutMs);
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
  }

  function createViewer(config) {
    const {
      pdfUrl,
      openLinkCta = 'Open PDF in a new tab',
      loadingText = 'Loading PDF...',
      pageLabel = 'Page',
      prevCta = 'Previous',
      nextCta = 'Next',
      fileProtocolText = 'PDF preview is not available in local file mode. Use the button to open the PDF or run the site with a local server (http://).',
      loadFailedText = 'Could not display the PDF in this browser. Use the button to open the file.'
    } = config || {};

    if (!pdfUrl || /^\s*$/.test(pdfUrl)) {
      return null;
    }

    const cleanPdfUrl = pdfUrl.trim();
    const viewerPdfUrl = cleanPdfUrl.includes('#')
      ? cleanPdfUrl
      : `${cleanPdfUrl}#page=1&view=FitH`;

    const previewId = uniqueId('pdfPreview');
    const loadingId = uniqueId('pdfLoading');
    const pageIndicatorId = uniqueId('pdfPageIndicator');
    const prevBtnId = uniqueId('pdfPrev');
    const nextBtnId = uniqueId('pdfNext');

    const html = `
      <div class="pdf-viewer">
        <div class="pdf-viewer-toolbar">
          <div class="pdf-viewer-controls">
            <button type="button" id="${prevBtnId}" class="pdf-viewer-btn">${prevCta}</button>
            <span id="${pageIndicatorId}" class="pdf-viewer-page">${pageLabel} -/-</span>
            <button type="button" id="${nextBtnId}" class="pdf-viewer-btn">${nextCta}</button>
          </div>
          <a href="${cleanPdfUrl}" target="_blank" rel="noopener noreferrer" class="pdf-viewer-btn">${openLinkCta}</a>
        </div>
        <div class="pdf-viewer-canvas-wrap">
          <canvas id="${previewId}" class="pdf-viewer-canvas"></canvas>
          <div id="${loadingId}" class="pdf-viewer-loading">${loadingText}</div>
        </div>
      </div>
    `;

    return {
      html,
      renderConfig: {
        previewId,
        loadingId,
        pageIndicatorId,
        prevBtnId,
        nextBtnId,
        pdfUrl: viewerPdfUrl,
        messages: {
          loading: loadingText,
          fileProtocol: fileProtocolText,
          loadFailed: loadFailedText,
          pageLabel
        }
      }
    };
  }

  async function mount(renderConfig) {
    if (!renderConfig) {
      return;
    }

    const canvasEl = document.getElementById(renderConfig.previewId);
    const loadingEl = document.getElementById(renderConfig.loadingId);
    const pageIndicatorEl = document.getElementById(renderConfig.pageIndicatorId);
    const prevBtn = document.getElementById(renderConfig.prevBtnId);
    const nextBtn = document.getElementById(renderConfig.nextBtnId);
    const pdfUrl = renderConfig.pdfUrl;
    const messages = renderConfig.messages || {};

    if (!canvasEl || !pageIndicatorEl || !prevBtn || !nextBtn || !pdfUrl) {
      return;
    }

    const loadingText = messages.loading || 'Loading PDF...';
    const fileProtocolText = messages.fileProtocol || 'PDF preview is not available in local file mode. Use the button to open the PDF or run the site with a local server (http://).';
    const loadFailedText = messages.loadFailed || 'Could not display the PDF in this browser. Use the button to open the file.';
    const pageLabelText = messages.pageLabel || 'Page';

    if (loadingEl) {
      loadingEl.textContent = loadingText;
      loadingEl.style.display = '';
    }

    if (window.location.protocol === 'file:') {
      if (loadingEl) {
        loadingEl.textContent = fileProtocolText;
      }
      pageIndicatorEl.textContent = `${pageLabelText} -/-`;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    try {
      const pdfjs = await withTimeout(ensurePdfJsModule(), 7000);
      const loadingTask = pdfjs.getDocument({ url: pdfUrl, withCredentials: false });
      const pdf = await withTimeout(loadingTask.promise, 7000);

      const state = {
        pageNumber: 1,
        pageCount: pdf.numPages,
        renderTask: null
      };

      const renderCurrentPage = async () => {
        const page = await pdf.getPage(state.pageNumber);
        const containerWidth = canvasEl.parentElement ? canvasEl.parentElement.clientWidth : 900;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(Math.max(containerWidth / baseViewport.width, 0.55), 2.2);
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        const context = canvasEl.getContext('2d', { alpha: false });

        if (state.renderTask) {
          state.renderTask.cancel();
        }

        canvasEl.width = Math.floor(viewport.width * outputScale);
        canvasEl.height = Math.floor(viewport.height * outputScale);
        canvasEl.style.width = `${Math.floor(viewport.width)}px`;
        canvasEl.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
        state.renderTask = page.render({
          canvasContext: context,
          viewport,
          transform
        });

        try {
          await state.renderTask.promise;
        } catch (err) {
          if (!err || err.name !== 'RenderingCancelledException') {
            throw err;
          }
        }

        pageIndicatorEl.textContent = `${pageLabelText} ${state.pageNumber}/${state.pageCount}`;
        prevBtn.disabled = state.pageNumber <= 1;
        nextBtn.disabled = state.pageNumber >= state.pageCount;

        if (loadingEl) {
          loadingEl.style.display = 'none';
        }
      };

      prevBtn.addEventListener('click', async () => {
        if (state.pageNumber <= 1) {
          return;
        }
        state.pageNumber -= 1;
        await renderCurrentPage();
      });

      nextBtn.addEventListener('click', async () => {
        if (state.pageNumber >= state.pageCount) {
          return;
        }
        state.pageNumber += 1;
        await renderCurrentPage();
      });

      await renderCurrentPage();
    } catch (err) {
      if (loadingEl) {
        const isFileProtocol = window.location.protocol === 'file:';
        loadingEl.textContent = isFileProtocol ? fileProtocolText : loadFailedText;
      }
      pageIndicatorEl.textContent = `${pageLabelText} -/-`;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  global.ADLA_PDF_VIEWER = {
    createViewer,
    mount
  };
}(window));
