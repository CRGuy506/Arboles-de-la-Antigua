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
  document.body.classList.remove('modal-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lockedScrollY);
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

    if (modalId === 'impacto-demo') {
      openModal({
        title: 'Prueba de ventana emergente',
        body: `
          <p>Este es un texto de prueba aleatorio para validar el modal.</p>
          <p>Los árboles urbanos no solo dan sombra: también reducen ruido, refrescan calles y mejoran la calidad del aire de forma medible.</p>
          <img
            src="https://picsum.photos/seed/arboles-antigua/720/420"
            alt="Imagen aleatoria de prueba"
            style="width:100%;border-radius:14px;margin-top:0.8rem;display:block;"
          />
        `
      });
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
