# DealSignal VPS Deployment Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in this session.

**Goal:** Publish the existing no-password demo on a shared, always-on VPS.

**Current target (supersedes the VPS architecture below):** Paid Render Starter web service with a 1 GB persistent disk, using the existing Hobby workspace. No idle sleep. The VPS notes below record earlier preparation and provider changes.

**Current status:** Live at https://dealsignal-48tc.onrender.com with walkthrough at `/guide`. Starter compute and the 1 GB persistent disk were created on 21 October 2026. Hosted API checks and persistence across redeployment passed. The user subsequently authorized server-side OpenAI credentials and publicly accessible paid analyses; one validated Aster live analysis is saved. Source is `https://github.com/parag-bitsp/Deal-Signal`. Automatic deployments are off.

**Architecture:** One Node 24 container with a persistent SQLite volume, behind Caddy for HTTPS. The reverse proxy can later route two more apps on the same VPS. Start with seeded synthetic data and no OpenAI credentials.

**Tech Stack:** Next.js 16, Node 24, Docker Compose, Caddy 2, Ubuntu 24.04 LTS.

**Spec:** The user's earlier “Deploy app free for one month” conversation: shared VPS for three demos, no idle sleep, no password, preserve DealSignal branding and the hiring-manager walkthrough.

## Global Constraints

- Never include credentials in source or browser responses. The initial deployment had AI disabled; the user subsequently explicitly authorized a server-only OpenAI key and billed public analyses.
- Keep the existing local SQLite data and local preview settings usable.
- No server purchase until provider, available instance and price are established.
- Work in this project directory; Git was initialized during deployment preparation.

## Review Focus

- Container replacement must retain SQLite decisions.
- HTTPS proxy must preserve Host so same-origin API writes work.
- Health checks must verify SQLite, not only return an HTML page.
- Source packaging must exclude .env, databases, dependencies and generated builds.
- Backups must include committed WAL writes and must be restorable.

### Task 1: Prepare the deployment

**Files:** `Dockerfile`, `.dockerignore`, `compose.yaml`, `deploy/Caddyfile`, `deploy/.env.example`, `next.config.ts`, `package.json`, `app/api/health/route.ts`.

- [x] Enable standalone output, pin Node 24+, and expose the production process on 0.0.0.0.
- [x] Add a non-root container, persistent database volume, proxy, health checks and bounded logs.
- [x] Verify a production build and the existing API checks against a temporary database; confirm public mode has no configured AI key.

### Task 2: Prepare operations

**Files:** `deploy/backup.mjs`, `deploy/maintenance.sh`, `deploy/install-maintenance.sh`, `tests/backup.test.ts`, `docs/VPS-DEPLOYMENT.md`.

- [x] Prove that a backup includes WAL data and can be reopened.
- [x] Add seven-backup retention, automatic unhealthy-container recovery and daily backups.
- [x] Document Ubuntu setup, HTTPS, resource monitoring, restore, off-server export and end-of-month deletion.

### Task 3: Publish and verify

- [x] Obtain authorized access to the selected Render workspace.
- [x] Establish Starter compute plus a 1 GB disk at approximately USD 7.25/month before tax/usage; the user added the payment method directly to Render.
- [x] Upload clean source and create one managed Node service with its persistent disk. Render manages HTTPS and runtime hosting; VPS setup is superseded.
- [x] Verify public HTTPS, walkthrough assets, same-origin writes, cross-origin rejection, disabled paid AI and persistence across a real redeploy.
- Render's database-aware health checks are active. A separate external uptime monitor is not configured.

## Progress

- Earlier conversation recovered; VPS is the selected hosting approach.
- Hosting account/server details requested; server actions await that answer.
- Docker is not installed locally, so the Linux container build must be verified on the VPS.
- Ruling: update Next.js to 16.4.1 before public deployment, following the vendor's October 14 security advisory. The framework change warrants production API verification.
- Ruling: the folder rename left dependency metadata pointing at pipeline_truth and a different pnpm store version. Preserve those dependencies in .cache and reinstall from the updated lockfile in this folder.
- Verification: Next.js 16.4.1 production build passed, including TypeScript. The packaged standalone server passed `tests/api.mjs`, database health, guide HTML/JavaScript asset checks and `configured: false` for AI. No paid AI requests were made.
- Verification: `tests/store.test.ts` passed 3/3; `tests/backup.test.ts` passed 2/2; Bash syntax checks passed for both maintenance scripts. npm advisory audit via `pnpm audit --prod --audit-level high` returned no known vulnerabilities.
- Review: a fresh deployment reviewer found no Important/Critical defects. Linux Docker/Compose runtime, actual HTTPS and named-volume recreation checks still require a VPS.
- Packaging: `.cache/DealSignal-vps.zip` contains 36 source/config entries; checked for absence of credentials, local data, dependencies and builds.
- User confirmed they will sign in and pay. Official Hetzner registration and billing information verified; waiting for account activation. Browser control is unavailable in this session. No purchase or remote deployment has occurred.
- Account activation confirmed by the user. Browser inventory still has no enabled browsers, and plugin discovery found no Hetzner connector. A project-scoped Read & Write token in local `.env.hetzner` is the next access step; this file is ignored by Git, excluded from Docker/source packaging and restricted to the user's Windows identity and SYSTEM. No server has been ordered.
- Hetzner abandoned at the user's request because registration requires a USD 25 prepayment. The local Hetzner token file is still blank; do not request or use a Hetzner token. Retain the provider-independent Docker deployment and select an alternative after verifying one-month billing and the actual initial payment.
- Alternative checked on 21 October: OVHcloud India's public VPS catalog (`https://ca.api.ovh.com/1.0/order/catalog/public/vps?ovhSubsidiary=IN`) lists VPS-1 2027 with no commitment, one-month default pricing INR 504 before GST and INR 0 setup. Its required standard backup addon lists INR 40/month; Linux and local storage addons list INR 0. Budget INR 641.92 including catalog GST for the base plus backup, subject to the actual checkout quote and any provider adjustments. The advertised INR 420/month link selects 12-month prepayment and must not be used for the one-month order. No OVH account, cart or order has been created.
- User authorized proceeding with OVHcloud. Created an anonymous quote cart through the official API, not an account-bound or billable order. Selected VPS-1 2027, P1M/default monthly pricing, one unit, Ubuntu 24.04, GRA France, required Linux/local-storage/standard-backup options, AUTO_RENEW_VPS=false. The cart summary applies a full INR 40 standard-backup discount: INR 504 base + INR 90.72 GST = INR 594.72 total. Summary and cart state are in `.cache/ovh-quote-summary.json` and `.cache/ovh-cart*.json`. Actual stock/fulfillment and account-specific checkout still need confirmation; no payment or order submission occurred.
- Generated a dedicated Ed25519 SSH deployment key in `.cache/vps-access/portfolio_ed25519`; the containing folder is restricted to the Windows user and SYSTEM. Do not print or upload the private key. Public fingerprint SHA256:JFYiV5eS0Nf74FKWzuSojpvjQu3odUyrchL/qxhiafg. Awaiting the user's OVHcloud account activation; browser control and an OVHcloud connector are unavailable.
- Provider read-back verified all three quote settings (GRA, Ubuntu 24.04, AUTO_RENEW_VPS=false). The configuration list API returns IDs, so individual configuration records were fetched; a PowerShell timeout was resolved by a successful parallel Node fetch. Evidence: `.cache/ovh-quote-configuration-details.json`. Total remains INR 594.72; no order or payment submitted.
- OVHcloud abandoned while identity verification is pending. User explicitly selected paid Render hosting and reiterated no idle sleeping. Their existing free Render account/workspace will be retained; the service itself must use paid Starter compute and a 1 GB persistent disk. Added native Node `render.yaml`, `.node-version`, and `docs/RENDER-DEPLOYMENT.md`; VPS-specific Caddy, SSH and cron setup is no longer part of the active deployment.
- Render and GitHub integrations were found and suggested for installation/connection; neither connection is confirmed yet. No paid Render resource has been created. The source is not yet in Git, and there is no GitHub CLI/auth available locally.
- Render preparation verified: `render.yaml` passed Render's published 2020-12 JSON schema via ajv-cli. The existing standalone artifact passed `tests/api.mjs`, guide and disabled-AI checks on port 3212 with the configured 384 MB V8 heap cap; measured local working set after those checks was 95.1 MB. A focused deployment reviewer found no Important/Critical defects. No new application code or broad regression run was needed for these configuration changes.
- Initialized a local `main` Git repository and staged 76 source/documentation files, explicitly checking that credentials, local databases, private keys, dependencies, build artifacts and archives are excluded. No commit, remote repository, paid Render service or disk has been created. Render/GitHub connections are the remaining access dependency, followed by real hosted health and persistence verification.
- Continued via local tooling because the suggested integrations remain uninstalled. Git Credential Manager already authenticates GitHub user `parag-bitsp`. Verified that account, checked staged source for credential patterns, created private `https://github.com/parag-bitsp/dealsignal`, committed `4d9ef8d`, and successfully pushed `main`. Credentials were used only in-process against GitHub and were not printed or saved into source. Existing Windows CRLF/trailing-blank formatting was left alone after an initial whitespace-only check flagged it.
- Downloaded official Render CLI v2.30.0 from `render-oss/cli` and verified SHA-256 `8a2fa10a5b263fce90666a39e604ab71f9b31686356de3ae4ce61cfaad7771c1`. CLI authentication state will live in restricted `.cache/render-cli-auth` (Windows user and SYSTEM only). Browser-based device authorization is pending in running exec session 1198. The user has been sent the Render device authorization link. Do not print the saved CLI token.
- Render's public OpenAPI specification confirms service creation accepts an atomic `serviceDetails.disk` configuration. The disk can therefore be attached during initial paid service creation. Spec cached in `.cache/render-openapi.json`. No Render service/disk or charge has been created yet; account authorization is the current dependency.
- User completed Render CLI device authorization. Verified Render user `usr-db05ubvavr4c73e9jva0` and selected their existing `My Workspace` (`tea-db05ubvavr4c73e9jv4g`). Existing `twin` service is Free in Oregon and was not changed.
- Attempted atomic creation of DealSignal Starter compute with a 1 GB `/var/data` disk in Singapore. Render returned HTTP 400: repository URL invalid or unfetchable. No DealSignal resource was created. The private GitHub repository exists and was pushed successfully; Render repository access is the remaining dependency. User was sent the official Render GitHub App installation/configuration link to add only `dealsignal` while keeping existing selections. Existing GCM credentials cannot list GitHub App installations (HTTP 403), so this one repository-selection action requires the user's GitHub session.
- User created public `https://github.com/parag-bitsp/Deal-Signal` and asked to upload the project there. Verified the target had no refs, rechecked tracked source for credential patterns, added remote `public`, and pushed all 76 tracked files at `4d9ef8d351147da38368d645a9302ceb322ef368` to `main`. Verified the remote branch matches. The earlier private `dealsignal` repository remains as `origin`; no existing repository contents were overwritten.
- Retried the authorized Render service creation using the new public `Deal-Signal` repository, after confirming no existing DealSignal service. Repository validation now succeeds, but Render returned HTTP 402: payment information required, with official billing URL `https://dashboard.render.com/billing`. No DealSignal service or disk was created. User was asked to add a payment method directly to Render, keeping the free Hobby workspace and the selected Starter + 1 GB disk configuration (approximately USD 7.25/month before tax/usage). Waiting for that payment-method step before creating the paid resource.
- User confirmed the payment method was saved. Created paid service `srv-dbcbc9cs728c73ejqc0g` and 1 GB disk `dsk-dbcbc9ks728c73ejqcrg` atomically in Singapore. Initial deployment `dep-dbcbcass728c73ejqikg` reached `live` on commit `4d9ef8d351147da38368d645a9302ceb322ef368`, using Node 24.21.0. URL: `https://dealsignal-48tc.onrender.com`. The existing `twin` service was untouched.
- Hosted verification passed: `tests/api.mjs`, HTTPS database health, 150 synthetic deals, guide HTML/JavaScript and AI `configured: false`. Saved a synthetic approval and audit, redeployed the existing build via `deploy_only` (`dep-dbcbddrncjis738vg8ig`), verified the record survived, then reset only after confirming there was exactly that one test action and one audit entry. The public demo is back to its fresh 150-deal state.
- Render memory metrics during the smoke check ranged from 59,375,616 to 75,821,060 bytes, below the 512 MB service limit. Read back Starter plan, `/var/data` disk mount, source repository and disabled autodeploy. This is not a load test. Billing continues until the paid service and disk are deleted; no automatic end-of-month deletion is scheduled.
- User reported the demo script page did not open a screen. Reproduced the full hosted guide workflow using `tests/demo-guide.mjs`: discovery, all six contextual links, source dialog, close-date history, follow-up review, scenario, decision trail, progress, mobile layout and reopen all passed. No application defect was reproduced; requested the failing page URL/button text. Generated screenshot differences were restored. No speculative application change was made.
- User asked to enable the API. Automatic review initially required explicit authorization for transmitting the local OpenAI key and public billable use. The user expressly approved both. Configured OPENAI_API_KEY, OPENAI_MODEL=gpt-5-mini, timeout and output limit directly in Render's server environment without logging or saving credential values. Deploy `dep-dbcbkalg1s2s739mcdk0` reached live.
- Made exactly one paid hosted analysis request for opp-001. It completed with 3 validated claims, model gpt-5-mini-2025-08-07 and 2,777 total tokens. The first verification script read the baseline-only opportunity endpoint and was corrected to read saved liveAnalyses from /api/data; the follow-up verification was read-only and did not repeat the paid request. Confirmed the saved result in the browser and that Run live analysis again is enabled. /api/ai/status returns only configured and model.
- Changed the Blueprint secret to sync:false, added the selected model and updated public deployment docs. The Blueprint passed Render's published JSON schema. Actual service environment was already configured and deployed directly; automatic source deployments remain off.
