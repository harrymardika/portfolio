#!/usr/bin/env bun
/**
 * Refresh src/data/generated/github.json from the GitHub API (docs/04-content-guide.md §4).
 *   bun run fetch:github            use the cache if it is younger than 1 hour
 *   bun run fetch:github --force    always call the API
 * Env: GITHUB_TOKEN (optional, raises the rate limit), GITHUB_FIXTURE (path; tests use a fixed file),
 *      GITHUB_CACHE (output path, default src/data/generated/github.json; e2e uses a separate file).
 * Exits 0 on network problems so builds never depend on GitHub.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { load } from 'js-yaml';

import { githubConfigSchema, syncGithub } from '../src/lib/github';

const ROOT = join(import.meta.dir, '..');
const CONFIG_PATH = join(ROOT, 'content/github.yaml');
// Must match the path read in src/content.config.ts.
const CACHE_PATH = join(ROOT, process.env['GITHUB_CACHE'] ?? 'src/data/generated/github.json');
const ONE_HOUR = 60 * 60 * 1000;

const config = githubConfigSchema.parse(load(await readFile(CONFIG_PATH, 'utf8')));
const fixture = process.env['GITHUB_FIXTURE'];

const result = await syncGithub({
  config,
  cachePath: CACHE_PATH,
  maxAgeMs: process.argv.includes('--force') ? 0 : ONE_HOUR,
  fixturePath: fixture ? join(ROOT, fixture) : undefined,
  client: { token: process.env['GITHUB_TOKEN'] || undefined },
  io: {
    readText: (path) => readFile(path, 'utf8').catch(() => null),
    writeText: async (path, text) => {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, text);
    },
    log: (message) => console.log(message),
  },
});

console.log(`GitHub sync finished: ${result.source}, ${result.count} repos`);
