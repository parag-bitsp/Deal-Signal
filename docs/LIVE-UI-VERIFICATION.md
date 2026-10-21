# Live analysis and full-page UI verification

Verified 20 October 2026.

- 22 domain, storage, scope and live-adapter tests passed. Live-adapter tests mock external HTTP; they do not call OpenAI.
- Production build and TypeScript checks passed before final review; final review's request-state fix is rechecked in the final build.
- Browser checks passed for semantic sidebar links, the Opportunities route, full-page investigation, back link, browser Back, mobile drawer/expanded state, Escape/focus handling and document-width overflow.
- Browser checks passed for budget-source inspection, editable approvals, reload persistence, a ₹20 lakh forecast scenario and preserved search/KPI filters.
- Server API checks passed for origin validation, persona scope, summary reconciliation and unchanged scenario baseline.
- Missing-key checks passed: the status API returns only configuration/model metadata; live requests return an actionable configuration error, and the live button is disabled without a key.
- A mocked model response rendered a live summary and a generated reviewable draft. Pending inference disables follow-up review; a late result cannot replace an approved draft.
- Saved live runs include model, timestamps, source-input hash, prompt version and token counts. Changed input invalidates a saved result; persona scoping excludes other reps' results.
- After the user configured the key, two real OpenAI Responses requests completed successfully using gpt-5-mini-2025-08-07 (2,259 and 2,533 tokens). Both responses are persisted. The model overgeneralized a finance-status statement to the separate economic-purchase authorization claim. A visible conservative purchase-scope check now marks that separate claim Unverified while preserving the raw model status and rationale. The saved second response was revalidated locally without a third paid request. The final anchor shows budget Contradicted, purchase approval Unverified, and timeline Unverified.

The app's layout uses the whole browser viewport. Embedded browsers may refuse the Fullscreen API; the header offers a Full screen control, and a normal Chrome/Edge window can use F11. Standalone Chrome could not be opened through the available browser connector on this host.

`.env` stays server-side, is ignored by Git and is excluded from source packaging. `.env.example` is safe to share. Test browser decisions were made against the separate `data/verification-ui.db`, preserving the user's primary demo database.
