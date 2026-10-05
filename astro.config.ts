import { defineConfig } from 'astro/config';

// Public URL of the deployed site. Used for canonical URLs, sitemap, and OG tags.
// Override with SITE_URL (see .env.example) for previews.
const SITE_URL = process.env['SITE_URL'] ?? 'https://harry.mardika.my.id';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  server: {
    port: 4321,
    // Listen on all interfaces so the dev server is reachable from Docker (T1.8).
    host: true,
  },
});
