/**
 * Lighthouse CI (T7.2): `bun run lighthouse` after a build. Mobile emulation (Lighthouse default),
 * median of 3 runs per page. Targets from docs/01-srs.md: performance ≥ 90, others ≥ 95.
 * BUILD_OUT_DIR picks the build (CI reuses the e2e build in dist-e2e).
 */
const { chromium } = require('@playwright/test');

const PORT = process.env.PREVIEW_PORT ?? '4400';
/** Accessibility, best practices, and SEO: ≥ 95 on every page. */
const SHARED = {
  'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
  'categories:best-practices': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
  'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
};
/** The home pages, which run the WebGL scenes. */
const HOME = '^http://[^/]+/(id/)?$';
const PAGES = ['/', '/id/', '/about/', '/projects/', '/projects/decklify/', '/homelab/'];

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
      assertMatrix: [
        {
          // Pages with a 3D scene: CI runs WebGL in software (SwiftShader), and headless Chromium then
          // reads every WebGL frame back to the CPU (~130 ms per frame, not present on real GPUs).
          // Below 0.8 fails; below the 0.9 target warns (next entry) so a regression is still visible.
          // lhci takes one [level, options] per assertion, but applies every entry whose pattern matches.
          matchingUrlPattern: HOME,
          assertions: {
            ...SHARED,
            'categories:performance': ['error', { minScore: 0.8, aggregationMethod: 'median-run' }],
          },
        },
        {
          matchingUrlPattern: HOME,
          assertions: {
            'categories:performance': ['warn', { minScore: 0.9, aggregationMethod: 'median-run' }],
          },
        },
        {
          matchingUrlPattern: '^http://[^/]+/(?!(id/)?$).+',
          assertions: {
            ...SHARED,
            'categories:performance': ['error', { minScore: 0.9, aggregationMethod: 'median-run' }],
          },
        },
      ],
    },
    // Reports stay local (and as a CI artifact); nothing is uploaded to a public server.
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
};
