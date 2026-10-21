# DealSignal

A local sales pipeline intelligence MVP for a fictional Indian B2B SaaS company. Every customer interaction is synthetic. All money is INR.

## Start on this computer

Double-click `Start-DealSignal.cmd`, or run:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-DealSignal.ps1
```

Open http://127.0.0.1:3000. The launcher uses an installed Node executable or the bundled Codex Node runtime. Node **24 or newer** is required for the native SQLite API used here. Keep the terminal open while using the app; Ctrl+C stops it.

## Live OpenAI analysis

The project root has a local `.env` file. Add your key there, save, and restart the server:

```dotenv
OPENAI_API_KEY="your-key-here"
OPENAI_MODEL="gpt-5-mini"
OPENAI_TIMEOUT_MS=90000
OPENAI_MAX_OUTPUT_TOKENS=6000
```

Keep `.env` private. It is ignored by Git and excluded from the source archive. `.env.example` is safe to share. No credential uses a `NEXT_PUBLIC_` variable; the browser receives only a configured boolean and model name.

Open an opportunity and click **Run live analysis**. This makes one paid OpenAI request for that deal. It reads raw source text and stakeholder roles without synthetic extraction labels or golden answers, then returns claim statuses, exact source quotes, a summary and a suggested follow-up. No email or CRM update happens. The default model is configurable and account access may vary.

Validated results, prompt version, source-input hash, generation time, model and token counts are saved in SQLite. Saved claims feed current dashboard totals, review briefs and forecast scenarios. Deals without a saved live run continue to show simulated analysis. Historical charts remain based on dated synthetic records, not today's LLM opinions. Source changes invalidate saved live runs. Provider errors are explicit and do not silently fall back to simulation.

The adapter uses the [OpenAI Responses API with Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). Quote existence, deal membership, authority and freshness are checked locally. A conservative scope check also requires explicit purchase-decision language for purchase authorization, and transparently preserves the raw model label when downgrading an insufficiently scoped citation. These checks establish provenance; they do not independently prove that a model's interpretation is correct.

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

Hiring managers can open **Demo guide** in the sidebar, or **Read the demo script** on Revenue intelligence. The six-step script includes links and expected results. **Start guided demo** opens a companion panel that remembers the current step in the browser tab as the reader navigates. No login, API key, or live AI call is required. Visitors share saved decisions; the guide explains how to inspect an existing approval without resetting the dataset.

1. Open **Revenue intelligence**. The unsupported Commit KPI measures the gap between rep-reported Commit and complete buyer support.
2. Investigate **Aster Manufacturing**, the first opportunity, valued at **₹20 lakh**.
3. Inspect the budget source: the rep asserts approval, but the buyer explicitly says finance approval is pending. Economic-buyer approval is separately **Unverified**.
4. Inspect two close-date pushes. Review and edit the proposed approval-alignment follow-up. **Record demo approval** saves the decision; no message is sent.
5. **Simulate reclassification** to Best Case. Simulated Commit decreases by exactly ₹20 lakh. The baseline remains Commit.
6. Reload to demonstrate persistence. Visit **Team workspace** and **Decision trail** to inspect the intervention. Completion preserves the approved text.
7. Open the weekly review brief and download it. Use **Reset demo data** to restore the original 150 deals and clear decisions.

## Included

- Three interconnected workspaces, account investigation, activity timeline, close-date history and source inspection.
- 150 opportunities, 20 reps, four managers, stakeholders, source records, dated category/stage histories and 20 deliberate scenarios.
- Buyer inactivity, missing next steps, zombie candidates, repeated slippage, commitment verification and procurement timeline checks.
- Human-reviewed interventions, persistent audit history and a forecast sandbox.
- Search, pagination, period/team/rep/risk/category filters, scoped review brief and data-derived charts.
- Responsive layouts and keyboard focus support.

## Architecture

Next.js 16 / React 19 / TypeScript; Node native SQLite; Lucide icons; plain CSS and accessible SVG charts. `lib/seed.ts` generates deterministic connected records. `lib/engine.ts` contains pure classification and aggregate functions. `lib/store.ts` manages SQLite transactions. `lib/scope.ts` scopes persona reads. `app/api/[...path]/route.ts` validates requests. UI lives in `components/`.

The approved proposal suggested Prisma, Tailwind and Recharts. The implementation uses native SQLite, CSS and SVG instead to reduce setup and dependencies. SQLite is stored at `data/pipeline.db` (override with `PIPELINE_DB`). The database is created and seeded automatically on first read. Demo evaluation time is fixed at **20 October 2026**; human decision timestamps use actual wall time and display in IST.

## Analysis and forecast policy

Deals initially use **simulated structured extraction**. An explicit per-deal live run replaces that deal's current claim analysis with validated OpenAI output. Buyer-record annotations represent extracted commitments, and deterministic logic evaluates authority, date, exact quote existence and explicit contradictions. All outputs carry a visible simulated label. The injection scenario is inert record text.

- Buyer inactivity: at least 21 calendar days without meaningful inbound activity or a completed buyer meeting.
- Zombie candidate: inactivity plus a missing or overdue dated next step.
- Repeated slippage: two or more later close-date changes in the past 90 days.
- Verified: current explicit authorized buyer confirmation. Contradicted: explicit conflicting buyer statement. Unverified: missing, stale, unauthorized, or unresolved conflicting evidence.
- Evidence older than 30 days requires reconfirmation.
- Supported Commit: all three commitments verified and no blocking procurement timeline. This is evidence completeness, **not win probability**.
- Confidence labels are synthetic extraction judgments, not calibrated probabilities.
- Snapshot charts reconstruct dated forecast category and evidence available at each point for the currently selected cohort.

No API key is needed for the simulated demo. Live analysis is opt-in and uses your API credits only when you click its button. The server adapter includes structured output, quote/authority/freshness validation, input hashes, versioned persisted runs, timeout handling and provider labeling. There is no autonomous tool execution, external send or CRM update capability.

## Scope and limitations

Workspace navigation selects an explicit demo persona. Revenue intelligence reads the organization; managers read their team; reps read their opportunities. The API enforces those scopes on detail, analysis, simulation and associated audit records. Persona selection is deliberately user-controlled for demonstrations; **it is not production authentication or tenant isolation**. Each browser has one active demo persona; use separate browser contexts for concurrent personas.

This is a synthetic portfolio demo. Do not put real customer data in it. Paid, always-on Render hosting is configured in [the Render deployment guide](docs/RENDER-DEPLOYMENT.md), using persistent SQLite storage and managed HTTPS. No hosted service has been created yet. The public deployment starts without OpenAI credentials. An alternative [VPS guide](docs/VPS-DEPLOYMENT.md) is retained for reference. Production rollout would need real authentication, tenant isolation, ingestion/retention policies and representative evaluation. Deterministic measurements are computed from persisted sources; live model analysis runs are stored with provenance. No real forecast improvement, review-time savings or revenue recovery is claimed.

## Tests and evidence

- `tests/domain.test.ts`: dataset integrity, anchor statuses, simulation baseline preservation, zero denominators, inactivity boundary, evidence gaps, scenarios, procurement exclusion, exact quote validation and historical category reconstruction.
- `tests/store.test.ts`: SQLite reopen persistence, idempotency, stale versions, ownership, approval/completion transitions, immutable approved text, audit and reset.
- `tests/scope.test.ts`: consistent opportunity/action/audit persona scope.
- `tests/api.mjs`: run against a local server; verifies same-origin writes, rejected foreign origins, persona scopes and baseline-isolated scenarios.
- `tests/journey.mjs`: local browser journey including source inspection, editable approval, reload, ₹20 lakh scenario, preserved filters, navigation and 390px layout. Requires Playwright; configure `PLAYWRIGHT_PATH` and `BROWSER_EXE` for another machine. This test changes demo decisions; reset before rerunning it.

Additional tests cover six live adapter/validation behaviors, saved-run freshness and persona scope, full-page navigation, mobile drawer, and server-only key status. Live adapter tests mock external HTTP; no real paid inference has been tested without a configured key.

Screenshots: `docs/full-page-investigation.png`, `docs/opportunities-workspace.png`, `docs/revenue-dashboard.png`, `docs/deal-investigation.png`, `docs/mobile.png`. Product specification and implementation ledger are in `docs/`.

The 20 scenarios are engineering fixtures rather than a representative market evaluation. Precision/recall, model entailment quality, forecast error reduction, review time and adoption require independently labeled data or real task studies as described in the product specification.
