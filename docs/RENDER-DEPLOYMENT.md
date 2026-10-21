# DealSignal on paid Render hosting

Render is the selected provider. OVHcloud identity verification is pending and that deployment is abandoned. No Render service has been created yet.

The existing free Hobby workspace can run a paid **Starter web service**. Paid compute does not sleep when idle. The initial budget is **USD 7/month compute + USD 0.25/month for a 1 GB disk**, before tax and any usage overages. Do not upgrade the workspace to Pro merely to prevent sleeping. Each additional app needs its own service and, if needed, disk.

Sources: [paid services stay awake](https://render.com/docs/faq), [workspace plans](https://render.com/docs/platform-features-by-plan), [pricing](https://render.com/pricing).

## Deploy

1. Put the source in a private GitHub repository. Never include `.env*` credentials, local SQLite files, `.cache`, `.next`, `node_modules`, source archives or the SSH private key.
2. Connect the repository to Render and create a Blueprint using root `render.yaml`. It selects exactly one paid Starter web service in Singapore with a 1 GB persistent disk. Review the service and disk cost shown by Render before creation.
3. Add your payment method directly in Render if the account does not already have one.
4. Wait for the first build and the `/api/health` check to pass. Render provides an HTTPS `onrender.com` URL automatically; no domain purchase or Caddy setup is needed.

The native Node runtime is pinned to 24.21.0 in `.node-version`. The build explicitly installs development dependencies even in production mode, then produces the standalone Next.js server and copies its browser assets. Only the running server gets the 384 MB V8 heap cap, leaving room within Starter's 512 MB RAM for other memory. Actual memory use must be checked after deployment.

`PIPELINE_DB=/var/data/pipeline.db` points to the persistent disk. Decisions and saved results should survive redeploys; verify this on the real service. The local development database is not uploaded, so the public demo starts with the synthetic seed.

The public configuration explicitly leaves `OPENAI_API_KEY` empty. The walkthrough needs no API key or password. Visitors share the synthetic demo state. Live paid AI is not enabled.

Automatic deployments are off initially. Subsequent changes are deployed deliberately after verification.

## Verify and maintain

- Confirm the selected plan is **Starter**, not Free, and the disk is attached at `/var/data`.
- Check `/api/health`, `/api/ai/status` (`configured: false`), `/guide`, navigation and the forecast scenario. Run `tests/api.mjs` with `BASE_URL` set to the public HTTPS URL.
- Record a synthetic approval, redeploy once, and confirm it remains. Watch memory in Render's Metrics page before increasing traffic or enabling live AI.
- Render manages HTTPS, health monitoring and restarts. It takes disk snapshots, but keep SQLite-consistent exports too: run `node deploy/backup.mjs` from the Render Shell, then download the generated database backup. This script includes committed WAL writes and verifies integrity. The VPS cron scripts are not used on Render.
- A disk-backed service can have brief downtime during deployments. Paid hosting prevents idle sleep; it does not promise uninterrupted availability.
- At the end of the month, export anything to keep and delete the paid service and disk. No automatic deletion is scheduled.

[Render persistent disk documentation](https://render.com/docs/disks) · [Blueprint specification](https://render.com/docs/blueprint-spec)
