import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { DEFAULT_LOCALE, LOCALES } from './src/lib/i18n/locales';
import { resolveSiteUrl } from './src/lib/site';

// Public URL of the deployed site. Used for canonical URLs, sitemap, and OG tags.
// Override with SITE_URL (see .env.example) for previews.
const SITE_URL = resolveSiteUrl(process.env['SITE_URL']);

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // BUILD_OUT_DIR lets e2e build into dist-e2e/ (scripts/generate-pdf.ts reads the same variable).
  outDir: process.env['BUILD_OUT_DIR'] ?? './dist',
  // Dev uses 'ignore' so the /api/stats proxy below is reachable; builds enforce 'always'.
  trailingSlash: process.argv.includes('dev') ? 'ignore' : 'always',
  build: {
    format: 'directory',
  },
  // ADR 0008: English at `/`, Indonesian at `/id/`. Pages use a `[...locale]` route.
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
    // Dev only: forward stats calls to `bun run stats:dev` (production routes them through Caddy).
    server: { proxy: { '/api/stats': 'http://localhost:8787' } },
    // Never inline fonts as data: URIs; the CSP allows fonts from 'self' only (src/lib/security/csp.ts).
    build: { assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined) },
  },
  server: {
    port: 4321,
    // Listen on all interfaces so the dev server is reachable from Docker (T1.8).
    host: true,
  },
});
