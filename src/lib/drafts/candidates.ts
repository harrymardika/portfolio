/**
 * Which repositories get an AI case study draft (T8.2): public repos with the portfolio topic from
 * content/github.yaml that have no case study and no open draft branch yet. Pure.
 */
import type { ApiRepo, GithubConfig } from '@/lib/github/schemas';

/** Keeps quota use and review work small; the next run picks up the rest. */
export const MAX_DRAFTS_PER_RUN = 2;
export const DRAFT_BRANCH_PREFIX = 'drafts/case-study-';

export interface ExistingProject {
  /** File name without `.md`. */
  readonly slug: string;
  /** `links.repo` of the case study, if any. */
  readonly repo?: string | undefined;
}

/** `My_Repo.v2` → `my-repo-v2`, a valid content slug. */
export function repoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function draftBranch(slug: string): string {
  return `${DRAFT_BRANCH_PREFIX}${slug}`;
}

const normalizeUrl = (url: string): string => url.toLowerCase().replace(/\/+$/, '');

export function selectCandidates(
  repos: readonly ApiRepo[],
  config: GithubConfig,
  existing: readonly ExistingProject[],
  branches: readonly string[],
  limit = MAX_DRAFTS_PER_RUN,
): ApiRepo[] {
  const covered = new Set(existing.flatMap((project) => (project.repo ? [normalizeUrl(project.repo)] : [])));
  const slugs = new Set(existing.map((project) => project.slug));
  const open = new Set(branches);
  return repos
    .filter((repo) => !repo.private && repo.topics.includes(config.topic))
    .filter((repo) => !config.exclude.includes(repo.name))
    .filter((repo) => (config.include_forks || !repo.fork) && (config.include_archived || !repo.archived))
    .filter((repo) => !covered.has(normalizeUrl(repo.html_url)) && !slugs.has(repoSlug(repo.name)))
    .filter((repo) => repoSlug(repo.name) !== '' && !open.has(draftBranch(repoSlug(repo.name))))
    .slice(0, limit);
}
