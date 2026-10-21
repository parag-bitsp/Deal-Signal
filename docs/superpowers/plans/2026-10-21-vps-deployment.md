# DealSignal VPS Deployment Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan in this session.

**Goal:** Publish the existing no-password demo on a shared, always-on VPS.

**Architecture:** One Node 24 container with a persistent SQLite volume, behind Caddy for HTTPS. The reverse proxy can later route two more apps on the same VPS. Start with seeded synthetic data and no OpenAI credentials.

**Tech Stack:** Next.js 16, Node 24, Docker Compose, Caddy 2, Ubuntu 24.04 LTS.

**Spec:** The user's earlier “Deploy app free for one month” conversation: shared VPS for three demos, no idle sleep, no password, preserve DealSignal branding and the hiring-manager walkthrough.

## Global Constraints

- No paid AI calls or credentials included in the public deployment.
- Keep the existing local SQLite data and local preview settings usable.
- No server purchase until provider, available instance and price are established.
- Work in this project directory; it has no Git repository or worktree.

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

- [ ] Obtain the provider/account or existing VPS and SSH access from the user.
- [ ] Confirm the available instance and recurring price before ordering.
- [ ] Install Docker, automatic security updates and a firewall; upload only clean source.
- [ ] Start the app and verify public HTTPS, walkthrough, same-origin writes and persistence across recreation.
- [ ] Configure external uptime monitoring once the public URL and notification destination are available.

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
