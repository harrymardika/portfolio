/**
 * HTTP API of the stats service (docs/08-analytics.md). `createHandler` maps a Request to a
 * Response with injected dependencies, so it is tested without a running server.
 *   POST /api/stats/event     record one event (always 204, so the beacon never retries or leaks errors)
 *   GET  /api/stats/summary   public aggregates, cached
 *   GET  /api/stats/private   tracking-link report, requires the admin token
 *   GET  /api/stats/health    liveness check
 */
import { timingSafeEqual } from 'node:crypto';

import { eventPayloadSchema } from '../../src/lib/stats/events';
import {
  clientAddress,
  countryCode,
  isBot,
  optedOut,
  referrerHost,
  visitorHash,
} from '../../src/lib/stats/privacy';

import type { StatsStore, Summary } from './store';

export interface HandlerOptions {
  readonly store: StatsStore;
  /** Host of the public site, used to drop self-referrals (e.g. "harry.mardika.my.id"). */
  readonly siteHost: string;
  /** Owner token for /private; when empty the endpoint is disabled. */
  readonly adminToken?: string | undefined;
  readonly now?: () => Date;
  /** Max events per visitor per minute. */
  readonly rateLimit?: number;
  /** Seconds the public summary is cached (in memory and by Cloudflare). */
  readonly summaryTtl?: number;
}

const MAX_BODY_BYTES = 2_048;
const noContent = (): Response => new Response(null, { status: 204 });
const json = (body: unknown, status: number, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });

function sameToken(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createHandler(options: HandlerOptions): (request: Request) => Promise<Response> {
  const { store, siteHost, adminToken, now = () => new Date(), rateLimit = 60, summaryTtl = 300 } = options;
  const recent = new Map<string, number[]>();
  let cached: { at: number; summary: Summary } | null = null;

  function allow(visitor: string, at: number): boolean {
    const windowStart = at - 60_000;
    const hits = (recent.get(visitor) ?? []).filter((t) => t > windowStart);
    if (hits.length >= rateLimit) return false;
    hits.push(at);
    recent.set(visitor, hits);
    if (recent.size > 10_000) recent.clear(); // bound memory under abuse
    return true;
  }

  async function recordEvent(request: Request): Promise<Response> {
    const { headers } = request;
    // Only the site itself may post (browsers send Origin on beacons); other origins are ignored.
    const origin = headers.get('origin');
    if (origin && new URL(origin).hostname !== siteHost) return noContent();
    const userAgent = headers.get('user-agent');
    if (optedOut(headers) || isBot(userAgent)) return noContent();

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return noContent();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return noContent();
    }
    const parsed = eventPayloadSchema.safeParse(body);
    if (!parsed.success) return noContent();

    const at = now();
    const visitor = visitorHash(store.saltFor(at), clientAddress(headers), userAgent ?? '');
    if (!allow(visitor, at.getTime())) return noContent();

    const event = parsed.data;
    store.record(
      {
        type: event.type,
        path: event.path,
        lang: event.lang,
        detail: event.type === 'pageview' ? null : event.detail,
        referrerHost: event.type === 'pageview' ? referrerHost(event.referrer, siteHost) : null,
        country: countryCode(headers),
        ref: event.type === 'pageview' ? (event.ref ?? null) : null,
        visitor,
      },
      at,
    );
    return noContent();
  }

  function summary(): Response {
    const at = now().getTime();
    if (!cached || at - cached.at > summaryTtl * 1000) cached = { at, summary: store.summary(new Date(at)) };
    return json(cached.summary, 200, { 'cache-control': `public, max-age=${summaryTtl}` });
  }

  function privateReport(request: Request): Response {
    if (!adminToken) return json({ error: 'Not found' }, 404);
    const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (!sameToken(given, adminToken))
      return json({ error: 'Unauthorized' }, 401, { 'www-authenticate': 'Bearer' });
    return json({ generatedAt: now().toISOString(), refs: store.refReport() }, 200, {
      'cache-control': 'no-store',
    });
  }

  return async (request) => {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/stats/event' && request.method === 'POST') return await recordEvent(request);
      if (pathname === '/api/stats/summary' && request.method === 'GET') return summary();
      if (pathname === '/api/stats/private' && request.method === 'GET') return privateReport(request);
      if (pathname === '/api/stats/health' && request.method === 'GET') return json({ ok: true }, 200);
      return json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('stats: request failed', error);
      return pathname === '/api/stats/event' ? noContent() : json({ error: 'Internal error' }, 500);
    }
  };
}
