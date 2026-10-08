import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;
/** Set to test a running deployment instead (e.g. the Docker stack): E2E_BASE_URL=http://localhost:8080 */
const EXTERNAL_URL = process.env['E2E_BASE_URL'];

// E2E tests run against the production build served by `astro preview`.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: EXTERNAL_URL ?? `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // No local server when testing an external deployment.
  ...(EXTERNAL_URL
    ? {}
    : {
        webServer: {
          // --ignore-lock keeps preview in the foreground even when Astro detects an AI agent.
          // E2E is isolated from real data and output: GITHUB_FIXTURE avoids the network and live GitHub data,
          // GITHUB_CACHE and BUILD_OUT_DIR keep the fixture build out of the cache and dist/ used by dev and production.
          // MESSAGES_FILE: fictional messages, since the real list may be empty (the section is then hidden).
          // BUILD_META_DIR keeps the fixture CSP and assistant knowledge out of build-meta/ (assistant-knowledge.spec.ts).
          command:
            `GITHUB_FIXTURE=tests/fixtures/github.json GITHUB_CACHE=src/data/generated/github.e2e.json ` +
            `MESSAGES_FILE=tests/fixtures/messages.yaml ` +
            `BUILD_OUT_DIR=dist-e2e BUILD_META_DIR=build-meta-e2e PUBLIC_STATS_ENABLED=true PUBLIC_ASSISTANT_ENABLED=true bun run build && ` +
            `BUILD_OUT_DIR=dist-e2e bun run preview --port ${PORT} --ignore-lock`,
          url: `http://localhost:${PORT}/`,
          // Always build and serve fresh: reusing a server left running would test a stale dist/.
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
