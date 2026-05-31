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

    const modals = {
      'beneficio-1': {
        title: 'Reducción de temperatura',
        body: `<p>Los árboles generan sombra directa sobre calles, aceras y edificios, reduciendo la temperatura superficial entre 10 y 20 °C. Este efecto disminuye el calor de isla urbana, reduce el consumo de energía por climatización y mejora significativamente el confort de quienes transitan y viven en el residencial, especialmente durante los meses más cálidos del año.</p>`
      },
      'beneficio-2': {
        title: 'Valor paisajístico y comunitario',
        body: `<p>Un arbolado bien mantenido embellece el entorno residencial, genera sentido de identidad y orgullo vecinal, y ha demostrado incrementar el valor percibido y real de las propiedades cercanas. Los espacios verdes activos también fomentan la convivencia y hacen del residencial un lugar más atractivo para vivir.</p>`
      },
      'beneficio-3': {
        title: 'Hábitat para vida silvestre',
        body: `<p>Los árboles y arbustos urbanos son refugio, fuente de alimento y corredores de tránsito para aves, polinizadores (abejas, mariposas) e insectos beneficiosos. Al ampliar y diversificar el arbolado del residencial, contribuimos directamente a la conectividad ecológica y a la conservación de la biodiversidad local.</p>`
      },
      'beneficio-4': {
        title: 'Mitigación del cambio climático',
        body: `<p>Cada árbol captura CO₂ de la atmósfera mediante la fotosíntesis y lo almacena en su biomasa durante décadas. Además, contribuye a la regulación del ciclo hídrico local y a la reducción de la escorrentía pluvial. Un arbolado denso puede secuestrar cientos de kilogramos de carbono a lo largo de su vida, aportando a los esfuerzos globales de mitigación climática desde el nivel comunitario.</p>`
      },
      'beneficio-5': {
        title: 'Cohesión y organización vecinal',
        body: `<p>Sembrar y mantener un arbolado de manera colectiva fortalece los lazos entre vecinos, desarrolla capacidades organizativas y genera redes de colaboración que pueden movilizarse para enfrentar otros retos importantes de la comunidad: seguridad, limpieza, mejoras de infraestructura y más. La iniciativa es un punto de encuentro y motor de organización vecinal.</p>`
      },
      'beneficio-6': {
        title: 'Seguridad comunitaria',
        body: `<p>Los espacios públicos bien mantenidos, con presencia de vegetación cuidada y actividad vecinal activa, desincentivan conductas antisociales y delictivas. Este principio, conocido como la <strong>Teoría de las Ventanas Rotas</strong>, sostiene que comunidades organizadas, limpias y vigiladas generan un entorno en el que el desorden —y con él el delito— tiene menos espacio para prosperar. Cuidar los árboles es, en ese sentido, también cuidar la seguridad del residencial.</p>`
      }
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
