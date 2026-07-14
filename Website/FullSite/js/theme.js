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
const themeToggle = document.getElementById('themeToggle');

/**
 * Initialize theme system.
 * Priority:
 *   1. Saved localStorage preference
 *   2. OS color-scheme preference (dark/light)
 *   3. Default: light
 */
function initTheme() {
  const savedTheme = localStorage.getItem('adla-theme');
  
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
  }
}

// Run initialization on page load
initTheme();

// Handle theme toggle button click
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', nextTheme);
  localStorage.setItem('adla-theme', nextTheme);
});

// Listen for OS color-scheme changes (if user hasn't set preference)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('adla-theme');
  if (!savedTheme) {
    html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});
