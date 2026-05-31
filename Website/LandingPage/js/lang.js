/**
 * lang.js - Language selection and translation handler
 * 
 * Dependencies: js/translations.js (must load before this script)
 * 
 * Features:
 *   - Persistent language preference (localStorage: 'adla-lang')
 *   - Custom dropdown with CSS flag icons
 *   - Fallback to Spanish if key missing in selected locale
 *   - Updates HTML lang attribute for accessibility
 *   - i18n binding: data-i18n, data-i18n-html, data-i18n-attr
 */

const translations = window.ADLA_TRANSLATIONS || {};

/**
 * Applies translations to all elements in the page.
 * Supports three binding types:
 *   - data-i18n: plain text replacement
 *   - data-i18n-html: allows inline markup (e.g., <br>, <em>)
 *   - data-i18n-attr: translates attributes (format: "attr:key;attr2:key2")
 * 
 * @param {string} locale - The target locale (es, en, fr, etc.)
 */
function applyTranslations(locale) {
  const fallback = translations.es || {};
  const selectedLocale = translations[locale] ? locale : (translations.es ? 'es' : Object.keys(translations)[0]);
  const dict = translations[selectedLocale] || fallback;

  if (!Object.keys(dict).length) {
    return;
  }

  // Update document language for accessibility and browser tools
  document.documentElement.lang = selectedLocale;

  // data-i18n => plain text replacement
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key] || fallback[key];
    if (value) el.textContent = value;
  });

  // data-i18n-html => allows controlled inline markup
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const value = dict[key] || fallback[key];
    if (value) el.innerHTML = value;
  });

  // data-i18n-attr => translates one or more attributes
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const config = el.getAttribute('data-i18n-attr');
    config.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (!attr || !key) return;
      const value = dict[key] || fallback[key];
      if (value) el.setAttribute(attr, value);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Language Dropdown Setup
// ═══════════════════════════════════════════════════════════════════════

const languageSelect = document.getElementById('languageSelect');
const langDropdown = document.getElementById('langDropdown');
const langTrigger = document.getElementById('langTrigger');
const langMenu = document.getElementById('langMenu');
const langCurrentLabel = document.getElementById('langCurrentLabel');
const langCurrentFlag = document.getElementById('langCurrentFlag');

// Metadata for each locale (label and CSS flag class)
const localeMeta = {
  es: { label: 'ES', flagClass: 'flag-es' },
  en: { label: 'EN', flagClass: 'flag-en' },
  fr: { label: 'FR', flagClass: 'flag-fr' }
};

/**
 * Updates the language dropdown UI to reflect selected locale.
 * @param {string} locale - The selected locale.
 */
function updateLanguageDropdownUI(locale) {
  const meta = localeMeta[locale] || localeMeta.es;
  langCurrentLabel.textContent = meta.label;
  langCurrentFlag.className = `flag ${meta.flagClass}`;
}

function closeLanguageMenu() {
  langMenu.hidden = true;
  langTrigger.setAttribute('aria-expanded', 'false');
}

function openLanguageMenu() {
  langMenu.hidden = false;
  langTrigger.setAttribute('aria-expanded', 'true');
}

// Initialize: restore saved language or default to Spanish
const savedLanguage = localStorage.getItem('adla-lang') || 'es';
languageSelect.value = translations[savedLanguage] ? savedLanguage : (translations.es ? 'es' : 'en');
applyTranslations(languageSelect.value);
updateLanguageDropdownUI(languageSelect.value);

// Toggle language menu on trigger button click
langTrigger.addEventListener('click', () => {
  if (langMenu.hidden) {
    openLanguageMenu();
  } else {
    closeLanguageMenu();
  }
});

// Handle language selection from dropdown menu
langMenu.querySelectorAll('.lang-option').forEach((button) => {
  button.addEventListener('click', () => {
    const nextLanguage = button.getAttribute('data-lang');
    languageSelect.value = nextLanguage;
    localStorage.setItem('adla-lang', nextLanguage);
    applyTranslations(nextLanguage);
    updateLanguageDropdownUI(nextLanguage);
    closeLanguageMenu();
  });
});

// Close menu when clicking outside the dropdown
document.addEventListener('click', (event) => {
  if (!langDropdown.contains(event.target)) {
    closeLanguageMenu();
  }
});

// Close menu on Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLanguageMenu();
  }
});

// Update on native select change (fallback for accessibility)
languageSelect.addEventListener('change', (event) => {
  const nextLanguage = event.target.value;
  localStorage.setItem('adla-lang', nextLanguage);
  applyTranslations(nextLanguage);
  updateLanguageDropdownUI(nextLanguage);
});
