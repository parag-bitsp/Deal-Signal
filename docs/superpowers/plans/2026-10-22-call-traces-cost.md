# Call Traces and INR Cost Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the sidebar Demo guide entry with View call traces and cost and provide a read-only saved-run explorer with INR estimates.

**Architecture:** Read the existing SQLite analysis_runs history through scoped GET endpoints. Project only allowlisted fields; retain missing historical request/latency/cache-usage values as unavailable. React renders the saved history, selected run, context and saved output, with a client-only INR rate calculator.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, native SQLite, Lucide and CSS.

**Spec:** User request in this chat and the named Update docs to InsightBridge chat; reference implementation is InsightBridge/delayed_orders/web/run-trace.js. Preserve /guide because the resume Bitly link targets it.

## Global Constraints

- Local implementation and focused testing only; obtain fresh approval before any live deployment. Keep automatic deployment off.
- No paid API requests, new inference, database reset, invented historical calls or unsupported claims of exact original request payloads.
- All monetary totals and editable per-million-token rates use INR. Default published GPT-5 mini prices are converted using an explicitly labeled illustrative INR 90 per USD assumption, not a live exchange quote. Unknown-model or missing-usage costs remain unavailable; partial totals are labeled.
- Preserve cached results, original source hashes and decisions. Scope history and details to the current demo persona.
- Keep DealSignal's navy #18313d, teal #087f6b, pale canvas #f5f8f8, border #dce6e7 and muted #657986; Segoe UI with tabular numbers, left-aligned records and restrained detail panels.

## Review Focus

- Missing usage and unknown model pricing must not appear as free inference.
- Cached input tokens belong within total input and must never be double counted.
- Requests, headers, secrets and arbitrary saved payload fields must not leak through JSON inspectors.
- Older records must be inspectable even when their source context has changed, with that limitation labeled.
- Browser refresh, direct links, empty histories and mobile layouts must work without model calls.

## Task 1: Saved history and INR accounting

- [x] Add focused tests for history, scope, original provenance, missing usage, cached-token accounting, unknown prices and safe projections; observe failure.
- [x] Implement pure projection/calculation helpers, an allowlisted read method on Store, and GET /api/traces plus /api/traces/:id.
- [x] Verify scoped history, read-only operation and cost math with no external model requests.

## Task 2: Sidebar and trace explorer

- [x] Add the /traces view and sidebar entry; retain /guide and existing resume navigation.
- [x] Build searchable history, model filter, recorded-token and INR summaries, saved context/output details, editable INR rates and honest empty/error states.
- [x] Verify navigation, detail selection, rate recalculation, missing data, mobile layout, existing guide and no model requests in a local production build.
- [x] Complete focused review, present the local preview and ask for deployment approval. Do not deploy.

## Verification record

- Focused Node tests: 9/9 passing across call-traces, customer-language and live-store. The initial history test failed before savedAnalysisRuns was implemented.
- Production build, including TypeScript, passed.
- tests/call-traces.mjs passed against the isolated local production preview: scoped history/detail reads, missing-ID 404s, duplicate-call accounting, 4,792 tokens and ₹0.50472 estimate, disabled inference (503), persona transition, selection/refresh, editable rates, search/empty states, /guide and mobile. Browser made no model requests; history remained unchanged.
- Fresh reviewer found no concrete defects in projections, cost math, missing-data handling or generation controls. Review raised conditional scope concern: shared navigation selects Revenue leader.
- Ruling: Retain existing shared-view navigation semantics for /traces, as for /audit and /guide. API reads remain cookie-scoped; navigating from a rep workspace deliberately selects Revenue leader and organization-wide demo history. Loading gates avoid a stale-cookie race; browser check covers this transition. This is a shared synthetic demo, not production role authorization.
- Local preview: http://127.0.0.1:3214/traces using a backup of existing synthetic saved data. No live changes or push. Original local database remains untouched.

## Follow-up changes

- Removed the final three trace sections at user request: INR adjustment controls, context/provenance and saved assessment output. Retained call metadata, token usage, fixed INR estimates and a concise conversion caption.
- Simplified the sidebar organization name to Demo organization.
- Added a home-page Leave feedback form with a required 1–5 star rating, optional text up to 2,000 characters, retry and saved confirmation. A parameterized SQLite insert validates submissions; there is no public feedback read endpoint. Demo reset retains feedback.
- Feedback tests observed failure before implementation, then passed. Focused feedback/store/trace unit tests: 10/10. Production build and both feedback.mjs and updated call-traces.mjs browser checks passed; desktop/mobile screenshots inspected. Feedback smoke submissions use only the isolated preview database.
- Incremental reviewer found no substantive defects; corrected the flagged INR conversion caption. All changes remain local, awaiting fresh deployment approval.
