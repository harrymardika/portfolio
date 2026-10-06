#!/usr/bin/env bash
# Pull new images and restart changed containers (replaces Watchtower, see ADR 0010).
# Run by portfolio-update.timer every 10 minutes; safe to run by hand.
set -euo pipefail
cd "$(dirname "$0")"
docker compose pull --quiet
docker compose up -d --remove-orphans
docker image prune --force --filter "until=168h" >/dev/null
