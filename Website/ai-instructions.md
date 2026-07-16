# ai-instructions.md - Arboles de la Antigua

## 1. Overview
This file is the central project guide and working memory for Arboles de la Antigua.

Purpose:
- Align human contributors and AI agents on the same execution protocol.
- Keep migration and implementation decisions auditable.
- Record progress and corrections per code change.

Canonical project direction:
- FullSite is the destination product under active construction.
- LandingPage is the reference implementation used for copy/paste-first migration.

## 2. Project Goals
Primary objective (Objective 1):
- Migrate style, features, and modules from LandingPage into FullSite with minimal drift.

Secondary objectives:
- Build out the full tabbed site structure with meaningful production-ready static content.
- Add dynamic features in phased order, starting with member accounts/auth after Phase 1.
- Integrate an open-source backend database for future dynamic workflows.
- Use the Picture scrapper workflow to enrich website content/media.
- Keep solution low-cost and replicable for other communities.

Target audience and stakeholders:
- Primary users: neighborhood residents, with a bias toward elderly and non-technical users.
- Secondary stakeholders: small project team and future partner communities.

## 3. Architecture Summary
Current state:
- LandingPage is currently the only production-deployed web surface.
- FullSite contains the future multi-page architecture and is in migration/build phase.

Target state:
- FullSite becomes the canonical production site after migration acceptance.
- LandingPage is retained as a reference/archive implementation.

Main components:
- Website/LandingPage: stable source of reusable UX modules and design tokens.
- Website/FullSite: target site with tabbed pages and shared JS/CSS runtime.
- Picture scrapper: Python utility for content/media enrichment.

Core reusable frontend modules:
- translations.js, lang.js, theme.js, modal.js, animations.js, app.js

Technologies used today:
- HTML5, CSS3, vanilla JavaScript.
- Umami analytics (privacy-first, GDPR-aware tracking baseline).
- Python utility stack in Picture scrapper (requests, BeautifulSoup, pandas, openpyxl).

## 4. Development Environment
Languages:
- JavaScript (browser runtime).
- HTML/CSS.
- Python 3.x for scraper utility.

Setup instructions:
1. Clone repository.
2. Open workspace root (AdlA).
3. For website work, use Website/FullSite as the implementation target.
4. For scraper work, run commands inside Picture scrapper.

Local run instructions:
- FullSite/LandingPage: open html files directly or use a local static server.
- Scraper example:
	python download_images.py -SourceFilePath "path\\to\\data.xlsx"

Environment/config notes:
- No mandatory secret env vars required for static-site local run.
- Analytics behavior should remain privacy-conscious and documented.

Hosting details:
- Automated deployment is currently LandingPage-only.
- Infra-doc and Maintenance docs are source-of-truth for hosting operations and must be kept updated.

## 5. Key Features and Functionality
Phase 1 required features:
- Static FullSite page foundation.
- Shared shell and navigation parity.
- ES/EN/FR language support.
- Theme toggle with preference persistence.
- Google Calendar embed on calendario page.
- Manual content update model (no auth in Phase 1).

Phase 2 first dynamic feature:
- Member accounts/auth.

Analytics:
- Umami is the standard implementation.
- No GA-first assumption unless explicitly re-approved.

API/backend status:
- Dynamic backend APIs are planned, not production baseline yet.

## 6. Design Guidelines
Design principles:
- Accessible, legible, calm, and clear for elderly/non-technical users.
- Preserve brand parity with LandingPage while adapting to FullSite page architecture.

Layout rules:
- Shared header/nav/footer across FullSite pages.
- Consistent controls row and tabs row behavior.

Migration style rule:
- Copy/paste from LandingPage first, then apply minimal FullSite path/selector adaptations.

i18n rule:
- Maintain multilingual readiness through data-i18n bindings unless explicitly exempted.

Accessibility baseline:
- WCAG 2.1 AA.

## 7. Content Requirements
Audience profile:
- Community neighbors, skewing elderly and lower technical proficiency.

Tone:
- Direct, concise, practical, and non-fluffy.

Core content sections:
- Home, Sobre, Calendario, Cuadrillas, Galeria, Inventario, Noticias, Plantas, Recursos, Contacto.

Content ownership:
- Small team approval model; in practice the primary maintainer currently drives most changes.

## 8. Testing and Deployment
Testing approach:
- Manual QA baseline per implementation slice.
- Validate desktop/mobile behavior, language switch, theme persistence, nav integrity, and modals.
- Enforce WCAG 2.1 AA checks for contrast, semantics, and keyboard access.

Testing commands:
- No unified test runner is currently enforced for static site.
- Add command-level documentation if/when automation is introduced.

Deployment:
- LandingPage has active deployment path.
- FullSite deployment cutover is pending migration acceptance criteria.

CI/CD notes:
- Keep deployment and maintenance documentation aligned with actual workflows.

## 9. Important Files and Directories
Repository root:
- README.md: workspace overview.

Website:
- Website/ai-instructions.md: primary governance and agent memory.
- Website/FullSite/: current implementation target for new site.
- Website/LandingPage/: production reference source for migration.

FullSite runtime files:
- Website/FullSite/js/: translated runtime modules.
- Website/FullSite/styles/main.css and assets/styles.css: styling system.

Operations and architecture docs:
- Website/FullSite/MIGRATION-CHECKLIST.md
- Website/LandingPage/ARCHITECTURE.md
- Website/*/Extras/Infra-doc.md and Maintenance.md

Utility project:
- Picture scrapper/download_images.py and related environment files.

## 10. Known Limitations
- FullSite is still mid-migration and not fully feature-complete.
- Automated deployment currently targets LandingPage only.
- Dynamic backend/auth features are planned but not completed.
- Existing naming/entrypoint consistency has prior collaborator drift and must be normalized over time.

## 11. Permanent User Notes (Do Not Overwrite)
Note: This section contains permanent notes from the project owner. Do not modify or remove this section under any circumstances.

- this project is the tech branch of a broader urban forrestry initiative. This is for my neighborhood which has a mixed demographic but biased towards elderly non-technical people.
- ADLA/Website/LandingPage contains a working in-prod landingpage that was created for the purpose of supporting an event. 
- Landing page should be used as reference material only for you to spin up the site and see how it should function and look, all .js and .css files are also copied over to the current working directory
- ADLA/Website/Fullsite is the current working directory. All files and code for the functioning of the new site should be contained within it.
- the project is at a migration phase where we need to migrate what was done already into a new platform and then features will be added as we go along
- I need you to be very critical of my suggestions I don't need fluff or sugar coating, I rather you be succint, direct and assertive.
- before performing actions read through this living document to make sure that your actions align with this.
- Plan --> discuss --> execute should be our working model
- Create an offline backup of this file within the parent directory to prevent accidental deletions.

## 12. Instructions for AI Agents
Execution protocol:
- Read this file before implementation decisions.
- Follow Plan --> discuss --> execute.
- Keep current vs target architecture explicitly separated in proposals.

Migration protocol:
- FullSite is destination; LandingPage is copy/paste-first source.
- Do not create custom re-implementations before trying direct reuse.
- Keep all implementation changes for new site within FullSite paths.

Documentation protocol:
- Record each code change or decision in Section 13 and Section 19.
- Record errors and corrections in Section 16 immediately.
- Preserve Section 11 exactly unless explicitly instructed by project owner.
- All code changes must be properly documented and include clear, maintainable comments where needed for ease of use.

Analytics/privacy protocol:
- Keep Umami + GDPR alignment explicit in implementation guidance.

## 13. Agent Working Memory
Working plan:
- Objective A: complete LandingPage-to-FullSite migration with parity-first implementation.
- Objective B: finish Phase 1 static acceptance criteria before dynamic expansion.

Task breakdown (active):
- Task 1: migrate reusable modules and styles from LandingPage to FullSite with minimal adaptation.
- Task 2: complete remaining page content and calendario embed requirements.
- Task 3: prepare auth-first dynamic Phase 2 plan.

Task progress:
- Current task: Calendario functional hardening after month/year custom UI rollout.
- Completed tasks:
	- Rebuilt this document from template into concrete project guidance.
	- Added explicit migration and implementation protocols.
	- Recorded correction event and prevention controls.
	- Rewired FullSite pages to `js/translations.js` + `js/lang.js` + `js/theme.js` + `js/app.js` + `js/modal.js` and commented legacy `assets/` runtime includes.
	- Hardened `js/lang.js` for FullSite markup, unified theme-label behavior, and preserved migration compatibility for prior localStorage keys.
	- Implemented custom Calendario month/year booking calendar in `Website/FullSite/js/calendar.js` with yearly planning overview and Google ICS important-date ingestion.
	- Fixed year-toggle render bug by enforcing explicit `[hidden]` display collapse rules for calendar subviews in `Website/FullSite/assets/styles.css`.
- Next steps:
	- Confirm production Google Calendar feed settings/event availability for stable important-date visualization.
	- Define and integrate backend booking API (replace frontend-only reservation consistency limits).
	- Continue module-by-module migration in FullSite using copy-first protocol and maintain parity/a11y checks.

Insights and adjustments:
- Decision: enforce copy/paste-first rule as default migration mechanism.
- Rationale: reduces drift and avoids regressions from unnecessary custom rewrites.

Challenge encountered:
- Prior implementation deviated from copy-first rule for Join Us icon/modal path.
- Resolution status: correction documented; migration protocol reinforced.

Transfer notes:
- Current state: document now reflects concrete project goals, constraints, and execution model.
- Recommendation: treat this file as blocking governance before every FullSite code change.

## 14. Meta-Learning Updates
Self-awareness protocol:
- Act with full repository context.
- Avoid unnecessary permission-seeking when authority is already granted.
- Keep state and decisions synchronized in this file.

Error recovery protocol:
- Stop on correction feedback.
- Log root cause and prevention in Failure Modes Log.
- Resume only after protocol alignment.

Continuous improvement:
- Prefer reusable source implementation over novel local fixes during migration.
- Tighten audit trail in working memory entries per code change.

## 15. Design System Notes
Typography:
- Preserve FullSite parity with LandingPage font strategy.

Color and tokens:
- Reuse LandingPage token patterns in FullSite before introducing new variants.

Themes:
- Maintain light/dark support and preference persistence.

Accessibility:
- WCAG 2.1 AA baseline is mandatory.
- Prioritize readability, spacing, and contrast for elderly users.

Imagery/icons:
- Prefer reused validated assets/patterns from LandingPage when equivalent components exist.

## 16. Failure Modes Log
Issue:
- Agent deviated from migration rule by implementing a local Join Us icon/modal fix instead of first reusing LandingPage implementation.

Cause:
- Prioritized quick browser-specific rendering workaround over established copy-first migration protocol.

Solution:
- Documented correction and reinstated mandatory copy/paste-first policy in governance sections.

Prevention:
- For FullSite migration, always attempt direct LandingPage reuse first (modal.js/main.css paths and patterns), then apply minimal selector/path adjustments.
- Log the rationale if any deviation is unavoidable.

## 17. Agent Brain Dump
Project context and evolution:
- Repo started with event-focused landing implementation and is now transitioning to full neighborhood platform.
- Migration is the immediate strategic priority before dynamic feature expansion.

Human interaction model:
- Communication preference is direct, concise, and assertive.
- Overly tentative or fluffy responses are not aligned with project owner expectations.

Critical learnings:
- Process discipline (copy-first + documented updates) is as important as code output.
- Architectural drift risk is highest when implementing without source parity checks.

Current challenges:
- Completing FullSite migration breadth while preserving consistency and accessibility.
- Managing phased delivery without premature backend scope expansion.

## 18. Project Structure and Development
Directory structure (simplified):
- AdlA/
	- README.md
	- Website/
		- ai-instructions.md
		- FullSite/
		- LandingPage/
	- Picture scrapper/

Development requirements:
- Browser for static-site validation.
- Python runtime for scraper workflow.

Local development:
- Open Website/FullSite pages via browser or static server.
- Keep LandingPage as read-only migration reference unless explicit change authorization exists.

Deployment procedures:
- Current production deployment path remains LandingPage.
- Future cutover requires FullSite parity, QA sign-off, and updated ops docs.

Roadmap phases (no dates):
- Phase 1: static FullSite foundation + calendar embed + manual content.
- Phase 2: auth/member accounts and backend baseline.
- Phase 3: expanded dynamic modules and operational workflows.

Success metrics (6-12 months):
- Full site operation.
- At least 80% coverage of listed features.
- Traffic engagement gains.

## 19. Agent Working Memory Updates
[2026-07-14]
- Recreated ai-instructions.md from template into a concrete, project-specific instruction document.
- Preserved permanent user notes section and integrated project Q&A outputs into structured sections.
- Recorded correction regarding Join Us migration deviation and strengthened prevention rules.
- Confirmed backup requirement execution by creating an offline parent-directory backup.

[2026-07-14]
- Executed FullSite i18n/theme runtime correction: deactivated active `assets/` script runtime and migrated all pages to `js/` source-of-truth stack.
- Logged compatibility measures for existing localStorage keys and cleaned obvious corruption in `js/translations.js`.

[2026-07-14]
- Corrected post-migration theme selector break in FullSite by resolving global `const` name collision between `js/lang.js` and `js/theme.js`.
- Performed Playwright comparison against LandingPage to verify toggle behavior and persistence parity after fix.

[2026-07-15]
- Documented Calendario expansion from simple booking board into dual month/year planner UX with a yearly zoom-out overview (totals, planting window, peak month, monthly intensity strip).
- Added Google Calendar public ICS ingestion as primary important-date source with local fallback only on retrieval failure.
- Verified year-toggle behavior with Playwright in multiple shared tabs and corrected remaining visual overlap by adding explicit hidden-section CSS rules.
- Session paused with known next focus: production feed reliability and backend booking integration for multi-user consistency.

## 20. Appendices
A. Resources
- Website/README and module docs under LandingPage and FullSite.
- MIGRATION-CHECKLIST for phased acceptance criteria.

B. Glossary
- FullSite: target production website under active construction.
- LandingPage: existing production site and migration reference source.
- Copy-first migration: direct reuse from LandingPage before adaptation.

C. Change log
- 2026-07-14: full conversion from generic template to enforced project governance document with correction audit entry.
