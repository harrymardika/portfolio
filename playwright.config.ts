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
    command: `bun run build && bun run preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    // Always build and serve fresh: reusing a server left running would test a stale dist/.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
