#!/usr/bin/env bash
# Pull new images and restart changed containers (replaces Watchtower, see ADR 0010).
# When the web image changed, purge Cloudflare's cache for this site so the new pages show at once
# while HTML stays cached at the edge for when the server is down (ADR 0012).
# Run by portfolio-update.timer every 10 minutes; safe to run by hand.
#
# Optional settings in ./.env (read, never executed or printed):
#   CF_API_TOKEN   Cloudflare API token with only "Zone · Cache Purge · Purge" on the zone
#   CF_ZONE_ID     zone ID (Cloudflare dashboard → the zone's Overview page)
#   SITE_HOST      hostname to purge (default harry.mardika.my.id)
set -euo pipefail
cd "$(dirname "$0")"

PENDING=.purge-pending

# Value of KEY from ./.env, without sourcing the file.
env_value() {
  [ -f .env ] || return 0
  sed -n "s/^$1=//p" .env | tail -n 1 | sed -e 's/^["'\'']//' -e 's/["'\'']$//'
}

web_image() { docker compose images -q web 2>/dev/null || true; }
web_healthy() { [ "$(docker compose ps --format '{{.Health}}' web 2>/dev/null || true)" = healthy ]; }

before=$(web_image)
docker compose pull --quiet
# --wait: purge only once the new container is healthy, so Cloudflare refetches the new pages.
# Another service failing its health check (e.g. the assistant) must not skip the purge of a changed web
# image; the failure is still reported by the exit status at the end.
status=0
docker compose up -d --remove-orphans --wait --wait-timeout 180 || status=$?
after=$(web_image)
docker image prune --force --filter "until=168h" >/dev/null

if [ -n "$after" ] && [ "$before" != "$after" ]; then
  echo "update: web image changed"
  touch "$PENDING"
fi
[ -f "$PENDING" ] || exit "$status"
if [ "$status" -ne 0 ] && ! web_healthy; then
  echo "update: web is not healthy; keeping the Cloudflare cache until the next run" >&2
  exit "$status"
fi

token=$(env_value CF_API_TOKEN)
zone=$(env_value CF_ZONE_ID)
host=$(env_value SITE_HOST)
host=${host:-harry.mardika.my.id}
if [ -z "$token" ] || [ -z "$zone" ]; then
  echo "update: CF_API_TOKEN or CF_ZONE_ID not set in .env; skipping the Cloudflare cache purge"
  rm -f "$PENDING"
  exit "$status"
fi

# The token goes in through a header file on stdin, so it never appears in the process list.
response=$(printf 'Authorization: Bearer %s\n' "$token" | curl -sS --max-time 30 \
  -X POST "https://api.cloudflare.com/client/v4/zones/$zone/purge_cache" \
  -H @- -H 'Content-Type: application/json' \
  --data "{\"hosts\":[\"$host\"]}") || response=''
if printf '%s' "$response" | grep -q '"success":[[:space:]]*true'; then
  rm -f "$PENDING"
  echo "update: purged Cloudflare cache for $host"
  exit "$status"
else
  echo "update: Cloudflare cache purge failed; will retry on the next run" >&2
  exit 1
fi

# Install: sudo cp portfolio-update.{service,timer} /etc/systemd/system/
#          sudo systemctl daemon-reload && sudo systemctl enable --now portfolio-update.timer
