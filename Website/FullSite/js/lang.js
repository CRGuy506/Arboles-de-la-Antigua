/**
 * lang.js - FullSite language handler with resilient dropdown wiring.
 * Source of truth: js/translations.js (window.ADLA_TRANSLATIONS)
 */

const translations = window.ADLA_TRANSLATIONS || {};
const languageSelect = document.getElementById('languageSelect');
const langDropdown = document.getElementById('langDropdown');
const langTrigger = document.getElementById('langTrigger');
const langMenu = document.getElementById('langMenu');
const langCurrentLabel = document.getElementById('langCurrentLabel');
const langCurrentFlag = document.getElementById('langCurrentFlag');
const themeToggle = document.getElementById('themeToggle');

const localeMeta = {
  es: { label: 'ES', flagClass: 'flag-es' },
  en: { label: 'EN', flagClass: 'flag-en' },
  fr: { label: 'FR', flagClass: 'flag-fr' }
};

function getFallbackLocale() {
  if (translations.es) {
    return 'es';
  }
  return Object.keys(translations)[0] || 'es';
}

function getSavedLocale() {
  const saved = localStorage.getItem('adla-lang') || localStorage.getItem('siteLang') || getFallbackLocale();
  return translations[saved] ? saved : getFallbackLocale();
}

function persistLocale(locale) {
  localStorage.setItem('adla-lang', locale);
  localStorage.setItem('siteLang', locale);
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function updateThemeToggleLabel(locale) {
  if (!themeToggle) {
    return;
  }
  const fallback = translations[getFallbackLocale()] || {};
  const dict = translations[locale] || fallback;
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  const label = dict[nextTheme] || fallback[nextTheme] || 'Cambiar tema';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
}

window.ADLA_updateThemeToggleLabel = updateThemeToggleLabel;

function updateLanguageDropdownUI(locale) {
  const meta = localeMeta[locale] || localeMeta[getFallbackLocale()] || localeMeta.es;

  if (langCurrentLabel) {
    langCurrentLabel.textContent = meta.label;
  }

  if (langCurrentFlag) {
    langCurrentFlag.className = `flag ${meta.flagClass}`;
  }

  if (langMenu) {
    langMenu.querySelectorAll('.lang-option[data-lang]').forEach((option) => {
      const optionLocale = option.getAttribute('data-lang') || '';
      option.setAttribute('aria-selected', optionLocale === locale ? 'true' : 'false');
    });
  }
}

function closeLanguageMenu() {
  if (langMenu) {
    langMenu.hidden = true;
  }
  if (langTrigger) {
    langTrigger.setAttribute('aria-expanded', 'false');
  }
}

function openLanguageMenu() {
  if (langMenu) {
    langMenu.hidden = false;
  }
  if (langTrigger) {
    langTrigger.setAttribute('aria-expanded', 'true');
  }
}

function applyTranslations(locale) {
  const fallback = translations[getFallbackLocale()] || {};
  const selectedLocale = translations[locale] ? locale : getFallbackLocale();
  const dict = translations[selectedLocale] || fallback;

  if (!Object.keys(dict).length) {
    return;
  }

  document.documentElement.lang = selectedLocale;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key] || fallback[key];
    if (value) {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const value = dict[key] || fallback[key];
    if (value) {
      el.innerHTML = value;
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const config = el.getAttribute('data-i18n-attr') || '';
    config.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (!attr || !key) {
        return;
      }
      const value = dict[key] || fallback[key];
      if (value) {
        el.setAttribute(attr, value);
      }
    });
  });

  persistLocale(selectedLocale);
  updateLanguageDropdownUI(selectedLocale);
  updateThemeToggleLabel(selectedLocale);
  document.dispatchEvent(new CustomEvent('adla-language-changed', { detail: { locale: selectedLocale } }));
}

window.ADLA_applyTranslations = applyTranslations;

const initialLocale = getSavedLocale();
if (languageSelect) {
  languageSelect.value = initialLocale;
}
applyTranslations(initialLocale);

if (langTrigger && langMenu) {
  langTrigger.addEventListener('click', () => {
    if (langMenu.hidden) {
      openLanguageMenu();
    } else {
      closeLanguageMenu();
    }
  });

  langMenu.querySelectorAll('.lang-option[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextLocale = button.getAttribute('data-lang') || getFallbackLocale();
      if (languageSelect) {
        languageSelect.value = nextLocale;
      }
      applyTranslations(nextLocale);
      closeLanguageMenu();
    });
  });
}

if (languageSelect) {
  languageSelect.addEventListener('change', (event) => {
    const nextLocale = event.target.value;
    applyTranslations(nextLocale);
  });
}

document.addEventListener('click', (event) => {
  if (!langDropdown || !langTrigger || !langMenu) {
    return;
  }
  if (!langDropdown.contains(event.target)) {
    closeLanguageMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLanguageMenu();
  }
});
