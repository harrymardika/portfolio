#!/usr/bin/env bash
# Consistent SQLite backup of the stats database (VACUUM INTO works while the service runs).
# Keeps the last 14 daily copies in ./backups. Example cron: 30 3 * * * /opt/portfolio/backup-stats.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p backups
day=$(date -u +%F)
# Clear a leftover from an interrupted run; VACUUM INTO refuses to overwrite.
docker compose exec -T stats rm -f /tmp/backup.sqlite
docker compose exec -T stats bun -e "
  import { Database } from 'bun:sqlite';
  new Database('/data/stats.sqlite', { readonly: true }).run(\"VACUUM INTO '/tmp/backup.sqlite'\");
"
# Streamed out: `docker compose cp` cannot read the container's tmpfs /tmp. Renamed only when complete.
docker compose exec -T stats cat /tmp/backup.sqlite >"backups/stats-${day}.sqlite.part"
docker compose exec -T stats rm -f /tmp/backup.sqlite
mv "backups/stats-${day}.sqlite.part" "backups/stats-${day}.sqlite"
ls -1t backups/stats-*.sqlite | tail -n +15 | xargs -r rm --
echo "Backup written: backups/stats-${day}.sqlite"
