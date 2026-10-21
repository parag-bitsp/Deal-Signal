# DealSignal Implementation Plan

> Execution: native in this session, authorized by “lets build”. Use executing-plans and focused test-first verification.

Goal: a local, persistent interview-ready MVP implementing the approved specification.
Spec: docs/Product-Specification.html.
Architecture: Next.js TypeScript UI and API, Node built-in SQLite, deterministic demo evidence engine. Optional live inference remains P1.
Ruling: use Node 24 native SQLite instead of Prisma to avoid an extra ORM and migration toolchain in a new portable local demo. SQL schema is versioned in the storage module.
Ruling: this is the newly created, isolated project directory; no pre-existing repository or shared branch is being edited. Do not create or push a repository.

## Global constraints
- 20 reps, four managers, 150 opportunities; integer INR; fixed as-of 20 October 2026.
- Synthetic records only; source-linked findings; no outbound sending; approvals persistent; scenario never mutates baseline.
- Distinguish Contradicted from Unverified; simulated provider visibly labeled.

## Review focus
- No Commit in scope → N/A coverage.
- Stale or duplicate approvals → conflict or idempotent result.
- Missing evidence → explicit gap, no invented source.
- Rep/team filters → consistent totals and deal list.
- Scenario overrides → reject duplicates/invalid categories and preserve baseline.

## Task 1: domain and seed
Files: lib/types.ts, lib/seed.ts, lib/engine.ts; tests/domain.test.ts.
Interfaces: createSeed() -> Dataset; analyze(deal, asOf?) -> Analysis; summarize(deals) -> Summary; simulate(deals, overrides) -> {baseline,scenario,delta}.
- [x] Write tests for counts, reference integrity, anchor classifications, inactivity boundary, forecast delta, missing-evidence scope, zero denominator, invalid overrides.
- [x] Run node --experimental-strip-types --test tests/domain.test.ts and confirm missing behavior.
- [x] Implement deterministic sources, histories, 20 scenarios, engine and aggregates; rerun tests.

## Task 2: storage and API
Files: lib/store.ts, app/api/[...path]/route.ts; tests/store.test.ts.
Interfaces: readDataset(); decideAction(input); completeAction(input); resetDemo(); getAudit().
- [x] Test approval persistence across reopen, idempotency, stale versions, reject/complete transitions, audit append, reset.
- [x] Implement SQLite tables and transactions, validated API scopes and requests; run tests.

## Task 3: application
Files: app/layout.tsx, app/page.tsx, app/globals.css; components/workspace.tsx, components/charts.tsx, components/deal-panel.tsx.
- [x] Write browser journey checks for dashboard → Aster evidence → edit/approve → simulate ₹20 lakh → baseline unchanged and reload persistence.
- [x] Build revenue, rep, manager, opportunity, brief, actions and evidence views; filter URL state, source drawer, action dialog and simulation.
- [x] Run typecheck/build, central browser journey, mobile layout and console checks.

## Task 4: handoff
Files: README.md, demo guide and portable source zip in outputs.
- [x] Fresh review; address material findings; verify targeted changes.
- [x] Record actual verification and limitations, open working local preview, package source without node_modules/runtime data.

