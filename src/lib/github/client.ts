/**
 * Minimal GitHub REST client for public repositories. The token is optional: without it GitHub
 * allows 60 requests per hour per IP, plenty for one build. `fetch` and `sleep` are injectable.
 */
import { z } from 'astro/zod';

import { apiRepoSchema, type ApiRepo } from './schemas';

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'GithubError';
  }
}

export interface ClientOptions {
  readonly token?: string | undefined;
  readonly fetch?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  /** Attempts per request, including the first. */
  readonly maxAttempts?: number;
  readonly timeoutMs?: number;
}

const API = 'https://api.github.com';
const PER_PAGE = 100;
/** Safety stop: 10 pages = 1000 repositories. */
const MAX_PAGES = 10;

async function getJson(url: string, options: ClientOptions): Promise<unknown> {
  const {
    token,
    fetch: fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    maxAttempts = 3,
    timeoutMs = 10_000,
  } = options;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'harry-mardika-portfolio',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let lastError: GithubError = new GithubError('No attempt made', null, true);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
      if (response.ok) return await response.json();
      const rateLimited = response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0';
      if (rateLimited) {
        // Retrying cannot help before the reset time; fail fast and let the caller use its cache.
        throw new GithubError(`GitHub rate limit reached (HTTP ${response.status})`, response.status, false);
      }
      const retryable = response.status >= 500;
      lastError = new GithubError(
        `GitHub responded with HTTP ${response.status} for ${url}`,
        response.status,
        retryable,
      );
      if (!retryable) throw lastError;
    } catch (error) {
      if (error instanceof GithubError && !error.retryable) throw error;
      lastError =
        error instanceof GithubError ? error : new GithubError(`Network error: ${String(error)}`, null, true);
    }
    if (attempt < maxAttempts) await sleep(500 * 2 ** (attempt - 1));
  }
  throw lastError;
}

/** All public repositories of `username`, most recently pushed first. */
export async function fetchPublicRepos(username: string, options: ClientOptions = {}): Promise<ApiRepo[]> {
  const repos: ApiRepo[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${API}/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=${PER_PAGE}&page=${page}`;
    const batch = z.array(apiRepoSchema).parse(await getJson(url, options));
    repos.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  return repos;
}
