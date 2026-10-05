/**
 * Projects shown on the site: local case studies (content/projects) merged with selected GitHub
 * repositories (src/data/generated/github.json). Pure; queries.ts supplies the data.
 */
import { compareProjects } from './projects';

import type { Project } from './schemas';
import type { GithubRepo } from '@/lib/github/schemas';

export type ProjectItem =
  | { readonly kind: 'local'; readonly slug: string; readonly project: Project; readonly repo: GithubRepo | null }
  | { readonly kind: 'github'; readonly repo: GithubRepo };

/** Compare GitHub URLs regardless of case, trailing slash, or a `.git` suffix. */
export function normalizeRepoUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/\.git$/, '')
    .replace(/\/+$/, '');
}

/**
 * Local projects first (featured, then newest), each enriched with its GitHub repo when
 * `links.repo` matches. Repos without a case study follow, most recently pushed first.
 */
export function mergeProjects(
  local: readonly { id: string; data: Project }[],
  repos: readonly GithubRepo[],
): ProjectItem[] {
  // A case study can point at any repo of a grouped project.
  const byUrl = new Map(
    repos.flatMap((repo) => repo.members.map((member) => [normalizeRepoUrl(member.url), repo] as const)),
  );
  const claimed = new Set<GithubRepo>();

  const localItems: ProjectItem[] = [...local]
    .sort((a, b) => compareProjects(a.data, b.data))
    .map((entry) => {
      const key = entry.data.links.repo ? normalizeRepoUrl(entry.data.links.repo) : null;
      const repo = key ? (byUrl.get(key) ?? null) : null;
      if (repo) claimed.add(repo);
      return { kind: 'local', slug: entry.id, project: entry.data, repo };
    });

  const githubItems: ProjectItem[] = repos
    .filter((repo) => !claimed.has(repo))
    .sort((a, b) => (b.pushedAt ?? b.createdAt).localeCompare(a.pushedAt ?? a.createdAt))
    .map((repo) => ({ kind: 'github', repo }));

  return [...localItems, ...githubItems];
}

/** Tags for filtering and display. GitHub repos use their language plus topics, without duplicates. */
export function itemTags(item: ProjectItem): string[] {
  if (item.kind === 'local') return [...item.project.tags];
  const tags = [item.repo.language, ...item.repo.topics];
  return [...new Set(tags.filter((tag): tag is string => Boolean(tag)))];
}

/** Year shown on the card: the case study's year, or the repo's last push (creation if never pushed). */
export function itemYear(item: ProjectItem): number {
  if (item.kind === 'local') return item.project.year;
  return new Date(item.repo.pushedAt ?? item.repo.createdAt).getUTCFullYear();
}
