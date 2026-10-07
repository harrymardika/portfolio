/**
 * Turn the API's repository list into the projects to show (decision D5):
 * entries from `include` (in that order, with owner descriptions and groups), then repos with the
 * selection topic. Pure: no I/O.
 */
import type { ApiRepo, GithubConfig, GithubRepo, IncludeItem } from './schemas';

export interface SelectionResult {
  readonly entries: GithubRepo[];
  /** Human-readable problems in github.yaml (missing names, excluded or private repos). */
  readonly warnings: string[];
}

/** Map an API repo to a single-repo entry. Blank homepages/descriptions become null. */
export function toGithubRepo(repo: ApiRepo): GithubRepo {
  const homepage = repo.homepage?.trim();
  return {
    name: repo.name,
    title: null,
    summary: null,
    description: repo.description?.trim() || null,
    url: repo.html_url,
    homepage: homepage && /^https?:\/\//.test(homepage) ? homepage : null,
    topics: [...repo.topics],
    language: repo.language,
    stars: repo.stargazers_count,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
    members: [{ name: repo.name, url: repo.html_url }],
  };
}

/** Most frequent non-null value; ties go to the earliest. */
function mostCommon(values: readonly (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: string | null = null;
  for (const [value, count] of counts) if (best === null || count > (counts.get(best) ?? 0)) best = value;
  return best;
}

/** Combine the repos of one project into a single entry linked to the first repo. */
export function groupRepos(title: string, repos: readonly ApiRepo[]): GithubRepo {
  const [primary] = repos;
  if (!primary) throw new Error(`Group "${title}" has no repositories`);
  const pushed = repos.map((r) => r.pushed_at).filter((d): d is string => d !== null);
  return {
    ...toGithubRepo(primary),
    title,
    topics: [...new Set(repos.flatMap((r) => r.topics))],
    language: mostCommon(repos.map((r) => r.language)),
    stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    createdAt: repos.map((r) => r.created_at).sort()[0] ?? primary.created_at,
    pushedAt: pushed.sort().at(-1) ?? null,
    members: repos.map((r) => ({ name: r.name, url: r.html_url })),
  };
}

/**
 * The owner's tags first (cards show only the first few), then GitHub topics; a tag already present in
 * another letter case is skipped.
 */
function mergeTags(topics: readonly string[], tags: readonly string[]): string[] {
  const seen = new Set<string>();
  return [...tags, ...topics].filter((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const itemRepos = (item: IncludeItem): string[] =>
  typeof item === 'string' ? [item] : 'repo' in item ? [item.repo] : item.repos;

export function selectRepos(all: readonly ApiRepo[], config: GithubConfig): SelectionResult {
  const byName = new Map(all.map((repo) => [repo.name, repo]));
  const exclude = new Set(config.exclude);
  const used = new Set<string>();
  const warnings: string[] = [];
  const entries: GithubRepo[] = [];

  const usable = (name: string): ApiRepo | null => {
    const repo = byName.get(name);
    if (!repo) warnings.push(`"${name}" was not found on GitHub (typo, renamed, or private?)`);
    else if (repo.private) warnings.push(`"${name}" is private and is never shown`);
    else if (exclude.has(name)) warnings.push(`"${name}" is both included and excluded; exclude wins`);
    else if (used.has(name)) warnings.push(`"${name}" is listed more than once`);
    else return repo;
    return null;
  };

  for (const item of config.include) {
    const repos = itemRepos(item)
      .map(usable)
      .filter((repo): repo is ApiRepo => repo !== null);
    if (repos.length === 0) continue;
    repos.forEach((repo) => used.add(repo.name));
    const description = typeof item === 'string' ? undefined : item.description;
    const tags = typeof item === 'string' ? [] : (item.tags ?? []);
    const entry =
      typeof item === 'object' && 'title' in item
        ? groupRepos(item.title, repos)
        : toGithubRepo(repos[0] as ApiRepo);
    entries.push({ ...entry, summary: description ?? null, topics: mergeTags(entry.topics, tags) });
  }

  for (const repo of all) {
    if (used.has(repo.name) || repo.private || exclude.has(repo.name)) continue;
    if (!repo.topics.includes(config.topic)) continue;
    if (repo.fork && !config.include_forks) continue;
    if (repo.archived && !config.include_archived) continue;
    used.add(repo.name);
    entries.push(toGithubRepo(repo));
  }

  // The selection topic is bookkeeping, not a technology.
  return {
    entries: entries.map((entry) => ({ ...entry, topics: entry.topics.filter((t) => t !== config.topic) })),
    warnings,
  };
}
