#!/usr/bin/env bun
/**
 * Owner-only report of tracking links (?ref=...) from the stats service (docs/08-analytics.md §4).
 *   bun run stats:report
 * Env (read from .env automatically by Bun):
 *   STATS_ADMIN_TOKEN  same token as the stats service (required)
 *   STATS_URL          site to query (default https://harry.mardika.my.id; local: http://localhost:8787)
 */
import { formatRefReport, privateReportSchema } from '../src/lib/stats/summary';

const token = process.env['STATS_ADMIN_TOKEN'];
const base = process.env['STATS_URL'] || 'https://harry.mardika.my.id';

if (!token) {
  console.error('Set STATS_ADMIN_TOKEN in .env (the same value the stats service uses).');
  process.exit(1);
}

const response = await fetch(new URL('/api/stats/private', base), {
  headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  signal: AbortSignal.timeout(10_000),
}).catch((error: unknown) => {
  console.error(`Could not reach ${base}: ${String(error)}`);
  process.exit(1);
});

if (response.status === 401) {
  console.error('The token was rejected. Check STATS_ADMIN_TOKEN matches the server.');
  process.exit(1);
}
if (!response.ok) {
  console.error(`The stats service answered HTTP ${response.status} (${base}).`);
  process.exit(1);
}

const report = privateReportSchema.parse(await response.json());
console.log(`Tracking links on ${base} (report generated ${report.generatedAt})\n`);
console.log(formatRefReport(report.refs));
