import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

// E2E tests run against the production build served by `astro preview`.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // --ignore-lock keeps preview in the foreground even when Astro detects an AI agent.
    // E2E is isolated from real data and output: GITHUB_FIXTURE avoids the network and live GitHub data,
    // GITHUB_CACHE and --outDir keep the fixture build out of the cache and dist/ used by dev and production.
    command:
      `GITHUB_FIXTURE=tests/fixtures/github.json GITHUB_CACHE=src/data/generated/github.e2e.json ` +
      `bun run build --outDir dist-e2e && bun run preview --outDir dist-e2e --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    // Always build and serve fresh: reusing a server left running would test a stale dist/.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
