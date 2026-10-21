#!/usr/bin/env bash
set -euo pipefail
cd /opt/dealsignal
compose=(docker compose --env-file deploy/.env)

case "${1:-}" in
  backup)
    "${compose[@]}" exec -T app node backup.mjs
    ;;
  health)
    app_id=$("${compose[@]}" ps -q app)
    if [[ -z "$app_id" ]]; then
      logger -t dealsignal 'App container is stopped; inspect docker compose ps and logs'
      exit 1
    fi
    status=$(docker inspect --format '{{.State.Health.Status}}' "$app_id")
    if [[ "$status" == unhealthy ]]; then
      logger -t dealsignal 'Restarting app after three failed Docker health checks'
      "${compose[@]}" restart app
    fi
    ;;
  *) echo 'Usage: maintenance.sh backup|health' >&2; exit 2 ;;
esac
