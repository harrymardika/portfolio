/**
 * One run of the case study drafter (T8.2): pick candidates, draft each from its README, and hand
 * every finished file to `publish` (a pull request in CI, stdout in a dry run). All I/O is injected.
 */
import type { ApiRepo, GithubConfig } from '@/lib/github/schemas';

import { repoSlug, selectCandidates, type ExistingProject } from './candidates';
import { renderCaseStudy } from './markdown';
import { buildPrompt, README_LIMIT } from './prompt';
import { generateDraft, type Provider } from './providers';
import { groundMetrics } from './schema';

export interface RunIO {
  readonly listRepos: () => Promise<ApiRepo[]>;
  readonly readme: (repo: ApiRepo) => Promise<string | null>;
  readonly existing: () => Promise<ExistingProject[]>;
  readonly draftBranches: () => Promise<string[]>;
  readonly publish: (draft: PublishedDraft) => Promise<void>;
  readonly log: (message: string) => void;
  readonly today: () => string;
}

export interface PublishedDraft {
  readonly slug: string;
  readonly repo: ApiRepo;
  readonly markdown: string;
  readonly provider: string;
  readonly model: string;
  readonly date: string;
  readonly droppedMetrics: number;
}

export interface RunSummary {
  readonly drafted: string[];
  readonly skipped: { repo: string; reason: string }[];
}

export async function runDrafts(
  config: GithubConfig,
  providers: readonly Provider[],
  io: RunIO,
): Promise<RunSummary> {
  const summary: RunSummary = { drafted: [], skipped: [] };
  if (providers.length === 0) {
    io.log('drafts: no GEMINI_API_KEY or GROQ_API_KEY; nothing to do');
    return summary;
  }
  const [repos, existing, branches] = await Promise.all([io.listRepos(), io.existing(), io.draftBranches()]);
  const candidates = selectCandidates(repos, config, existing, branches);
  io.log(
    `drafts: ${candidates.length} repo(s) need a case study${candidates.length ? `: ${candidates.map((r) => r.name).join(', ')}` : ''}`,
  );

  for (const repo of candidates) {
    try {
      const outcome = await draftOne(repo, providers, io);
      if (outcome === true) summary.drafted.push(repoSlug(repo.name));
      else summary.skipped.push({ repo: repo.name, reason: outcome });
    } catch (error) {
      // One repo's failure (GitHub outage, invalid frontmatter, push rejected) never stops the others.
      summary.skipped.push({ repo: repo.name, reason: (error as Error).message });
    }
  }
  for (const { repo, reason } of summary.skipped) io.log(`drafts: skipped ${repo}: ${reason}`);
  return summary;
}

/** Draft and publish one repository; returns true, or the reason it was skipped. */
async function draftOne(repo: ApiRepo, providers: readonly Provider[], io: RunIO): Promise<true | string> {
  const readme = await io.readme(repo);
  if (!readme || readme.trim().length < 200) return 'README missing or too short to describe the project';
  const prompt = buildPrompt(repo, readme);
  const result = await generateDraft(providers, prompt);
  for (const failure of result.failures) io.log(`drafts: ${repo.name}: ${failure}`);
  if (!result.ok) return 'every provider failed';
  // Ground numbers in the part of the README the model actually read.
  const draft = groundMetrics(result.draft, readme.slice(0, README_LIMIT));
  const markdown = renderCaseStudy(draft, repo);
  await io.publish({
    slug: repoSlug(repo.name),
    repo,
    markdown,
    provider: result.provider,
    model: result.model,
    date: io.today(),
    droppedMetrics: result.draft.metrics.length - draft.metrics.length,
  });
  return true;
}
