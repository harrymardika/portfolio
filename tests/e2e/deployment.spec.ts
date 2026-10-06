/**
 * Checks that only make sense against the real web server (Caddy in Docker):
 *   bun run test:e2e:docker   (with the stack running, see docs/07-deployment.md)
 * Skipped in the normal e2e run, which uses `astro preview` without production headers.
 */
import { expect, test } from '@playwright/test';

import { assumeGpu } from './helpers';

test.skip(!process.env['E2E_BASE_URL'], 'Runs only against a deployed stack (E2E_BASE_URL)');

/** The live site sits behind Cloudflare, which names itself as the server and may lengthen browser caching. */
const behindCloudflare = (headers: Record<string, string>): boolean => headers['server'] === 'cloudflare';
const maxAge = (header = ''): number => Number(/max-age=(\d+)/.exec(header)?.[1] ?? Number.NaN);

test('pages carry the security headers and a hash-based CSP', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['strict-transport-security']).toContain('max-age=31536000');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  // Caddy drops its Server header; Cloudflare adds its own name, which reveals nothing about the origin.
  if (!behindCloudflare(headers)) expect(headers['server']).toBeUndefined();
  const csp = headers['content-security-policy'] ?? '';
  expect(csp).toMatch(/script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+;/);
  expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  expect(headers['cache-control']).toBe('public, max-age=0, must-revalidate');
});

test('no page triggers a Content Security Policy violation, including the 3D scenes', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  await assumeGpu(page); // load the 3D scenes, as a visitor with a GPU would
  for (const path of ['/', '/id/', '/projects/', '/about/', '/homelab/', '/print/cv/', '/print/portfolio/']) {
    await page.goto(path, { waitUntil: 'networkidle' });
  }
  await page.goto('/');
  await expect(page.locator('[data-photo-card]')).toHaveAttribute('data-scene-ready', 'true', {
    timeout: 30_000,
  });
  // The journey scene starts only when scrolled near (Journey.astro).
  await page.locator('[data-journey-stage]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-journey-stage]')).toHaveAttribute('data-scene-ready', 'true', {
    timeout: 30_000,
  });
  expect(violations).toEqual([]);
});

test('assets are cached for a year, preview images for a day, and PDFs for an hour', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const asset = await page.locator('script[src^="/_astro/"]').first().getAttribute('src');
  expect((await request.get(asset ?? '')).headers()['cache-control']).toBe(
    'public, max-age=31536000, immutable',
  );
  const pdf = await request.get('/downloads/Harry-Mardika-CV-EN.pdf');
  expect(pdf.status()).toBe(200);
  // Cloudflare's "Browser Cache TTL" may raise this (docs/07 §4: set it to "Respect Existing Headers").
  if (behindCloudflare(pdf.headers()))
    expect(maxAge(pdf.headers()['cache-control'])).toBeGreaterThanOrEqual(3600);
  else expect(pdf.headers()['cache-control']).toBe('public, max-age=3600');
  const og = await request.get('/og/home.jpg');
  expect(og.status()).toBe(200);
  expect(og.headers()['cache-control']).toBe('public, max-age=86400');
});

test('text files are served precompressed, Brotli first', async ({ request }) => {
  const brotli = await request.get('/', { headers: { 'Accept-Encoding': 'br, gzip' } });
  expect(brotli.headers()['content-encoding']).toBe('br');
  expect(brotli.headers()['vary']).toContain('Accept-Encoding');
  expect(await brotli.text()).toContain('<html'); // decoded correctly by the client
  const gzip = await request.get('/', { headers: { 'Accept-Encoding': 'gzip' } });
  expect(gzip.headers()['content-encoding']).toBe('gzip');
  // Security headers apply to compressed responses too.
  expect(gzip.headers()['content-security-policy']).toContain("default-src 'self'");
});

test('unknown paths return the custom 404 page with status 404', async ({ request }) => {
  const response = await request.get('/does-not-exist/');
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('Halaman tidak ditemukan');
});

test('the stats API is reachable through Caddy', async ({ request }) => {
  const health = await request.get('/api/stats/health');
  expect(health.status()).toBe(200);
  const summary = await request.get('/api/stats/summary');
  expect(summary.status()).toBe(200);
  expect(await summary.json()).toHaveProperty('visitors');
  expect((await request.get('/api/stats/private')).status()).not.toBe(200);
});

test('the home server health check is answered by Caddy and never cached', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.json()).toEqual({ ok: true });
});
