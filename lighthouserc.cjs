/**
 * Lighthouse CI (T7.2): `bun run lighthouse` after a build. Mobile emulation (Lighthouse default),
 * median of 3 runs per page. Targets from docs/01-srs.md: performance ≥ 90, others ≥ 95.
 * BUILD_OUT_DIR picks the build (CI reuses the e2e build in dist-e2e).
 * Headless Chromium has no GPU, so the home pages are measured as a visitor without one sees them:
 * the plain page with the HTML hero prints (src/scenes/core/early.ts). With a GPU (headed Chrome,
 * --enable-gpu), the full-screen 3D room scores 90–91 on the home page (T14.5, 2026-10-13).
 */
const { chromium } = require('@playwright/test');

const PORT = process.env.PREVIEW_PORT ?? '4400';
const median = (minScore) => ['error', { minScore, aggregationMethod: 'median-run' }];
const PAGES = ['/', '/id/', '/about/', '/projects/', '/projects/decklify/', '/stats/', '/messages/'];

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'bun scripts/serve-build.ts',
      startServerReadyPattern: 'Serving',
      url: PAGES.map((path) => `http://localhost:${PORT}${path}`),
      numberOfRuns: 3,
      // Playwright's Chromium, already installed for e2e and PDFs.
      chromePath: chromium.executablePath(),
      settings: { chromeFlags: '--headless=new --no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': median(0.9),
        'categories:accessibility': median(0.95),
        'categories:best-practices': median(0.95),
        'categories:seo': median(0.95),
      },
    },
    // Reports stay local (and as a CI artifact); nothing is uploaded to a public server.
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
