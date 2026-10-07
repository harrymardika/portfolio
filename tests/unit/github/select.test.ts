import { describe, expect, it } from 'bun:test';

import { githubConfigSchema, groupRepos, selectRepos, toGithubRepo, type ApiRepo } from '@/lib/github';

const repo = (name: string, extra: Partial<ApiRepo> = {}): ApiRepo => ({
  name,
  description: `${name} description`,
  html_url: `https://github.com/harrymardika/${name}`,
  homepage: null,
  topics: [],
  language: 'Python',
  stargazers_count: 0,
  fork: false,
  archived: false,
  private: false,
  created_at: '2025-01-01T00:00:00Z',
  pushed_at: '2025-06-01T00:00:00Z',
  ...extra,
});

const config = (extra: Record<string, unknown> = {}) =>
  githubConfigSchema.parse({ username: 'harrymardika', topic: 'portfolio', ...extra });
const names = (result: ReturnType<typeof selectRepos>) => result.entries.map((e) => e.title ?? e.name);

describe('githubConfigSchema', () => {
  it('accepts names, repos with descriptions, and groups', () => {
    expect(() =>
      config({
        include: ['a', { repo: 'b', description: { en: 'B', id: 'B' } }, { title: 'G', repos: ['c', 'd'] }],
      }),
    ).not.toThrow();
  });

  it('rejects a group with a single repo and unknown keys', () => {
    expect(() => config({ include: [{ title: 'G', repos: ['c'] }] })).toThrow();
    expect(() => config({ include: [{ repo: 'b', descripton: { en: 'typo' } }] })).toThrow();
  });
});

describe('selectRepos', () => {
  it('shows included entries in order, then repos with the topic', () => {
    const all = [repo('topic', { topics: ['portfolio'] }), repo('second'), repo('first'), repo('ignored')];
    expect(names(selectRepos(all, config({ include: ['first', 'second'] })))).toEqual([
      'first',
      'second',
      'topic',
    ]);
  });

  it('uses the owner description and keeps the GitHub one as a fallback', () => {
    const [entry] = selectRepos(
      [repo('a')],
      config({ include: [{ repo: 'a', description: { en: 'Mine' } }] }),
    ).entries;
    expect(entry?.summary).toEqual({ en: 'Mine' });
    expect(entry?.description).toBe('a description');
  });

  it('puts the owner tags before the GitHub topics, skipping repeats in any letter case', () => {
    const all = [repo('a', { topics: ['nlp'] }), repo('b'), repo('c', { topics: ['rag'] })];
    const { entries } = selectRepos(
      all,
      config({
        include: [
          { repo: 'a', tags: ['NLP', 'nlp', 'BERT'] },
          { title: 'G', repos: ['b', 'c'], tags: ['LLM'] },
        ],
      }),
    );
    expect(entries.map((e) => e.topics)).toEqual([
      ['NLP', 'BERT'],
      ['LLM', 'rag'],
    ]);
  });

  it('combines a group into one entry linked to its first repo', () => {
    const all = [
      repo('api', { language: 'Python', stargazers_count: 2, pushed_at: '2025-03-01T00:00:00Z' }),
      repo('web', { language: 'TypeScript', stargazers_count: 1, pushed_at: '2025-09-01T00:00:00Z' }),
      repo('docs', { language: 'Python', created_at: '2024-01-01T00:00:00Z' }),
    ];
    const result = selectRepos(
      all,
      config({ include: [{ title: 'Chatbot', repos: ['docs', 'api', 'web'] }] }),
    );
    expect(result.entries).toHaveLength(1);
    const [group] = result.entries;
    expect(group?.title).toBe('Chatbot');
    expect(group?.url).toBe('https://github.com/harrymardika/docs');
    expect(group?.members.map((m) => m.name)).toEqual(['docs', 'api', 'web']);
    expect(group?.stars).toBe(3);
    expect(group?.language).toBe('Python');
    expect(group?.pushedAt).toBe('2025-09-01T00:00:00Z');
    expect(group?.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('does not list a grouped repo again because of its topic', () => {
    const all = [repo('a', { topics: ['portfolio'] }), repo('b')];
    expect(names(selectRepos(all, config({ include: [{ title: 'G', repos: ['a', 'b'] }] })))).toEqual(['G']);
  });

  it('warns about missing, private, excluded, and duplicate names, and skips them', () => {
    const all = [repo('ok'), repo('secret', { private: true }), repo('nope')];
    const result = selectRepos(
      all,
      config({ include: ['typo', 'secret', 'nope', 'ok', 'ok'], exclude: ['nope'] }),
    );
    expect(names(result)).toEqual(['ok']);
    expect(result.warnings).toHaveLength(4);
    expect(result.warnings.join('\n')).toContain('"typo" was not found');
  });

  it('keeps a group when only some of its repos exist', () => {
    const result = selectRepos([repo('a')], config({ include: [{ title: 'G', repos: ['a', 'missing'] }] }));
    expect(result.entries[0]?.members.map((m) => m.name)).toEqual(['a']);
    expect(result.warnings).toHaveLength(1);
  });

  it('skips forks and archived repos found by topic unless enabled, but not when included', () => {
    const all = [
      repo('fork', { topics: ['portfolio'], fork: true }),
      repo('old', { topics: ['portfolio'], archived: true }),
    ];
    expect(selectRepos(all, config()).entries).toEqual([]);
    expect(selectRepos(all, config({ include_forks: true, include_archived: true })).entries).toHaveLength(2);
    expect(selectRepos(all, config({ include: ['fork'] })).entries).toHaveLength(1);
  });

  it('removes the selection topic from displayed topics', () => {
    const [entry] = selectRepos([repo('a', { topics: ['portfolio', 'yolo'] })], config()).entries;
    expect(entry?.topics).toEqual(['yolo']);
  });
});

describe('toGithubRepo and groupRepos', () => {
  it('maps a single repo, turning blank or non-http values into null', () => {
    const mapped = toGithubRepo(repo('a', { homepage: 'example.com', description: ' ' }));
    expect(mapped).toMatchObject({
      name: 'a',
      title: null,
      summary: null,
      homepage: null,
      description: null,
    });
    expect(mapped.members).toEqual([{ name: 'a', url: 'https://github.com/harrymardika/a' }]);
    expect(toGithubRepo(repo('b', { homepage: 'https://b.dev' })).homepage).toBe('https://b.dev');
  });

  it('refuses an empty group', () => {
    expect(() => groupRepos('Empty', [])).toThrow('no repositories');
  });
});
