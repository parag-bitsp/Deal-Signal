# DealSignal

A local sales pipeline intelligence MVP for a fictional Indian B2B SaaS company. Every customer interaction is synthetic. All money is INR.

**[Live demo and guided walkthrough — bit.ly/3TTC5rb](https://bit.ly/3TTC5rb)**

The resume link opens the demo guide directly. [Direct guide URL](https://dealsignal-48tc.onrender.com/guide) · [Open the app](https://dealsignal-48tc.onrender.com). The demo uses shared synthetic data; no password is required.

## Start on this computer

Double-click `Start-DealSignal.cmd`, or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-DealSignal.ps1
```

Open http://127.0.0.1:3000. The launcher uses an installed Node executable or the bundled Codex Node runtime. Node **24 or newer** is required for the native SQLite API used here. Keep the terminal open while using the app; Ctrl+C stops it.

## Saved analysis results

The app displays saved assessments where available and seeded simulated analysis for the remaining opportunities. The entire live-analysis control card has been removed. New live runs are refused by the server even if an API key is configured, so browsing or reviewing the demo cannot trigger paid OpenAI requests.

Saved claims feed current dashboard totals, review briefs and forecast scenarios. Existing results retain their source-input hash, model metadata and provenance. Customer terminology is applied when records are displayed without rewriting persisted evidence or saved decisions. Historical charts remain based on dated synthetic records.

The earlier OpenAI adapter and its mocked validation tests remain in the source for reference; the app no longer invokes it. Keep any local `.env` private. It is ignored by Git and excluded from source uploads.

For the whole browser screen, use the **Full screen** button in the header, or open the app in Chrome/Edge and press F11. Some embedded browsers block the Fullscreen API. Investigations are full pages, with a back link and deep-linkable tabs.

## Standard development setup

With Node 24+ and pnpm installed:

```powershell
pnpm install --store-dir .cache/pnpm --node-linker hoisted --package-import-method copy --ignore-scripts
pnpm dev
```

The dependency versions are pinned and `pnpm-lock.yaml` records the resolved graph. Precompiled Next.js and Sharp packages are used; no third-party install scripts are needed for this demo.

```powershell
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

Production mode runs the last build. Rebuild after source changes. Development mode reloads changes automatically.

## Five-minute demonstration

Hiring managers can open **Read the demo script** on Revenue intelligence, or use the resume link above to open `/guide`. The six-step script includes links and expected results. **Start guided demo** opens a companion panel that remembers the current step in the browser tab as the reader navigates. No login, API key, or live AI call is required. Visitors share saved decisions; the guide explains how to inspect an existing approval without resetting the dataset.

## Saved call traces and cost

Under **Review & learn**, **View call traces and cost** opens `/traces`. Search saved model calls and inspect their recorded token usage and estimated INR cost. The screen reads up to 200 saved entries in the current demo persona's scope; duplicate copies of the same call count once. Viewing or refreshing it makes no model requests.

Default GPT-5 mini estimates use published token rates and an illustrative conversion of ₹90 per USD, not a live exchange quote. All displayed costs and token rates are in INR. Missing usage or unsupported pricing stays unavailable; partial totals are labeled. Estimates exclude hosting and taxes and are not billing statements. Original request payloads, raw provider responses and durations were not saved for older runs. The trace screen shows a saved source-hash comparison. The existing `/guide` resume destination remains available.

1. Open **Revenue intelligence**. The unsupported Commit KPI measures the gap between rep-reported Commit and complete customer support.
2. Investigate **Aster Manufacturing**, the first opportunity, valued at **₹20 lakh**.
3. Inspect the budget source: the rep asserts approval, but the customer explicitly says finance approval is pending. Economic-customer approval is separately **Unverified**.
4. Inspect two close-date pushes. Review and edit the proposed approval-alignment follow-up. **Record demo approval** saves the decision; no message is sent.
5. **Simulate reclassification** to Best Case. Simulated Commit decreases by exactly ₹20 lakh. The baseline remains Commit.
6. Reload to demonstrate persistence. Visit **Team workspace** and **Decision trail** to inspect the intervention. Completion preserves the approved text.
7. Open the weekly review brief and download it. Use **Reset demo data** to restore the original 150 deals and clear decisions.

## Included

- Home-page feedback form with a 1–5 star rating and optional text. Feedback is saved in the SQLite `feedback` table and retained when synthetic demo data is reset; feedback has no public read endpoint.
- Three interconnected workspaces, account investigation, activity timeline, close-date history and source inspection.
- 150 opportunities, 20 reps, four managers, stakeholders, source records, dated category/stage histories and 20 deliberate scenarios.
- Customer inactivity, missing next steps, zombie candidates, repeated slippage, commitment verification and procurement timeline checks.
- Human-reviewed interventions, persistent audit history and a forecast sandbox.
- Search, pagination, period/team/rep/risk/category filters, scoped review brief and data-derived charts.
- Responsive layouts and keyboard focus support.

## Architecture

Next.js 16 / React 19 / TypeScript; Node native SQLite; Lucide icons; plain CSS and accessible SVG charts. `lib/seed.ts` generates deterministic connected records. `lib/engine.ts` contains pure classification and aggregate functions. `lib/store.ts` manages SQLite transactions. `lib/scope.ts` scopes persona reads. `app/api/[...path]/route.ts` validates requests. UI lives in `components/`.

The approved proposal suggested Prisma, Tailwind and Recharts. The implementation uses native SQLite, CSS and SVG instead to reduce setup and dependencies. SQLite is stored at `data/pipeline.db` (override with `PIPELINE_DB`). The database is created and seeded automatically on first read. Demo evaluation time is fixed at **20 October 2026**; human decision timestamps use actual wall time and display in IST.

## Analysis and forecast policy

Deals without saved assessments use **simulated structured extraction**. Existing saved assessments supply claim analysis where available; the app never generates new model results. Customer-record annotations represent extracted commitments, and deterministic logic evaluates authority, date, exact quote existence and explicit contradictions. Simulated and saved assessments are labeled separately. The injection scenario is inert record text.

- Customer inactivity: at least 21 calendar days without meaningful inbound activity or a completed customer meeting.
- Zombie candidate: inactivity plus a missing or overdue dated next step.
- Repeated slippage: two or more later close-date changes in the past 90 days.
- Verified: current explicit authorized customer confirmation. Contradicted: explicit conflicting customer statement. Unverified: missing, stale, unauthorized, or unresolved conflicting evidence.
- Evidence older than 30 days requires reconfirmation.
- Supported Commit: all three commitments verified and no blocking procurement timeline. This is evidence completeness, **not win probability**.
- Confidence labels are synthetic extraction judgments, not calibrated probabilities.
- Snapshot charts reconstruct dated forecast category and evidence available at each point for the currently selected cohort.

No API key is needed. The app uses saved or simulated results and refuses new paid analysis requests. The retained adapter tests cover structured output, quote/authority/freshness validation, input hashes and provider labeling. There is no autonomous tool execution, external send or CRM update capability.

## Scope and limitations

Workspace navigation selects an explicit demo persona. Revenue intelligence reads the organization; managers read their team; reps read their opportunities. The API enforces those scopes on detail, analysis, simulation and associated audit records. Persona selection is deliberately user-controlled for demonstrations; **it is not production authentication or tenant isolation**. Each browser has one active demo persona; use separate browser contexts for concurrent personas.

This is a synthetic portfolio demo. Do not put real customer data in it. The [live demo](https://dealsignal-48tc.onrender.com) runs on paid, always-on Render Starter compute in Singapore with persistent SQLite storage and managed HTTPS; see [the Render deployment guide](docs/RENDER-DEPLOYMENT.md). The hosted OpenAI key has been removed and new live runs are refused by the server. The demo uses saved or simulated analysis without spending OpenAI credits. An alternative [VPS guide](docs/VPS-DEPLOYMENT.md) is retained for reference. Production rollout would need real authentication, tenant isolation, ingestion/retention policies and representative evaluation. Deterministic measurements are computed from persisted sources; saved model analyses retain provenance. No real forecast improvement, review-time savings or revenue recovery is claimed.

## Tests and evidence

- `tests/domain.test.ts`: dataset integrity, anchor statuses, simulation baseline preservation, zero denominators, inactivity boundary, evidence gaps, scenarios, procurement exclusion, exact quote validation and historical category reconstruction.
- `tests/store.test.ts`: SQLite reopen persistence, idempotency, stale versions, ownership, approval/completion transitions, immutable approved text, audit and reset.
- `tests/scope.test.ts`: consistent opportunity/action/audit persona scope.
- `tests/api.mjs`: run against a local server; verifies same-origin writes, rejected foreign origins, persona scopes and baseline-isolated scenarios.
- `tests/journey.mjs`: local browser journey including source inspection, editable approval, reload, ₹20 lakh scenario, preserved filters, navigation and 390px layout. Requires Playwright; configure `PLAYWRIGHT_PATH` and `BROWSER_EXE` for another machine. This test changes demo decisions; reset before rerunning it.

Additional tests cover six live adapter/validation behaviors, saved-run freshness and persona scope, full-page navigation, mobile drawer, and server-only key status. Live adapter tests mock external HTTP; no real paid inference has been tested without a configured key.

Screenshots: `docs/full-page-investigation.png`, `docs/opportunities-workspace.png`, `docs/revenue-dashboard.png`, `docs/deal-investigation.png`, `docs/mobile.png`. Product specification and implementation ledger are in `docs/`.

The 20 scenarios are engineering fixtures rather than a representative market evaluation. Precision/recall, model entailment quality, forecast error reduction, review time and adoption require independently labeled data or real task studies as described in the product specification.
