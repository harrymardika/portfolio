import { describe, expect, it } from 'bun:test';

import { githubConfigSchema, syncGithub, type GithubCache, type SyncIO } from '@/lib/github';

const config = githubConfigSchema.parse({ username: 'harrymardika', topic: 'portfolio', include: ['a'] });
const NOW = new Date('2026-10-05T12:00:00Z');

function memoryIO(files: Record<string, string> = {}) {
  const store = new Map(Object.entries(files));
  const logs: string[] = [];
  const io: SyncIO = {
    readText: async (path) => store.get(path) ?? null,
    writeText: async (path, text) => void store.set(path, text),
    log: (message) => void logs.push(message),
  };
  const read = (path: string) => JSON.parse(store.get(path) ?? 'null') as GithubCache | null;
  return { io, logs, read };
}

const cache = (generatedAt: string, names: string[], username = 'harrymardika'): string =>
  JSON.stringify({
    generatedAt,
    username,
    repos: names.map((name) => ({
      name,
      description: null,
      url: `https://github.com/harrymardika/${name}`,
      homepage: null,
      topics: [],
      language: null,
      stars: 0,
      createdAt: '2025-01-01T00:00:00Z',
      pushedAt: null,
    })),
  });

const apiOk = (names: string[]) =>
  (async () =>
    new Response(
      JSON.stringify(
        names.map((name) => ({
          name,
          description: null,
          html_url: `https://github.com/harrymardika/${name}`,
          homepage: null,
          topics: [],
          language: null,
          stargazers_count: 0,
          fork: false,
          archived: false,
          private: false,
          created_at: '2025-01-01T00:00:00Z',
          pushed_at: null,
        })),
      ),
      { status: 200 },
    )) as unknown as typeof fetch;

const apiDown = (async () => {
  throw new TypeError('offline');
}) as unknown as typeof fetch;

const client = (fetchImpl: typeof fetch) => ({
  fetch: fetchImpl,
  sleep: async () => undefined,
  maxAttempts: 1,
});

describe('syncGithub', () => {
  it('writes the selected repos from the API', async () => {
    const { io, read } = memoryIO();
    const result = await syncGithub({
      config,
      cachePath: 'c.json',
      io,
      now: NOW,
      client: client(apiOk(['a', 'b'])),
    });
    expect(result).toEqual({ source: 'api', count: 1 });
    expect(read('c.json')?.repos.map((r) => r.name)).toEqual(['a']);
    expect(read('c.json')?.generatedAt).toBe(NOW.toISOString());
  });

  it('drops the selection topic from the stored topics', async () => {
    const { io, read } = memoryIO();
    const fetchImpl = (async () =>
      new Response(
        JSON.stringify([
          {
            name: 'a',
            description: null,
            html_url: 'https://github.com/harrymardika/a',
            homepage: null,
            topics: ['portfolio', 'computer-vision'],
            language: null,
            stargazers_count: 0,
            fork: false,
            archived: false,
            private: false,
            created_at: '2025-01-01T00:00:00Z',
            pushed_at: null,
          },
        ]),
      )) as unknown as typeof fetch;
    await syncGithub({ config, cachePath: 'c.json', io, client: client(fetchImpl) });
    expect(read('c.json')?.repos[0]?.topics).toEqual(['computer-vision']);
  });

  it('warns about included names that do not exist', async () => {
    const { io, logs } = memoryIO();
    await syncGithub({
      config: { ...config, include: ['typo'] },
      cachePath: 'c.json',
      io,
      client: client(apiOk([])),
    });
    expect(logs.some((line) => line.includes('"typo"'))).toBe(true);
  });

  it('skips the API while the cache is fresh', async () => {
    const { io } = memoryIO({ 'c.json': cache('2026-10-05T11:30:00Z', ['a']) });
    const result = await syncGithub({
      config,
      cachePath: 'c.json',
      io,
      now: NOW,
      maxAgeMs: 60 * 60 * 1000,
      client: client(apiDown),
    });
    expect(result).toEqual({ source: 'fresh-cache', count: 1 });
  });

  it('keeps the previous cache when GitHub is unreachable', async () => {
    const { io, read } = memoryIO({ 'c.json': cache('2026-01-01T00:00:00Z', ['old']) });
    const result = await syncGithub({ config, cachePath: 'c.json', io, now: NOW, client: client(apiDown) });
    expect(result).toEqual({ source: 'stale-cache', count: 1 });
    expect(read('c.json')?.repos.map((r) => r.name)).toEqual(['old']);
  });

  it('writes an empty list when GitHub is unreachable and there is no cache', async () => {
    const { io, read } = memoryIO();
    const result = await syncGithub({ config, cachePath: 'c.json', io, now: NOW, client: client(apiDown) });
    expect(result).toEqual({ source: 'empty', count: 0 });
    expect(read('c.json')?.repos).toEqual([]);
  });

  it('ignores a cache written for another username', async () => {
    const { io } = memoryIO({ 'c.json': cache('2026-10-05T11:59:00Z', ['x'], 'maybeitsai') });
    const result = await syncGithub({
      config,
      cachePath: 'c.json',
      io,
      now: NOW,
      maxAgeMs: 60 * 60 * 1000,
      client: client(apiDown),
    });
    expect(result.source).toBe('empty');
  });

  it('never falls back to data written by a fixture run', async () => {
    const fixtureCache = JSON.stringify({
      ...JSON.parse(cache('2026-10-05T11:59:00Z', ['fake'])),
      source: 'fixture',
    });
    const { io, read } = memoryIO({ 'c.json': fixtureCache });
    const result = await syncGithub({
      config,
      cachePath: 'c.json',
      io,
      now: NOW,
      maxAgeMs: 60 * 60 * 1000,
      client: client(apiDown),
    });
    expect(result.source).toBe('empty');
    expect(read('c.json')?.repos).toEqual([]);
  });

  it('uses a fixture instead of the API when given', async () => {
    const { io, read } = memoryIO({ 'f.json': cache('2026-10-05T00:00:00Z', ['fixture']) });
    const result = await syncGithub({
      config,
      cachePath: 'c.json',
      io,
      fixturePath: 'f.json',
      client: client(apiDown),
    });
    expect(result).toEqual({ source: 'fixture', count: 1 });
    expect(read('c.json')?.repos[0]?.name).toBe('fixture');
    expect(read('c.json')?.source).toBe('fixture');
  });

  it('rejects an invalid fixture loudly', async () => {
    const { io } = memoryIO({ 'f.json': '{"nope": true}' });
    await expect(syncGithub({ config, cachePath: 'c.json', io, fixturePath: 'f.json' })).rejects.toThrow(
      'Fixture',
    );
  });
});
