# DealSignal on a shared VPS

Deployment is prepared, but no server has been ordered or published. The remaining inputs are a VPS with SSH access and a public hostname. The other two apps have not been selected or deployed.

Local verification on 21 October 2026: Next.js updated to 16.4.1 for the [October security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026); production build, packaged-server API checks, five SQLite persistence/backup tests and shell syntax checks passed. The production dependency audit reported no known vulnerabilities. Linux Docker, public HTTPS and persistent-volume checks remain for the real server.

Use Ubuntu 24.04 LTS, x86-64, at least 4 GB RAM, and a public IPv4 address. This is an initial sizing estimate for three small portfolio demos; check actual memory use before adding the next two. Hetzner has been dropped because of its required USD 25 registration prepayment. OVHcloud VPS-1 is being evaluated instead; confirm one-month/no-commitment billing, tax, included options and the full amount due before ordering. The provider-independent Docker setup below remains usable.

## Server setup

OVHcloud quote prepared on 21 October 2026: VPS-1 2027 (2 vCPU, 4 GB RAM, 40 GB disk), Ubuntu 24.04, GRA France, one month with no commitment. The official anonymous-cart summary is INR 504 before tax + INR 90.72 GST = **INR 594.72**, including standard backup after its INR 40 discount. Setup is INR 0. Automatic renewal is disabled in the quote. No account-bound order or payment has been submitted; actual availability and the final account-specific checkout must still be confirmed.

1. Add an SSH public key during VPS creation. Keep the private key on your computer. Allow inbound TCP 22 from your own IP and TCP 80/443 publicly in the provider's firewall. Do not expose port 3000.
2. Install Docker Engine and its Compose plugin using [Docker's official Ubuntu instructions](https://docs.docker.com/engine/install/ubuntu/). Enable the Docker service at boot.
3. Install `unattended-upgrades`, `cron`, `logrotate`, `ufw` and `unzip` from Ubuntu's package repository. Enable automatic security updates with `dpkg-reconfigure -plow unattended-upgrades`. Monitor `/var/run/reboot-required`; package updates do not always eliminate the need for a reboot, and do not update application images.
4. Configure the host firewall before deployment:

   ```bash
   ufw allow OpenSSH
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw --force enable
   systemctl enable --now docker cron
   mkdir -p /opt/dealsignal
   ```

Docker can bypass UFW for published container ports. This stack publishes only Caddy's ports 80/443; the app and its database stay inside Docker. Keep the provider firewall enabled too.

## Source and first launch

Upload the clean deployment archive into `/opt/dealsignal` and extract it there. The archive must contain `app/`, `components/`, `lib/`, `deploy/`, `Dockerfile`, `.dockerignore`, `compose.yaml`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `next.config.ts`, `next-env.d.ts` and `tsconfig.json`. Do not upload `.env`, the local database, `node_modules`, `.next` or the older source archive.

Point the chosen hostname's DNS A record to the VPS. A free DNS hostname is sufficient if no custom domain is available. Do not add an AAAA record unless IPv6 is configured. Then run:

```bash
cd /opt/dealsignal
cp deploy/.env.example deploy/.env
# Edit deploy/.env: SITE_ADDRESS=your-actual-hostname
docker compose --env-file deploy/.env config --quiet
docker compose --env-file deploy/.env up -d --build --wait
docker compose --env-file deploy/.env ps
curl --fail https://your-actual-hostname/api/health
bash deploy/install-maintenance.sh
```

Caddy obtains and renews the HTTPS certificate automatically once DNS and ports 80/443 work. It preserves the Host header for the app's same-origin write checks. [Caddy HTTPS documentation](https://caddyserver.com/docs/automatic-https)

The app runs as an unprivileged user on Node 24, starts with 150 synthetic opportunities, and stores decisions in Docker volume `dealsignal_app_data`. Its container has a 768 MB memory limit; validate this under real traffic. Logs have size limits. There is no password and visitors share demo decisions and resets, as described in the walkthrough.

The container does **not** load the local `.env` or receive an OpenAI key. Confirm `/api/ai/status` returns `configured: false`. The simulated demo is complete without paid AI. Adding live AI later needs a separate decision about usage limits.

## Verify before sharing

- `/api/health` returns HTTP 200 and `{"status":"ok","database":"ready"}`.
- `/guide` opens the six-step walkthrough on desktop and mobile.
- Run `tests/api.mjs` locally with `BASE_URL` set to the HTTPS hostname. This checks same-origin writes, rejected foreign origins, persona scopes and the INR 20 lakh forecast scenario without a paid AI call.
- Record a demo approval, recreate only the app container, and confirm the decision remains. Never use `docker compose down --volumes`; that deletes the database and certificates.
- Check `docker stats --no-stream` and disk usage after launch. Build the next two apps one at a time to reduce peak memory use.

## Monitoring and backups

`install-maintenance.sh` first creates a backup, then installs a health check every minute and a daily backup at 02:15 in the server's timezone. An unhealthy app is restarted after Docker has already failed three health checks. Docker handles normal crashes and reboots through `restart: unless-stopped`.

The backup uses Node's SQLite backup API, includes committed WAL writes, validates integrity, and retains seven completed copies under `/app/data/backups`. It does not copy a live `.db` file without its WAL. The backup and restore behavior has a focused automated test.

These are **on-server** backups. Download a copy off the VPS regularly; losing the VPS would otherwise lose its backups too:

```bash
cd /opt/dealsignal
docker compose --env-file deploy/.env exec -T app node backup.mjs
docker compose --env-file deploy/.env cp app:/app/data/backups ./backup-export
```

Transfer `backup-export` to your computer. Monitor `https://your-actual-hostname/api/health` with an external uptime service and configure your notification address. External monitoring is **not configured yet**. Local restart checks cannot notify you if the whole VPS or its network is down.

Useful diagnostics:

```bash
cd /opt/dealsignal
docker compose --env-file deploy/.env ps
docker compose --env-file deploy/.env logs --tail=100 app proxy
docker stats --no-stream
df -h
tail -n 30 /var/log/dealsignal-maintenance.log
```

## Restore and updates

Before restoring, preserve an extra off-server copy of the current database and backup. Stop the app, replace the database from a verified backup while removing stale WAL/SHM sidecars, preserve UID/GID 1000 ownership, then start the app. Restoring intentionally replaces all decisions made after that backup.

For an app update, create a backup, upload clean source, then run `docker compose --env-file deploy/.env up -d --build --wait`. The named database volume remains. This single-instance setup has brief deployment downtime, but no idle sleeping. Rebuild with updated base images periodically using `build --pull`; automated OS updates do not refresh container images or npm dependencies.

For two additional apps, use separate containers and database volumes, attach them to Caddy's network, and add hostname routes to this single proxy. Only one proxy should bind ports 80/443. Do not start three independent copies of this complete stack without adjusting proxy routing.

## End of the month

Export anything to keep, then delete the VPS and any separately billed IPs, disks or snapshots in the hosting console. Merely stopping the server may not stop billing. No automatic deletion is scheduled.
