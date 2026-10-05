#!/usr/bin/env bun
/**
 * Stats service entry point (ADR 0009). Configuration through environment variables:
 *   STATS_DB_PATH      SQLite file (default ./.data/stats.sqlite; in Docker a volume)
 *   STATS_PORT         port (default 8787)
 *   STATS_SITE_HOST    public site host (default harry.mardika.my.id)
 *   STATS_ADMIN_TOKEN  token for /api/stats/private (empty = disabled)
 */
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { createHandler } from './handler';
import { StatsStore } from './store';

const dbPath = process.env['STATS_DB_PATH'] ?? '.data/stats.sqlite';
mkdirSync(dirname(dbPath), { recursive: true });

const store = new StatsStore(dbPath);
const handler = createHandler({
  store,
  siteHost: process.env['STATS_SITE_HOST'] ?? 'harry.mardika.my.id',
  adminToken: process.env['STATS_ADMIN_TOKEN'] || undefined,
});

const server = Bun.serve({ port: Number(process.env['STATS_PORT'] ?? 8787), fetch: handler });
console.log(`stats: listening on ${server.url} (db: ${dbPath})`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void server.stop().then(() => {
      store.close();
      process.exit(0);
    });
  });
}
