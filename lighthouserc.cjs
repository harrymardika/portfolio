/**
 * Lighthouse CI (T7.2): `bun run lighthouse` after a build. Mobile emulation (Lighthouse default),
 * median of 3 runs per page. Targets from docs/01-srs.md: performance ≥ 90, others ≥ 95.
 * BUILD_OUT_DIR picks the build (CI reuses the e2e build in dist-e2e).
 * Headless Chromium has no GPU, so the home pages are measured as a visitor without one sees them:
 * the static photo card (src/scenes/core/capabilities.ts). With a GPU the 3D scores 93–98 locally.
 */
const { chromium } = require('@playwright/test');

const PORT = process.env.PREVIEW_PORT ?? '4400';
const median = (minScore) => ['error', { minScore, aggregationMethod: 'median-run' }];
const PAGES = ['/', '/id/', '/about/', '/projects/', '/projects/decklify/', '/stats/'];

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
