# Live OpenAI analysis

Authorized by the user's request for a .env file and live LLM results.

- Add blank, ignored `.env` and reusable `.env.example`. Keep credentials server-only.
- Use the OpenAI Responses API with strict JSON Schema, one user-triggered request per deal, no automatic batch analysis or paid test calls.
- Retrieve raw source text and stakeholders; omit synthetic extraction annotations and golden labels. Preserve deterministic activity and date calculations.
- Validate complete claim coverage, exact quote/deal/source membership, authority and freshness before accepting claims. Surface refusal, malformed output, missing configuration and provider failure explicitly.
- Persist validated runs with model, input hash, prompt version, timestamps and token usage. Reuse stored results after reload and invalidate when source input changes.
- Show live results, source quotes, explanation and follow-up draft in the investigation; use validated live claims consistently in scoped summaries and simulations. Historical charts remain reconstructed from timestamped demo records.
- Test request/response and validation with a mocked external HTTP boundary, persistence and scoped reads. Run type/build and a browser check for missing-key behavior; real inference waits for the user's key.

API references: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses and https://developers.openai.com/api/docs/models/gpt-5-mini
