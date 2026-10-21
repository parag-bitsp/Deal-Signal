# Verification record

Verified on 20 October 2026 using bundled Node 24.19.0 and local Google Chrome.

- Production build: `next build` passed, including TypeScript compilation.
- Domain, SQLite and persona-scope tests: **14 passed, 0 failed**.
- HTTP API checks passed: same-origin browser writes; rejected foreign origins; scoped opportunity and analysis access; scoped actions/audit; exact ₹20 lakh simulation delta; unchanged baseline.
- Browser journey passed: revenue overview → Aster → budget source → edited approval → persistence after reload → forecast scenario → manager and rep workspaces.
- Investigation retained dropdown and search filters after reload. A separate regression check passed for KPI drill-down filters.
- 390px mobile check passed with no document-level horizontal overflow. Wide tables scroll within their containers.
- Browser journey recorded no uncaught page errors.
- Eight historical snapshots use dated category events and only evidence available at the snapshot date. Verified first Commit snapshot ₹0 versus current Commit ₹6,54,00,000 in the full dataset.
- Review findings corrected: API scope leaks, procurement blockers counted as supported, nonexistent source quote, changed text on completion, lost investigation/KPI filter state.
- Screenshots inspected for desktop and mobile layout. No real API inference or paid services were used.

The final demo was restored to its clean seeded state after browser testing. Review and approval events created by the tests were cleared.

## Material boundaries

AI analysis is a labeled simulation using structured synthetic evidence. A live model adapter and persisted, versioned model-run repository remain future work. Demo persona selection is not real authentication. No real CRM updates or outbound communications occur. These checks establish engineering behavior on demo records, not real-world sales accuracy or business impact.

Dependency installation initially encountered Windows symlink permissions and an ignored Sharp build-script warning. The app uses an in-project package store and copied packages; required binaries were available and the production build and browser checks passed. An offline reinstall check could not resolve absent optional-package metadata; a fresh dependency installation requires registry access. The running app itself requires no external service or API key.
