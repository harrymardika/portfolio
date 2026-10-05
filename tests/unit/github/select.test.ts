import { describe, expect, it } from 'bun:test';

import { githubConfigSchema, missingIncludes, selectRepos, toGithubRepo, type ApiRepo } from '@/lib/github';

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

const config = githubConfigSchema.parse({ username: 'harrymardika', topic: 'portfolio' });

describe('selectRepos', () => {
  it('selects repos with the topic and those listed in include', () => {
    const repos = [repo('a', { topics: ['portfolio'] }), repo('b'), repo('c')];
    const names = selectRepos(repos, { ...config, include: ['c'] }).map((r) => r.name);
    expect(names).toEqual(['c', 'a']);
  });

  it('removes excluded repos even when they have the topic or are included', () => {
    const repos = [repo('a', { topics: ['portfolio'] }), repo('b')];
    expect(selectRepos(repos, { ...config, include: ['b'], exclude: ['a', 'b'] })).toEqual([]);
  });

  it('skips forks and archived repos found by topic unless enabled', () => {
    const repos = [
      repo('fork', { topics: ['portfolio'], fork: true }),
      repo('old', { topics: ['portfolio'], archived: true }),
    ];
    expect(selectRepos(repos, config)).toEqual([]);
    expect(selectRepos(repos, { ...config, include_forks: true, include_archived: true })).toHaveLength(2);
  });

  it('keeps forks and archived repos that are explicitly included', () => {
    expect(selectRepos([repo('fork', { fork: true })], { ...config, include: ['fork'] })).toHaveLength(1);
  });

  it('never selects private repos', () => {
    expect(selectRepos([repo('secret', { private: true })], { ...config, include: ['secret'] })).toEqual([]);
  });

  it('orders included repos by the include list, then by API order', () => {
    const repos = [repo('x', { topics: ['portfolio'] }), repo('second'), repo('first')];
    const names = selectRepos(repos, { ...config, include: ['first', 'second'] }).map((r) => r.name);
    expect(names).toEqual(['first', 'second', 'x']);
  });
});

describe('missingIncludes', () => {
  it('reports included names that GitHub did not return', () => {
    expect(missingIncludes([repo('a')], { ...config, include: ['a', 'typo'] })).toEqual(['typo']);
  });
});

describe('toGithubRepo', () => {
  it('maps API fields to the site shape', () => {
    expect(toGithubRepo(repo('a', { stargazers_count: 3, homepage: 'https://a.dev' }))).toEqual({
      name: 'a',
      description: 'a description',
      url: 'https://github.com/harrymardika/a',
      homepage: 'https://a.dev',
      topics: [],
      language: 'Python',
      stars: 3,
      createdAt: '2025-01-01T00:00:00Z',
      pushedAt: '2025-06-01T00:00:00Z',
    });
  });

  it('turns blank or non-http homepages and descriptions into null', () => {
    const mapped = toGithubRepo(repo('a', { homepage: '  ', description: ' ' }));
    expect(mapped.homepage).toBeNull();
    expect(mapped.description).toBeNull();
    expect(toGithubRepo(repo('b', { homepage: 'example.com' })).homepage).toBeNull();
  });
});
