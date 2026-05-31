# LandingPage

Static multilingual landing page for the Arboles de la Antigua project.

## Entry Files

- `small site.html`
  - Main site variant without analytics consent layer.
- `small site + GA.html`
  - Same site + GA4 + cookie consent modal.

## Tech Stack

- HTML + CSS + vanilla JavaScript
- i18n dictionaries in `js/translations.js`
- Runtime modules in `js/`:
  - `theme.js`
  - `lang.js`
  - `modal.js`
  - `animations.js`
  - `app.js`

## Assets

Asset files are in `Support/` (renamed from previous `images/` folder).

Common files:

- `Support/logoADLA.JPG`
- `Support/LogoV3.png`
- `Support/Info.jpg`
- `Support/Agenda.jpg`
- `Support/qrWA.jpg`

## Run Locally

Open either HTML file directly in a browser, or use any static server.

Example (if you use VS Code Live Server):

1. Open this folder in VS Code.
2. Right-click `small site.html` or `small site + GA.html`.
3. Choose "Open with Live Server".

## Translation Model

`js/translations.js` exposes `window.ADLA_TRANSLATIONS` with locales:

- `es`
- `en`
- `fr`

Bindings used in HTML:

- `data-i18n` for text nodes
- `data-i18n-html` for controlled HTML content
- `data-i18n-attr` for translated attributes

## Modal Model

`js/modal.js` handles all `data-modal` triggers.

Current modal routes include:

- benefit chips (`chip-*`)
- event modals (`event-info`, `event-agenda`)
- WhatsApp join modal (`join-whatsapp`)
- about photo zoom (`about-photo`)

## GA and Cookie Consent

Only in `small site + GA.html`:

- Consent popup appears when no consent decision exists.
- Consent choice saved in localStorage key `adla_cookie_consent_v1`.
- Default tracking is denied until user accepts.
- GA4 Measurement ID placeholder: `G-XXXXXXXXXX`.

To enable analytics:

1. Replace `G-XXXXXXXXXX` with your real GA4 ID.
2. Keep consent flow enabled for privacy compliance.

## Maintenance Checklist

When editing features:

1. Keep `small site.html` and `small site + GA.html` aligned unless intentional.
2. Update `ARCHITECTURE.md` for structural or runtime changes.
3. If text is translated, update all three locales in `js/translations.js`.
