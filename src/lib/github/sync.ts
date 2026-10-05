/**
 * Refresh the GitHub cache used by the site. Never throws for network problems: the build must
 * not depend on GitHub being reachable. File access and fetching are injected for testing.
 */
import { fetchPublicRepos, type ClientOptions } from './client';
import { githubCacheSchema, type GithubCache, type GithubConfig } from './schemas';
import { selectRepos } from './select';

export interface SyncIO {
  readText(path: string): Promise<string | null>;
  writeText(path: string, text: string): Promise<void>;
  log(message: string): void;
}

export interface SyncOptions {
  readonly config: GithubConfig;
  readonly cachePath: string;
  readonly io: SyncIO;
  readonly client?: ClientOptions;
  readonly now?: Date;
  /** Skip the API when the cache is younger than this. 0 always fetches. */
  readonly maxAgeMs?: number;
  /** Use this file instead of the API (deterministic tests). */
  readonly fixturePath?: string | undefined;
}

export type SyncSource = 'api' | 'fresh-cache' | 'stale-cache' | 'fixture' | 'empty';

export interface SyncResult {
  readonly source: SyncSource;
  readonly count: number;
}

function parseCache(text: string | null): GithubCache | null {
  if (text === null) return null;
  try {
    const parsed = githubCacheSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

const serialize = (cache: GithubCache): string => `${JSON.stringify(cache, null, 2)}\n`;

export async function syncGithub(options: SyncOptions): Promise<SyncResult> {
  const { config, cachePath, io, now = new Date(), maxAgeMs = 0, fixturePath } = options;

  if (fixturePath) {
    const fixture = parseCache(await io.readText(fixturePath));
    if (!fixture) throw new Error(`Fixture ${fixturePath} is missing or does not match the cache schema`);
    await io.writeText(cachePath, serialize({ ...fixture, source: 'fixture' }));
    io.log(`GitHub: using fixture ${fixturePath} (${fixture.repos.length} repos)`);
    return { source: 'fixture', count: fixture.repos.length };
  }

  const cached = parseCache(await io.readText(cachePath));
  // A cache left by a test run (fixture) or for another account is not a valid fallback.
  const sameUser = cached?.username === config.username && cached.source === 'api';
  if (cached && sameUser && maxAgeMs > 0 && now.getTime() - Date.parse(cached.generatedAt) < maxAgeMs) {
    io.log(`GitHub: cache is fresh (${cached.repos.length} repos), skipping the API`);
    return { source: 'fresh-cache', count: cached.repos.length };
  }

  try {
    const all = await fetchPublicRepos(config.username, options.client);
    const { entries: repos, warnings } = selectRepos(all, config);
    for (const warning of warnings) io.log(`GitHub: warning: content/github.yaml: ${warning}`);
    await io.writeText(
      cachePath,
      serialize({ generatedAt: now.toISOString(), username: config.username, source: 'api', repos }),
    );
    io.log(`GitHub: ${repos.length} projects from ${all.length} public repos`);
    return { source: 'api', count: repos.length };
  } catch (error) {
    io.log(`GitHub: warning: ${error instanceof Error ? error.message : String(error)}`);
    if (cached && sameUser) {
      io.log(`GitHub: keeping the previous cache from ${cached.generatedAt} (${cached.repos.length} repos)`);
      return { source: 'stale-cache', count: cached.repos.length };
    }
    await io.writeText(
      cachePath,
      serialize({ generatedAt: now.toISOString(), username: config.username, source: 'api', repos: [] }),
    );
    io.log('GitHub: no cache available, continuing without GitHub projects');
    return { source: 'empty', count: 0 };
  }
}
