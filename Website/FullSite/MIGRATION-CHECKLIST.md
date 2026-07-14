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
- [ ] Inventory LandingPage reusable modules: translations, theme, lang, modal, animations, app.
- [ ] Inventory fonts, colors, spacing, component classes from LandingPage styles.
- [ ] Inventory required media from Support/General and Support/Tiles.

Acceptance criteria:
- Reuse matrix documented in implementation notes.

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

### 1.4 Accessibility baseline (WCAG 2.1 AA)
- [ ] Verify color contrast minimums.
- [ ] Ensure keyboard navigation works for menu/buttons/interactive elements.
- [ ] Ensure labels, alt text, and semantic headings are present.
- [ ] Ensure readable font sizes and spacing for elderly audience.

Acceptance criteria:
- No blocking accessibility regressions in manual checks.

### 1.5 Calendario page (phase 1 requirement)
- [ ] Integrate Google Calendar interface/embed in calendario page.
- [ ] Add explanatory copy for neighbors and participation intent.
- [ ] Ensure calendar section is responsive and legible on mobile.

Acceptance criteria:
- Calendar is visible and usable on desktop and mobile.

### 1.6 Content wiring for initial tabs
- [ ] Home content no longer placeholder-only.
- [ ] Sobre content no longer placeholder-only.
- [ ] Calendario content includes clear user guidance.

Acceptance criteria:
- Phase 1 pages present meaningful production-ready content structure.

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
- [ ] Desktop checks: latest Chrome/Edge.
- [ ] Mobile checks: narrow viewport and touch behavior.
- [ ] Language switching checks.
- [ ] Theme switching checks.
- [ ] Navigation and anchor checks.
- [ ] Modal/interactive element checks.
- [ ] Accessibility sanity checks (keyboard and labels).

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

