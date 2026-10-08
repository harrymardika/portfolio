#!/usr/bin/env bun
/**
 * Serve a finished build with the same routes and compression as production (docker/Caddyfile):
 * Brotli-compressed static files, /api/health, the real stats API (in-memory database), and the assistant's
 * health check (on, without a model, so the corner chat shows and is measured). Security
 * headers and CSP are not sent; they are tested against the real container (test:e2e:docker).
 * Used by Lighthouse CI (lighthouserc.cjs) so API calls are answered instead of logging 404s.
 *   bun scripts/serve-build.ts        BUILD_OUT_DIR (default dist), PREVIEW_PORT (default 4400)
 */
import { join, resolve } from 'node:path';

import { createHandler as createAssistant } from '../services/assistant/handler';
import { createHandler } from '../services/stats/handler';
import { StatsStore } from '../services/stats/store';
import { requireBuild, serveBuild, warmCompression } from './lib/static-server';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');

await requireBuild(OUT_DIR);
const stats = createHandler({ store: new StatsStore(), siteHost: 'harry.mardika.my.id' });
// No providers: questions get the fallback (503 "unavailable"), which is all Lighthouse needs.
const assistant = createAssistant({ enabled: true, siteHost: 'localhost', routes: [], log: () => {} });

await warmCompression(OUT_DIR);
const server = serveBuild(OUT_DIR, {
  port: Number(process.env['PREVIEW_PORT'] ?? 4400),
  compress: true,
  route(request, pathname) {
    if (pathname === '/api/health')
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    if (pathname.startsWith('/api/stats/')) return stats(request);
    if (pathname === '/api/ask' || pathname.startsWith('/api/ask/')) return assistant(request);
    return null;
  },
});
console.log(`Serving ${OUT_DIR} at ${server.url}`);
