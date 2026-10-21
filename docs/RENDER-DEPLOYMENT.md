# DealSignal on paid Render hosting

The [live demo](https://dealsignal-48tc.onrender.com) and [guided walkthrough](https://dealsignal-48tc.onrender.com/guide) run on Render. The service was created on 21 October 2026 using Starter compute in Singapore with one 1 GB persistent disk mounted at `/var/data`.

Source: [parag-bitsp/Deal-Signal](https://github.com/parag-bitsp/Deal-Signal). Management: [Render service dashboard](https://dashboard.render.com/web/srv-dbcbc9cs728c73ejqc0g). Automatic deployments are off. The earlier private `dealsignal` repository is retained separately; the deployed service uses `Deal-Signal`.

The existing free Hobby workspace can run a paid **Starter web service**. Paid compute does not sleep when idle. The initial budget is **USD 7/month compute + USD 0.25/month for a 1 GB disk**, before tax and any usage overages. Do not upgrade the workspace to Pro merely to prevent sleeping. Each additional app needs its own service and, if needed, disk.

Sources: [paid services stay awake](https://render.com/docs/faq), [workspace plans](https://render.com/docs/platform-features-by-plan), [pricing](https://render.com/pricing).

## Deploy

1. Push source changes to `parag-bitsp/Deal-Signal`. This repository is public. Never include `.env*` credentials, local SQLite files, `.cache`, `.next`, `node_modules`, source archives or the SSH private key.
2. For a new installation, use root `render.yaml` to create exactly one paid Starter web service in Singapore with a 1 GB persistent disk. The existing service was created through Render's API with the equivalent configuration; do not create a duplicate Blueprint for it. Review the service and disk cost before creating another installation.
3. Add your payment method directly in Render if the account does not already have one.
4. Wait for the first build and the `/api/health` check to pass. Render provides an HTTPS `onrender.com` URL automatically; no domain purchase or Caddy setup is needed.

The native Node runtime is pinned to 24.21.0 in `.node-version`. The build explicitly installs development dependencies even in production mode, then produces the standalone Next.js server and copies its browser assets. Only the running server gets the 384 MB V8 heap cap, leaving room within Starter's 512 MB RAM for other memory. Actual memory use must be checked after deployment.

`PIPELINE_DB=/var/data/pipeline.db` points to the persistent disk. Decisions and saved results should survive redeploys; verify this on the real service. The local development database is not uploaded, so the public demo starts with the synthetic seed.

Public live AI is disabled at the owner's request. The hosted `OPENAI_API_KEY` was removed and the Blueprint defaults it to an empty value. The app refuses live OpenAI analysis before contacting the provider, so visitors cannot spend OpenAI credits through this demo. The sole saved deployment-test AI result was removed after verifying there were no visitor decisions or audit entries. The walkthrough uses synthetic records and simulated analysis and needs no visitor API key or password. Visitors share synthetic demo decisions. Local live-analysis credentials were not changed.

Automatic deployments are off initially. Subsequent changes are deployed deliberately after verification.

Verified on 21 October 2026: Render's production build completed; public HTTPS, SQLite health, browser-origin writes, foreign-origin rejection, scoped API data, the guide and its JavaScript passed. A synthetic approval and audit entry survived a redeploy of the existing build, then the sole test approval was removed. Render reported memory usage below 76 MB during these checks; this is a smoke check, not a load test. After live AI was enabled, one Aster Manufacturing analysis completed with three validated claims and 2,777 total tokens and was saved. The guide's six browser navigation steps, mobile layout, progress and source inspection also passed without additional paid requests.

## Verify and maintain

- Confirm the selected plan is **Starter**, not Free, and the disk is attached at `/var/data`.
- Check `/api/health`, `/api/ai/status` (`configured: false`), `/guide`, navigation and the forecast scenario. A request to `/api/analyze` with `provider: openai` must fail with HTTP 503 without contacting OpenAI. Synthetic analysis must still work. Run `tests/api.mjs` with `BASE_URL` set to the public HTTPS URL.
- Record a synthetic approval, redeploy once, and confirm it remains. Watch memory in Render's Metrics page before increasing traffic or enabling live AI.
- Render manages HTTPS, health monitoring and restarts. It takes disk snapshots, but keep SQLite-consistent exports too: run `node deploy/backup.mjs` from the Render Shell, then download the generated database backup. This script includes committed WAL writes and verifies integrity. The VPS cron scripts are not used on Render.
- A disk-backed service can have brief downtime during deployments. Paid hosting prevents idle sleep; it does not promise uninterrupted availability.
- At the end of the month, export anything to keep and delete the paid service and disk. No automatic deletion is scheduled.

[Render persistent disk documentation](https://render.com/docs/disks) · [Blueprint specification](https://render.com/docs/blueprint-spec)
