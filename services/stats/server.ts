#!/usr/bin/env bun
/**
 * Stats service entry point (ADR 0009). Configuration through environment variables:
 *   STATS_DB_PATH      SQLite file (default ./.data/stats.sqlite; in Docker a volume)
 *   STATS_PORT         port (default 8787)
 *   STATS_SITE_HOST    public site host (default harry.mardika.my.id)
 *   STATS_ADMIN_TOKEN  token for /api/stats/private (empty = disabled)
 *   MESSAGES_ADMIN_TOKEN  token for the "Kind words" moderation queue (empty = the form is closed)
 *   MESSAGES_DB_PATH   SQLite file of that queue (default next to the stats file; never backed up, ADR 0017)
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { createHandler } from './handler';
import { createMessagesHandler } from './messages';
import { MessagesStore } from './messages-store';
import { StatsStore } from './store';

const dbPath = process.env['STATS_DB_PATH'] ?? '.data/stats.sqlite';
mkdirSync(dirname(dbPath), { recursive: true });

const siteHost = process.env['STATS_SITE_HOST'] ?? 'harry.mardika.my.id';
const store = new StatsStore(dbPath);
const messagesStore = new MessagesStore(
  process.env['MESSAGES_DB_PATH'] ?? join(dirname(dbPath), 'messages.sqlite'),
);
const messagesToken = process.env['MESSAGES_ADMIN_TOKEN'] || undefined;
// Old messages go even while the form is closed or nobody visits: at start and every 6 hours.
const purgeMessages = (): void => {
  const removed = messagesStore.purge(new Date());
  if (removed > 0) console.log(JSON.stringify({ event: 'message', status: 'purged', count: removed }));
};
purgeMessages();
const purgeTimer = setInterval(purgeMessages, 6 * 60 * 60 * 1000);
const handler = createHandler({
  store,
  siteHost,
  adminToken: process.env['STATS_ADMIN_TOKEN'] || undefined,
  messages: createMessagesHandler({ store: messagesStore, siteHost, adminToken: messagesToken }),
});

const server = Bun.serve({ port: Number(process.env['STATS_PORT'] ?? 8787), fetch: handler });
console.log(
  `stats: listening on ${server.url} (db: ${dbPath}); kind words form ${messagesToken ? 'open' : 'closed'}`,
);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void server.stop().then(() => {
      store.close();
      clearInterval(purgeTimer);
      messagesStore.close();
      process.exit(0);
    });
  });
}
