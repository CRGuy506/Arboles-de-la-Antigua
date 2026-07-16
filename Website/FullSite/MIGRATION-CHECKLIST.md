# FullSite Migration Checklist

Purpose:
- Execute the approved big-bang migration from LandingPage to FullSite with clear order, acceptance criteria, and handoff clarity.

Scope:
- In scope: FullSite phase 1 static rollout, design/module migration, Google Calendar integration, QA baseline.
- Out of scope: production cutover switch, role system, full dynamic backend implementation.

## Phase 0 - Alignment and Baseline

### 0.1 Source-of-truth lock
- [x] Confirm FullSite is the target production site after migration.
- [x] Confirm LandingPage remains reference only during build.
- [x] Confirm tracking standard remains Umami and GDPR compliant.

Acceptance criteria:
- Direction reflected in Website/ai-instructions.md.
- No open ambiguity about target architecture.

### 0.2 Asset and module inventory
- [x] Inventory LandingPage reusable modules: translations, theme, lang, modal, animations, app.
- [x] Inventory fonts, colors, spacing, component classes from LandingPage styles.
- [x] Inventory required media from Support/General and Support/Tiles.

Acceptance criteria:
- Reuse matrix documented in implementation notes.

Implementation notes (inventory + reuse matrix):

LandingPage reusable JS modules:
- `translations.js` -> `Website/FullSite/js/translations.js` (present; runtime parity target)
- `theme.js` -> `Website/FullSite/js/theme.js` (present; persistence behavior in place)
- `lang.js` -> `Website/FullSite/js/lang.js` (present; ES/EN/FR shell support in place)
- `modal.js` -> `Website/FullSite/js/modal.js` (present; use copy-first for remaining modal variants)
- `animations.js` -> `Website/FullSite/js/animations.js` (present)
- `app.js` -> `Website/FullSite/js/app.js` (present)

LandingPage style inventory (`Website/LandingPage/styles/main.css`):
- Typography:
	- Primary sans: `DM Sans` (+ emoji/system fallbacks)
	- Display serif: `Playfair Display` (+ Georgia fallback)
- Core color/design tokens:
	- Light theme tokens: `--cream`, `--warm-white`, `--bark`, `--moss`, `--moss-light`, `--leaf`, `--gold`, `--gold-light`, `--rust`, `--sky`, `--footer-bg`, `--footer-text`, `--border`
	- Dark theme overrides defined under `[data-theme="dark"]`
	- Elevation/radius tokens: `--shadow-sm|md|lg`, `--r-sm|md|lg|pill`
- Spacing/layout patterns:
	- Container width: `width: min(1100px, 100% - 3rem)` with mobile variant `100% - 1.5rem`
	- Section rhythm examples: hero `6rem 0 4rem`, about/event/agenda `7rem 0`, footer `3rem 0 2rem`
	- Repeated gap/padding scale appears in `0.25rem` to `4rem` range across components
- Core reusable component classes:
	- Navigation/shell: `.navbar`, `.navbar-inner`, `.navbar-controls`, `.nav-links`, `.footer`, `.footer-inner`
	- CTA/buttons: `.btn-primary`, `.btn-ghost`, `.btn-cta-sm`, `.cta-wa-icon`
	- Hero/sections: `.hero`, `.hero-banner`, `.hero-layout`, `.section-about`, `.section-event`, `.section-agenda`
	- Modal system: `.modal-overlay`, `.modal`, `.modal-header`, `.modal-body`, `.modal-close`, `.modal-actions`

LandingPage media inventory:
- `Website/LandingPage/Support/General` (10 assets):
	- `adla.ico`, `Agenda.jpeg`, `Certificado Tree City La Union 2025.jpeg`, `Hero.jpg`, `Info.jpg`, `Informe proyecto de siembra 2025.pdf`, `jingle.mpeg`, `logoADLA.JPG`, `qrWA.jpg`, `WA.ico`
- `Website/LandingPage/Support/Tiles` (16 assets):
	- `tile-01.jpg` through `tile-16.jpg`

Reuse policy confirmation:
- FullSite migration keeps LandingPage as source-of-truth reference; copy/paste first, then minimally adapt selectors/paths.

## Phase 1 - Static FullSite Foundation

### 1.1 Global shell and navigation
- [x] Standardize shared header/nav/footer across all FullSite pages.
- [x] Ensure tab links are correct and non-broken for all existing FullSite files.
- [x] Ensure consistent page titles and metadata conventions.

Acceptance criteria:
- All tabs reachable.
- Shared shell is visually and structurally consistent.

### 1.2 Design system transfer (LandingPage -> FullSite)
- [x] Port typography choices (Playfair Display + DM Sans) into FullSite.
- [x] Port color tokens and dark/light theme behavior.
- [x] Port primary button and card treatment patterns.
- [x] Adjust layout from single-page scroll model to tabbed page model.

Acceptance criteria:
- FullSite visually matches LandingPage brand language.
- No major style drift across pages.

### 1.3 i18n and theme functionality
- [x] Add multilingual support parity (es/en/fr) to FullSite shell.
- [x] Ensure translation key strategy is consistent and maintainable.
- [x] Ensure theme toggle persists user preference.

Acceptance criteria:
- Language toggle works on all pages.
- Theme persists and is accessible.

Implementation notes:
- Runtime rewired from legacy `assets/app.js` monolith to `js/` stack for source-of-truth alignment.
- All FullSite pages now load `js/translations.js`, `js/lang.js`, `js/theme.js`, `js/app.js`, and `js/modal.js`.
- Legacy `assets/app.js` and `assets/modal.js` includes were commented out (reference-only, not active runtime).
- Storage-key compatibility preserved during migration (`adla-lang`/`siteLang`, `adla-theme`/`siteTheme`).
- `js/translations.js` cleaned of corrupted duplicate entries in the `en` locale header section.
- Deep-audit revalidation of `Website/FullSite/js/translations.js`: syntax valid (`es/en/fr`), locale key counts aligned, and no cross-locale leakage lines remaining in the active FullSite translation file.

### 1.4 Accessibility baseline (WCAG 2.1 AA)
- [x] Verify color contrast minimums.
- [x] Ensure keyboard navigation works for menu/buttons/interactive elements.
- [x] Ensure labels, alt text, and semantic headings are present.
- [x] Ensure readable font sizes and spacing for elderly audience.

Acceptance criteria:
- No blocking accessibility regressions in manual checks.

Implementation notes (in-house reusable baseline):
- In-house modal accessibility API is now reusable via `window.ADLA_MODAL` in `Website/FullSite/js/modal.js`:
	- focus trap with Tab/Shift+Tab loop
	- focus restore to trigger on close
	- background `aria-hidden` isolation while modal is active
	- configurable open API (`openModal`, `openTranslatedModal`) for future content sections
- In-house page accessibility helpers available via `window.ADLA_ACCESSIBILITY` in `Website/FullSite/js/app.js`:
	- `ensurePageAccessibilityBasics()` enforces semantic page title handling and main landmark labeling
	- `createAccessibleCard()` provides a reusable content-card constructor with optional modal action wiring
- Semantic heading baseline applied to FullSite templates: page titles upgraded to `h1` across all current pages.
- Keyboard visibility baseline strengthened in `Website/FullSite/assets/styles.css`:
	- explicit high-visibility `:focus-visible` ring for links/buttons/nav/modal controls
	- removed blanket `outline: none` suppression from interactive focus states
- Readability baseline strengthened in `Website/FullSite/assets/styles.css`:
	- increased nav/control/footer text sizes
	- improved muted text contrast for card and footer content
	- increased default body line-height for easier reading.

### 1.5 Calendario page (phase 1 requirement)
- [x] Integrate calendar-backed booking interface in calendario page.
- [x] Add explanatory copy for neighbors and participation intent.
- [x] Ensure calendar section is responsive and legible on mobile.

Acceptance criteria:
- Calendar is visible and usable on desktop and mobile.

Implementation notes:
- `Website/FullSite/calendario.html` now uses a fully custom in-site booking board (no iframe) to preserve FullSite visual immersion.
- Added clear volunteer flow copy oriented to cuadrillas booking:
	- purpose/introduction block
	- 3-step "how to book" guidance
	- waitlist fallback via neighborhood chat
- Added direct external-open action (`Open in Google Calendar`) for users who prefer full calendar UI.
- Added responsive booking-board styles in `Website/FullSite/assets/styles.css`:
	- `calendar-layout` for explanatory cards
	- `booking-filters` and `booking-list` layouts
	- shift cards, availability badges, and reservation form styling
	- mobile header/action wrapping behavior for readability.
- Added `Website/FullSite/js/calendar.js` custom frontend runtime with API-ready adapter + local fallback for shift loading and reservation flow.
- Added proper in-site month calendar UI (with month navigation, day markers, and day-click filtering) so users can browse cuadrilla events and important dates directly in the FullSite visual system.
- Added translation keys in `Website/FullSite/js/translations.js` for ES/EN/FR calendar guidance, booking board controls, statuses, and reservation form labels.
- Enhanced Calendario with true dual-view calendar UX:
	- Month/Year toggle controls in `calendario.html`
	- Yearly overview panel (annual totals, peak month, planting-season window, month-intensity strip)
	- Year month-cards showing shift/important/planting counts and activity states.
- Implemented important-date ingestion from Google Calendar public ICS feed (`public/full.ics`) as primary source; local important-date fallback remains active only when feed/network retrieval fails.
- Fixed year-toggle rendering issue where monthly grid could remain visually present despite `hidden` attribute state by adding explicit hidden-display rules for calendar view sections in `assets/styles.css`.

Current pause state (resume target):
- Calendar view architecture is stable and validated; remaining work is functional hardening for real operations:
	- confirm Google Calendar feed availability/content policy for production calendar id
	- define backend booking API contract and connect `window.ADLA_BOOKING_API` path
	- add conflict-handling/race-condition safeguards for booking capacity updates.

### 1.6 Content wiring for initial tabs
- [ ] Home content no longer placeholder-only.
- [ ] Sobre content no longer placeholder-only.
- [ ] Calendario content includes clear user guidance.
- [ ] Migrate core "About Us" narrative blocks from LandingPage into `home.html` (mission, neighborhood context, impact framing).
- [ ] Add "past events" treatment in FullSite content model (instead of only upcoming-focused event cards).
- [ ] Convert "Dia del Arbol" from upcoming event framing to past-event/archive framing in FullSite pages where it appears.

Acceptance criteria:
- Phase 1 pages present meaningful production-ready content structure.
- `home.html` includes merged non-placeholder About narrative copied from LandingPage source with minimal adaptation.
- "Dia del Arbol" is no longer presented as an upcoming event in FullSite and is represented as a completed/past community event.
- Event copy across `home.html`, `noticias.html`, and related CTAs is internally consistent (no conflicting upcoming vs past labels).

## Phase 2 - Dynamic Foundation (Planned Next)

### 2.1 Auth-first dynamic implementation
- [ ] Define auth requirements and account lifecycle.
- [ ] Implement member account foundations.
- [ ] Keep role model staged (no full role matrix enforcement yet unless required).

Acceptance criteria:
- Member auth is functional in development with documented constraints.

### 2.2 Backend baseline
- [ ] Establish backend project using Node.js + TypeScript.
- [ ] Provision local PostgreSQL on host environment.
- [ ] Define initial schema and migration process.

Acceptance criteria:
- Backend can read/write baseline domain entities.

## Phase 3 - Dynamic Expansion (Planned)

### 3.1 Calendar workforce flows
- [ ] Add participation/workforce flow linked to calendar entries.
- [ ] Capture operational data needed by coordinators.

### 3.2 Remaining dynamic modules
- [ ] Prioritize tabs for dynamic conversion by user impact.
- [ ] Integrate scraper-assisted media enrichment where useful.

Acceptance criteria:
- Dynamic modules follow accessibility and privacy standards.

## QA and Verification Checklist

### Manual QA (required each implementation slice)
- [x] Desktop checks: latest Chrome/Edge.
- [x] Mobile checks: narrow viewport and touch behavior.
- [x] Language switching checks.
- [x] Theme switching checks.
- [x] Navigation and anchor checks.
- [x] Modal/interactive element checks.
- [x] Accessibility sanity checks (keyboard and labels).

Accessibility verification matrix (2026-07-14, Playwright desktop pass):

| Page | H1 (single) | Heading order | Landmarks (main/nav) | Missing alt | Control labels | Keyboard reachable | Contrast sample (AA) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `home.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `sobre` (merged into home) | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `plantas.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `cuadrillas.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `recursos.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `noticias.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `inventario.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `galeria.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `calendario.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| `contacto.html` | Pass | Pass | Pass | Pass | Pass | Pass | Pass |

Notes:
- All pages reported `missingAlt=0` and `unlabeledControls=0`.
- All pages reported one decorative image with `alt=""` (`emptyAlt=1`), which is acceptable for non-informational icons.
- All pages reported `focusableCount=14` in the current shell/content state.

Mobile verification matrix (2026-07-14, Playwright 390x844 pass after tap-target fix):

| Page | H1 | main/nav | nav links | Horizontal overflow | Tap target size |
| --- | --- | --- | --- | --- | --- |
| `home.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `sobre` (merged into home) | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `plantas.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `cuadrillas.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `recursos.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `noticias.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `inventario.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `galeria.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `calendario.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |
| `contacto.html` | Pass | Pass | Pass (10) | Pass (0px) | Pass |

Mobile shell interaction checks (home):
- Language menu opens and switch to EN updates `document.documentElement.lang`.
- Theme toggle switches `data-theme` state.
- Join CTA opens modal with expected dialog content.
- Navigation links are valid `.html` targets across tabs.

### Automated QA (when available)
- [ ] Run linting/formatting checks.
- [ ] Run unit/integration checks where implemented.

Acceptance criteria:
- No critical defects in primary user flows.

## Cutover Readiness Gate (Do not execute yet)

- [ ] FullSite feature parity for agreed phase scope.
- [ ] QA sign-off completed.
- [ ] Deployment path for FullSite defined and validated.
- [ ] Rollback plan documented.
- [ ] LandingPage archival plan confirmed.

## Risks and Mitigations

1. Risk: Style drift between LandingPage and FullSite.
- Mitigation: enforce token/component parity before page-level customization.

2. Risk: Accessibility regressions while increasing feature density.
- Mitigation: run WCAG-focused checks for every page update.

3. Risk: Scope creep before phase 1 completion.
- Mitigation: defer auth/backend work until phase 1 acceptance criteria pass.

4. Risk: Tracking/privacy misalignment.
- Mitigation: keep Umami-only policy and GDPR checks documented per change.

## Progress Log

[2026-07-13]
- Checklist created from approved migration plan and project governance rules.

[2026-07-13]
- Phase 1.1 completed: shared nav schema and shared footer applied across all FullSite pages.
- Active-tab highlighting implemented via assets/app.js using pathname matching.

[2026-07-14]
- Phase 1.2 completed: FullSite shared visual system aligned to LandingPage patterns (typography, tokens, buttons/cards, navbar parity treatment).

[2026-07-14]
- Phase 1.3 completed: FullSite shell now supports ES/EN/FR language switching and persisted dark/light theme behavior.

[2026-07-14]
- FullSite top bar updated to two-row layout (controls row + tabs row) while preserving Small Site parity for language selector, theme toggle, and Join Us CTA.

[2026-07-14]
- Phase 0.2 completed: documented LandingPage module, style-token/component, and media inventory with FullSite reuse matrix in this checklist.

[2026-07-14]
- Phase 1.3 rewired to `js/` source-of-truth runtime (translations/lang/theme/modal/app) and removed active dependency on `assets/` runtime scripts.

[2026-07-14]
- Fixed FullSite theme selector regression caused by global script-scope const collision (`themeToggle` in `js/lang.js` and `js/theme.js`).
- Validated theme-toggle behavior parity against LandingPage using Playwright (state toggle and persistence keys).

[2026-07-14]
- Phase 1.4 completed using in-house patterns only: reusable accessible modal API, reusable page a11y helpers, semantic heading upgrades (`h1`), stronger keyboard focus states, and improved readability/contrast tokens in active FullSite styles.

[2026-07-14]
- FullSite accessibility verification expanded to all 10 pages using Playwright desktop checks.
- Result: no blocking findings in heading/landmark/label/keyboard/contrast sample checks; per-page matrix recorded in QA section.

[2026-07-14]
- Mobile viewport QA pass completed for all 10 FullSite pages (390x844): no horizontal overflow and no touch-target failures after control sizing adjustments.
- Updated touch-target sizing in `Website/FullSite/assets/styles.css` for `.lang-trigger` and `.btn-cta-sm` to meet mobile interaction baseline.
- Hardened runtime guards in `Website/FullSite/js/app.js` (hash-link selector safety) and `Website/FullSite/js/modal.js` (keydown target Element guard) to prevent non-blocking runtime errors during interaction automation.
- Deep-audit revalidation completed for `Website/FullSite/js/translations.js`; active FullSite translation dictionary remains structurally valid and aligned for current shell usage.

[2026-07-14]
- Phase 1.5 completed: calendario page now includes embedded Google Calendar + explicit volunteer booking guidance for cuadrillas.
- Added responsive embed/container styles and verified mobile viewport behavior (390x844): no overflow, iframe visible, CTA touch target valid.
- Translation coverage extended for calendar flow and page-level shell keys in ES/EN/FR to keep language switching parity.

[2026-07-15]
- Calendario moved from embed-first behavior to full custom month/year calendar workflow with booking board integration in active FullSite runtime (`js/calendar.js`).
- Added yearly "zoom-out" planning layer:
	- annual summary header, planting-season window, peak-month indicator, monthly intensity strip, and monthly activity-state cards.
- Important dates now load from Google public ICS feed when reachable; when feed retrieval fails, local fallback is used to preserve non-blocking UX.
- Verified via Playwright across shared tabs:
	- year toggle activates proper year mode,
	- monthly grid/week header fully hidden in year mode,
	- yearly overview and 12 month cards render correctly,
	- year navigation updates labels and card data.
- Known remaining functional gap for next session:
	- production data quality depends on external Google feed event availability/public settings;
	- booking flow still frontend-first and requires backend integration for multi-user consistency.

[2026-07-15]
- Phase 1 scope expanded for pending content migration parity:
	- Added explicit tasks to migrate About Us narrative from LandingPage into merged Home content.
	- Added explicit tasks to implement past-event treatment and reclassify "Dia del Arbol" as a completed event across FullSite content.

[2026-07-14]
- Calendario immersion update: replaced iframe embed with a fully custom frontend booking board in `Website/FullSite/calendario.html`.
- Added `Website/FullSite/js/calendar.js` with API-ready adapter and local fallback for shift listing, filtering, and reservation flow.
- Updated booking UI styles in `Website/FullSite/assets/styles.css` and expanded ES/EN/FR booking keys in `Website/FullSite/js/translations.js`.

[2026-07-14]
- Added proper monthly calendar UX to Calendario: 42-cell month grid, previous/next month navigation, "go to today" action, and visual markers for shifts/important dates.
- Clicking a day now syncs the date filter and narrows shift results, combining event discovery and booking flow in one custom interface.

