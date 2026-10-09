/**
 * Which projects get an AI case study draft (T8.2, T11.6b): public repos with the portfolio topic from
 * content/github.yaml, or the group they belong to, that have no case study and no open draft branch
 * yet. Pure.
 */
import { normalizeRepoUrl } from '@/lib/content/project-items';
import { selectRepos } from '@/lib/github/select';

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

/**
 * One project to draft (T11.6b, ADR 0016): a single repository, or a group of repositories from
 * content/github.yaml that form one project (one case study, written from every member's README).
 */
export interface DraftCandidate {
  /** File name and branch suffix: the group title or the repo name as a slug. */
  readonly slug: string;
  /** For logs and the pull request: the group title, or the repo name. */
  readonly name: string;
  /** The group title, which replaces the model's title; null for a single repo. */
  readonly title: string | null;
  /** Every repository of the project; the first is the one the case study links. */
  readonly repos: readonly ApiRepo[];
}

export function singleCandidate(repo: ApiRepo): DraftCandidate {
  return { slug: repoSlug(repo.name), name: repo.name, title: null, repos: [repo] };
}

/**
 * Projects that need a draft, in the order of `repos` (newest push first from the API). Groups come from
 * the site's own selection (`selectRepos`), so both agree on which repos form a project and which repo it
 * links: a repo listed twice belongs to its first listing, and archived or forked members stay in.
 * A group is drafted when any member has the topic; its members are never drafted on their own. Single
 * repos keep the ADR 0013 rules. A project is covered when a case study links any of its repos or uses
 * its slug or a member's, and waits while a draft branch for it, or for any member under its old
 * per-repo name, is still open.
 */
export function selectCandidates(
  repos: readonly ApiRepo[],
  config: GithubConfig,
  existing: readonly ExistingProject[],
  branches: readonly string[],
  limit = MAX_DRAFTS_PER_RUN,
): DraftCandidate[] {
  const covered = new Set(
    existing.flatMap((project) => (project.repo ? [normalizeRepoUrl(project.repo)] : [])),
  );
  const slugs = new Set(existing.map((project) => project.slug));
  const open = new Set(branches);
  const eligible = (repo: ApiRepo): boolean =>
    !repo.private &&
    !config.exclude.includes(repo.name) &&
    (config.include_forks || !repo.fork) &&
    (config.include_archived || !repo.archived);

  const byName = new Map(repos.map((repo) => [repo.name, repo]));
  const groupOf = new Map<string, DraftCandidate>();
  for (const entry of selectRepos(repos, config).entries) {
    if (entry.title === null) continue;
    const members = entry.members.flatMap((member) => byName.get(member.name) ?? []);
    const [main] = members;
    if (!main) continue;
    // A title without letters or digits (an empty slug) falls back to the main repo's name.
    const slug = repoSlug(entry.title) || repoSlug(main.name);
    const group: DraftCandidate = { slug, name: entry.title, title: entry.title, repos: members };
    for (const member of members) groupOf.set(member.name, group);
  }

  const candidates: DraftCandidate[] = [];
  const seen = new Set<DraftCandidate>();
  for (const repo of repos) {
    if (!repo.topics.includes(config.topic)) continue;
    const group = groupOf.get(repo.name);
    if (!group && !eligible(repo)) continue;
    const candidate = group ?? singleCandidate(repo);
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const ownSlugs = [candidate.slug, ...candidate.repos.map((member) => repoSlug(member.name))];
    if (candidate.slug === '') continue;
    if (candidate.repos.some((member) => covered.has(normalizeRepoUrl(member.html_url)))) continue;
    if (ownSlugs.some((slug) => slugs.has(slug) || open.has(draftBranch(slug)))) continue;
    candidates.push(candidate);
  }
  return candidates.slice(0, limit);
}
