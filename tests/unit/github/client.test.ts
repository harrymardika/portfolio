import { describe, expect, it } from 'bun:test';

import { fetchPublicRepos, GithubError } from '@/lib/github';

const apiRepo = (name: string) => ({
  name,
  description: null,
  html_url: `https://github.com/u/${name}`,
  homepage: null,
  topics: [],
  language: null,
  stargazers_count: 0,
  fork: false,
  archived: false,
  private: false,
  created_at: '2025-01-01T00:00:00Z',
  pushed_at: null,
  extra_field_we_ignore: true,
});

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

function fakeFetch(responses: (() => Response | Promise<Response>)[]) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (!next) throw new Error('unexpected request');
    return next();
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const noSleep = async () => undefined;

describe('fetchPublicRepos', () => {
  it('follows pages until a short page and sends the token when given', async () => {
    const full = Array.from({ length: 100 }, (_, i) => apiRepo(`r${i}`));
    const { impl, calls } = fakeFetch([() => json(full), () => json([apiRepo('last')])]);

    const repos = await fetchPublicRepos('u', { fetch: impl, sleep: noSleep, token: 'secret' });

    expect(repos).toHaveLength(101);
    expect(calls.map((c) => new URL(c.url).searchParams.get('page'))).toEqual(['1', '2']);
    expect((calls[0]?.init?.headers as Record<string, string>)['Authorization']).toBe('Bearer secret');
  });

  it('works without a token', async () => {
    const { impl, calls } = fakeFetch([() => json([])]);
    await fetchPublicRepos('u', { fetch: impl, sleep: noSleep });
    expect((calls[0]?.init?.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('retries server errors and network failures with backoff', async () => {
    const waits: number[] = [];
    const { impl } = fakeFetch([
      () => json({ message: 'boom' }, 502),
      () => Promise.reject(new TypeError('socket hang up')),
      () => json([apiRepo('ok')]),
    ]);
    const repos = await fetchPublicRepos('u', { fetch: impl, sleep: async (ms) => void waits.push(ms) });
    expect(repos.map((r) => r.name)).toEqual(['ok']);
    expect(waits).toEqual([500, 1000]);
  });

  it('fails fast on the rate limit without retrying', async () => {
    const { impl, calls } = fakeFetch([
      () => json({ message: 'limit' }, 403, { 'x-ratelimit-remaining': '0' }),
    ]);
    const error = await fetchPublicRepos('u', { fetch: impl, sleep: noSleep }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GithubError);
    expect((error as GithubError).retryable).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it('does not retry client errors such as an unknown user', async () => {
    const { impl, calls } = fakeFetch([() => json({ message: 'Not Found' }, 404)]);
    await expect(fetchPublicRepos('nobody', { fetch: impl, sleep: noSleep })).rejects.toThrow('HTTP 404');
    expect(calls).toHaveLength(1);
  });

  it('gives up after the maximum number of attempts', async () => {
    const { impl, calls } = fakeFetch([() => json({}, 500), () => json({}, 500), () => json({}, 500)]);
    await expect(fetchPublicRepos('u', { fetch: impl, sleep: noSleep })).rejects.toThrow('HTTP 500');
    expect(calls).toHaveLength(3);
  });

  it('rejects a response that is not a list of repositories', async () => {
    const { impl } = fakeFetch([() => json({ unexpected: true })]);
    await expect(fetchPublicRepos('u', { fetch: impl, sleep: noSleep })).rejects.toThrow();
  });
});
