import type { ApiRepo, GithubConfig, GithubRepo } from './schemas';

/**
 * Repos to show: (include ∪ repos with the topic) − exclude. Private repos never pass.
 * Forks and archived repos are skipped unless enabled in the config or listed in `include`.
 * Result keeps the order of `include`, then the API order (most recently pushed first).
 */
export function selectRepos(repos: readonly ApiRepo[], config: GithubConfig): ApiRepo[] {
  const include = new Set(config.include);
  const exclude = new Set(config.exclude);
  const candidates = repos.filter((repo) => {
    if (repo.private || exclude.has(repo.name)) return false;
    if (include.has(repo.name)) return true;
    if (!repo.topics.includes(config.topic)) return false;
    if (repo.fork && !config.include_forks) return false;
    if (repo.archived && !config.include_archived) return false;
    return true;
  });
  const rank = (repo: ApiRepo): number => {
    const index = config.include.indexOf(repo.name);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return candidates
    .map((repo, order) => ({ repo, order }))
    .sort((a, b) => rank(a.repo) - rank(b.repo) || a.order - b.order)
    .map(({ repo }) => repo);
}

/** Names in `include` that GitHub did not return (typo, renamed, or private). */
export function missingIncludes(repos: readonly ApiRepo[], config: GithubConfig): string[] {
  const names = new Set(repos.map((repo) => repo.name));
  return config.include.filter((name) => !names.has(name));
}

/** Map an API repo to the shape the site uses. Blank homepages become null. */
export function toGithubRepo(repo: ApiRepo): GithubRepo {
  const homepage = repo.homepage?.trim();
  return {
    name: repo.name,
    description: repo.description?.trim() || null,
    url: repo.html_url,
    homepage: homepage && /^https?:\/\//.test(homepage) ? homepage : null,
    topics: [...repo.topics],
    language: repo.language,
    stars: repo.stargazers_count,
    createdAt: repo.created_at,
    pushedAt: repo.pushed_at,
  };
}
