# LandingPage

Static multilingual landing page for the Arboles de la Antigua project.

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

Asset files are in `Support/` with grouped subfolders:

- `Support/General/`
- `Support/Tiles/`

Common files:

- `Support/General/logoADLA.JPG`
- `Support/General/Info.jpg`
- `Support/General/Agenda.jpeg`
- `Support/General/qrWA.jpg`

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

## Analytics

The site uses [Umami](https://umami.is/) for privacy-friendly, cookieless analytics.

- The tracking script is embedded in `index.html` via a `<script>` tag pointing to the Umami cloud endpoint.
- No cookies or personal data are collected.
- The `data-website-id` attribute on the script tag identifies the site in the Umami dashboard.

Custom events are tracked with:

```js
umami.track('event-name', { optional: 'payload' });
```

To disable tracking in development, remove or comment out the Umami `<script>` tag locally (it has no effect on page behavior) or make a small tweak to the browser: https://docs.umami.is/docs/exclude-my-own-visits

## Maintenance Checklist

When editing features:

1. Update `ARCHITECTURE.md` for structural or runtime changes.
2. If text is translated, update all three locales in `js/translations.js`.
