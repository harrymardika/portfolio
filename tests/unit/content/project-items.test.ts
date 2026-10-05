import { describe, expect, it } from 'bun:test';

import { itemTags, itemYear, mergeProjects, normalizeRepoUrl, type Project } from '@/lib/content';

import type { GithubRepo } from '@/lib/github/schemas';

const project = (title: string, extra: Partial<Project> = {}): Project => ({
  title,
  summary: { en: `${title} summary` },
  role: { en: 'Engineer' },
  year: 2025,
  tags: ['YOLO'],
  metrics: [],
  links: {},
  featured: false,
  draft: false,
  ...extra,
});

const repo = (name: string, extra: Partial<GithubRepo> = {}): GithubRepo => ({
  name,
  description: null,
  url: `https://github.com/harrymardika/${name}`,
  homepage: null,
  topics: [],
  language: 'Python',
  stars: 0,
  createdAt: '2024-01-01T00:00:00Z',
  pushedAt: '2025-01-01T00:00:00Z',
  ...extra,
});

describe('normalizeRepoUrl', () => {
  it('ignores case, trailing slashes, and .git', () => {
    expect(normalizeRepoUrl('https://GitHub.com/HarryMardika/Repo.git')).toBe('https://github.com/harrymardika/repo');
    expect(normalizeRepoUrl('https://github.com/harrymardika/repo/')).toBe('https://github.com/harrymardika/repo');
  });
});

describe('mergeProjects', () => {
  it('enriches a case study with its repo and does not list that repo twice', () => {
    const items = mergeProjects(
      [{ id: 'a', data: project('A', { links: { repo: 'https://github.com/harrymardika/a-repo/' } }) }],
      [repo('a-repo', { stars: 5 }), repo('other')],
    );
    expect(items.map((item) => item.kind)).toEqual(['local', 'github']);
    expect(items[0]?.kind === 'local' && items[0].repo?.stars).toBe(5);
    expect(items[1]?.kind === 'github' && items[1].repo.name).toBe('other');
  });

  it('orders case studies first (featured, then newest) and repos by last push', () => {
    const items = mergeProjects(
      [
        { id: 'old', data: project('Old', { year: 2023 }) },
        { id: 'feat', data: project('Feat', { featured: true, order: 1 }) },
      ],
      [repo('stale', { pushedAt: '2024-01-01T00:00:00Z' }), repo('fresh', { pushedAt: '2026-01-01T00:00:00Z' })],
    );
    const names = items.map((item) => (item.kind === 'local' ? item.slug : item.repo.name));
    expect(names).toEqual(['feat', 'old', 'fresh', 'stale']);
  });

  it('falls back to the creation date for repos that were never pushed', () => {
    const items = mergeProjects([], [repo('never', { pushedAt: null, createdAt: '2026-05-01T00:00:00Z' }), repo('x')]);
    expect(items[0]?.kind === 'github' && items[0].repo.name).toBe('never');
  });
});

describe('itemTags and itemYear', () => {
  it('uses language and topics for repos, without duplicates', () => {
    const item = { kind: 'github' as const, repo: repo('r', { language: 'Go', topics: ['cli', 'Go'] }) };
    expect(itemTags(item)).toEqual(['Go', 'cli']);
  });

  it('skips a missing language', () => {
    expect(itemTags({ kind: 'github', repo: repo('r', { language: null }) })).toEqual([]);
  });

  it('uses the case study tags and year for local projects', () => {
    const item = { kind: 'local' as const, slug: 'a', project: project('A', { year: 2026 }), repo: null };
    expect(itemTags(item)).toEqual(['YOLO']);
    expect(itemYear(item)).toBe(2026);
  });

  it('uses the last push year for repos', () => {
    expect(itemYear({ kind: 'github', repo: repo('r', { pushedAt: '2024-12-31T23:00:00Z' }) })).toBe(2024);
    expect(itemYear({ kind: 'github', repo: repo('r', { pushedAt: null, createdAt: '2022-03-01T00:00:00Z' }) })).toBe(2022);
  });
});
