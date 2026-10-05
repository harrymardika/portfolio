import { afterEach, describe, expect, it } from 'bun:test';

import { createHandler } from '../../../services/stats/handler';
import { StatsStore, type StoredEvent } from '../../../services/stats/store';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36';
let store: StatsStore;
afterEach(() => store?.close());

const event = (extra: Partial<StoredEvent> = {}): StoredEvent => ({
  type: 'pageview',
  path: '/',
  lang: 'en',
  detail: null,
  referrerHost: null,
  country: null,
  ref: null,
  visitor: 'v1',
  ...extra,
});

describe('StatsStore', () => {
  it('keeps one salt per day and deletes older salts', () => {
    store = new StatsStore();
    const day1 = store.saltFor(new Date('2026-10-05T01:00:00Z'));
    expect(store.saltFor(new Date('2026-10-05T23:00:00Z'))).toBe(day1);
    const day2 = store.saltFor(new Date('2026-10-06T00:00:01Z'));
    expect(day2).not.toBe(day1);
    // Going back cannot recover yesterday's salt: it was deleted.
    expect(store.saltFor(new Date('2026-10-05T12:00:00Z'))).not.toBe(day1);
  });

  it('counts unique visitors per day, page views, and downloads, with a 30-day window', () => {
    store = new StatsStore();
    const now = new Date('2026-10-05T12:00:00Z');
    store.record(event({ visitor: 'a' }), new Date('2026-08-01T10:00:00Z')); // older than 30 days
    store.record(event({ visitor: 'a' }), now);
    store.record(event({ visitor: 'a', path: '/about/' }), now); // same visitor, same day
    store.record(event({ visitor: 'b', referrerHost: 'linkedin.com', country: 'ID' }), now);
    store.record(event({ type: 'download', detail: 'cv', visitor: 'b' }), now);
    store.record(event({ type: 'download', detail: 'portfolio', visitor: 'a' }), now);

    const summary = store.summary(now);
    expect(summary.visitors).toEqual({ total: 3, last30Days: 2 });
    expect(summary.pageviews).toEqual({ total: 4, last30Days: 3 });
    expect(summary.downloads).toEqual({ cv: 1, portfolio: 1 });
    expect(summary.topPages[0]).toEqual({ key: '/', count: 2 });
    expect(summary.topReferrers).toEqual([{ key: 'linkedin.com', count: 1 }]);
    expect(summary.topCountries).toEqual([{ key: 'ID', count: 1 }]);
    expect(summary.since).toBe('2026-08-01');
  });

  it('reports tracking links with downloads by the same visitor that day', () => {
    store = new StatsStore();
    const now = new Date('2026-10-05T12:00:00Z');
    store.record(event({ visitor: 'r', ref: 'acme-ml-engineer' }), now);
    store.record(event({ visitor: 'r', path: '/projects/' }), now);
    store.record(event({ type: 'download', detail: 'cv', visitor: 'r' }), now);
    store.record(event({ type: 'download', detail: 'cv', visitor: 'someone-else' }), now);

    const [report] = store.refReport();
    expect(report).toMatchObject({
      ref: 'acme-ml-engineer',
      visits: 1,
      pageviews: 2,
      downloadedCv: true,
      downloadedPortfolio: false,
    });
  });

  it('never exposes ref values in the public summary', () => {
    store = new StatsStore();
    store.record(event({ ref: 'secret-company' }), new Date());
    expect(JSON.stringify(store.summary(new Date()))).not.toContain('secret-company');
  });
});

describe('stats HTTP handler', () => {
  const NOW = new Date('2026-10-05T12:00:00Z');
  const setup = (extra: Partial<Parameters<typeof createHandler>[0]> = {}) => {
    store = new StatsStore();
    return createHandler({
      store,
      siteHost: 'harry.mardika.my.id',
      adminToken: 'owner-token',
      now: () => NOW,
      ...extra,
    });
  };
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request('http://stats/api/stats/event', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'user-agent': UA,
        origin: 'https://harry.mardika.my.id',
        'cf-connecting-ip': '1.2.3.4',
        ...headers,
      },
    });
  const summary = async (handler: ReturnType<typeof createHandler>) =>
    (await (await handler(new Request('http://stats/api/stats/summary'))).json()) as {
      pageviews: { total: number };
    };

  it('records a valid event and answers 204', async () => {
    const handler = setup();
    const response = await handler(
      post({ type: 'pageview', path: '/', lang: 'en', referrer: 'https://github.com/x' }),
    );
    expect(response.status).toBe(204);
    expect((await summary(handler)).pageviews.total).toBe(1);
  });

  it('silently ignores opted-out visitors, bots, foreign origins, invalid and oversized bodies', async () => {
    const handler = setup();
    const valid = { type: 'pageview', path: '/', lang: 'en' };
    for (const request of [
      post(valid, { dnt: '1' }),
      post(valid, { 'user-agent': 'Googlebot/2.1' }),
      post(valid, { origin: 'https://evil.example' }),
      post('{not json'),
      post({ type: 'pageview', path: '/', lang: 'en', extra: 1 }),
      post(JSON.stringify({ ...valid, referrer: 'x'.repeat(3000) })),
    ]) {
      expect((await handler(request)).status).toBe(204);
    }
    expect((await summary(handler)).pageviews.total).toBe(0);
  });

  it('rate-limits a single visitor', async () => {
    const handler = setup({ rateLimit: 3, summaryTtl: 0 });
    for (let i = 0; i < 5; i++) await handler(post({ type: 'pageview', path: '/', lang: 'en' }));
    expect((await summary(handler)).pageviews.total).toBe(3);
  });

  it('caches the public summary', async () => {
    const handler = setup({ summaryTtl: 300 });
    const first = await handler(new Request('http://stats/api/stats/summary'));
    expect(first.headers.get('cache-control')).toBe('public, max-age=300');
    await handler(post({ type: 'pageview', path: '/', lang: 'en' }));
    expect((await summary(handler)).pageviews.total).toBe(0); // still the cached value
  });

  it('protects the private report with the owner token', async () => {
    const handler = setup();
    const get = (auth?: string) =>
      handler(
        new Request('http://stats/api/stats/private', { headers: auth ? { authorization: auth } : {} }),
      );
    expect((await get()).status).toBe(401);
    expect((await get('Bearer wrong-token')).status).toBe(401);
    const ok = await get('Bearer owner-token');
    expect(ok.status).toBe(200);
    expect(ok.headers.get('cache-control')).toBe('no-store');
  });

  it('disables the private report when no token is configured', async () => {
    const handler = setup({ adminToken: undefined });
    const response = await handler(
      new Request('http://stats/api/stats/private', { headers: { authorization: 'Bearer anything' } }),
    );
    expect(response.status).toBe(404);
  });

  it('answers health checks and 404 for unknown routes', async () => {
    const handler = setup();
    expect((await handler(new Request('http://stats/api/stats/health'))).status).toBe(200);
    expect((await handler(new Request('http://stats/api/stats/nope'))).status).toBe(404);
    expect((await handler(new Request('http://stats/api/stats/event'))).status).toBe(404); // GET not allowed
  });
});
