/**
 * theme.js - Light/dark theme toggle
 * 
 * Features:
 *   - Persistent theme preference (localStorage: 'adla-theme')
 *   - Fallback to OS color-scheme preference via matchMedia
 *   - CSS-driven icon switching (moon/sun SVGs)
 *   - Smooth transitions via CSS
 */

const html = document.documentElement;
const body = document.body;
const themeToggleButton = document.getElementById('themeToggle');

function getCurrentLocale() {
  return localStorage.getItem('adla-lang') || localStorage.getItem('siteLang') || 'es';
}

function syncThemeLabel() {
  if (typeof window.ADLA_updateThemeToggleLabel === 'function') {
    window.ADLA_updateThemeToggleLabel(getCurrentLocale());
  }
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (body) {
    body.setAttribute('data-theme', theme);
  }
  localStorage.setItem('adla-theme', theme);
  localStorage.setItem('siteTheme', theme);
  syncThemeLabel();
}

/**
 * Initialize theme system.
 * Priority:
 *   1. Saved localStorage preference
 *   2. OS color-scheme preference (dark/light)
 *   3. Default: light
 */
function initTheme() {
  const savedTheme = localStorage.getItem('adla-theme') || localStorage.getItem('siteTheme');

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}

// Run initialization on page load
initTheme();

// Handle theme toggle button click
if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

// Listen for OS color-scheme changes (if user hasn't set preference)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('adla-theme') || localStorage.getItem('siteTheme');
  if (!savedTheme) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

document.addEventListener('adla-language-changed', () => {
  syncThemeLabel();
});
