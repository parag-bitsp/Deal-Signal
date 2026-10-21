#!/usr/bin/env bash
# Run as root after the first successful deployment in /opt/dealsignal.
set -euo pipefail
cd /opt/dealsignal
docker compose --env-file deploy/.env exec -T app node backup.mjs
install -m 0755 deploy/maintenance.sh /usr/local/sbin/dealsignal-maintenance
cat > /etc/cron.d/dealsignal <<'CRON'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
* * * * * root flock -n /run/dealsignal-health.lock /usr/local/sbin/dealsignal-maintenance health >> /var/log/dealsignal-maintenance.log 2>&1
15 2 * * * root flock -n /run/dealsignal-backup.lock /usr/local/sbin/dealsignal-maintenance backup >> /var/log/dealsignal-maintenance.log 2>&1
CRON
chmod 0644 /etc/cron.d/dealsignal
cat > /etc/logrotate.d/dealsignal <<'LOGROTATE'
/var/log/dealsignal-maintenance.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
LOGROTATE
echo 'Installed minute-by-minute local health recovery and daily SQLite backups (02:15 server time).'
