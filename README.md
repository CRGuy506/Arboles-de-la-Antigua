# AdlA Workspace

Monorepo-style workspace with two main projects:

- `Website/LandingPage`: static multilingual community landing site.
- `Picture scrapper`: Python utility to download images from URLs listed in Excel.

## Repository Layout

- `Website/`
  - `LandingPage/`
    - `small site.html`
    - `small site + GA.html`
    - `translations.js`
    - `styles/main.css`
    - `js/`
    - `Support/`
- `Picture scrapper/`
  - `download_images.py`
  - `downloaded_images/`
  - `img_downloader_env/`

## Quick Start

### LandingPage

Open one of these files in a browser:

- `Website/LandingPage/small site.html` (no analytics)
- `Website/LandingPage/small site + GA.html` (GA + cookie consent)

### Picture scrapper

From `Picture scrapper/` run:

```powershell
python download_images.py -SourceFilePath "path\to\data.xlsx"
```

## Notes

- LandingPage assets currently resolve from `Support/` paths.
- `small site + GA.html` includes GA4 consent-mode defaults with privacy-first behavior.
- Keep `Website/LandingPage/ARCHITECTURE.md` updated when behavior changes.
