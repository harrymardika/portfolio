/**
 * One run of the case study drafter (T8.2, T11.6b): pick projects, draft each from its READMEs, and hand
 * every finished file to `publish` (a pull request in CI, stdout in a dry run). All I/O is injected.
 */
import type { ApiRepo, GithubConfig } from '@/lib/github/schemas';

import { selectCandidates, type DraftCandidate, type ExistingProject } from './candidates';
import { renderCaseStudy, renderCaseStudyId } from './markdown';
import { buildPrompt, type Readme } from './prompt';
import { generateDraft, type Provider } from './providers';
import { groundMetrics } from './schema';

export interface RunIO {
  readonly listRepos: () => Promise<ApiRepo[]>;
  readonly readme: (repo: ApiRepo) => Promise<string | null>;
  readonly existing: () => Promise<ExistingProject[]>;
  readonly draftBranches: () => Promise<string[]>;
  readonly publish: (draft: PublishedDraft) => Promise<void>;
  readonly log: (message: string) => void;
  /** Problems the owner should see (CI: workflow annotations, readable without signing in). */
  readonly warn: (message: string) => void;
  readonly today: () => string;
}

export interface PublishedDraft {
  readonly slug: string;
  /** The group title, or the repo name. */
  readonly name: string;
  /** Every repository of the project; the first is the one the case study links. */
  readonly repos: readonly ApiRepo[];
  readonly markdown: string;
  /** The Indonesian body for content/projects/id/<slug>.md. */
  readonly markdownId: string;
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
    io.log('drafts: no DRAFT_GEMINI_API_KEY or DRAFT_GROQ_API_KEY; nothing to do');
    return summary;
  }
  const [repos, existing, branches] = await Promise.all([io.listRepos(), io.existing(), io.draftBranches()]);
  const candidates = selectCandidates(repos, config, existing, branches);
  io.log(
    `drafts: ${candidates.length} project(s) need a case study${candidates.length ? `: ${candidates.map((c) => c.name).join(', ')}` : ''}`,
  );

  for (const candidate of candidates) {
    try {
      const outcome = await draftOne(candidate, providers, io);
      if (outcome === true) summary.drafted.push(candidate.slug);
      else summary.skipped.push({ repo: candidate.name, reason: outcome });
    } catch (error) {
      // One project's failure (GitHub outage, invalid frontmatter, push rejected) never stops the others.
      summary.skipped.push({ repo: candidate.name, reason: (error as Error).message });
    }
  }
  for (const { repo, reason } of summary.skipped) io.warn(`drafts: skipped ${repo}: ${reason}`);
  return summary;
}

/**
 * Every README of the project (null: the repo has none). A fetch that fails skips the whole project for
 * this run, so the next run retries with complete input: an open draft branch would otherwise keep a
 * weaker draft written without that README.
 */
async function fetchReadmes(candidate: DraftCandidate, io: RunIO): Promise<Readme[]> {
  const texts = await Promise.all(candidate.repos.map((repo) => io.readme(repo)));
  return candidate.repos.flatMap((repo, index) => {
    const text = texts[index];
    return text ? [{ repo, text }] : [];
  });
}

/** Draft and publish one project; returns true, or the reason it was skipped. */
async function draftOne(
  candidate: DraftCandidate,
  providers: readonly Provider[],
  io: RunIO,
): Promise<true | string> {
  const readmes = await fetchReadmes(candidate, io);
  if (readmes.map((readme) => readme.text.trim()).join('').length < 200)
    return 'README missing or too short to describe the project';
  const { prompt, read } = buildPrompt(candidate, readmes);
  const result = await generateDraft(providers, prompt);
  for (const failure of result.failures) io.warn(`drafts: ${candidate.name}: ${failure}`);
  if (!result.ok) return 'every provider failed';
  // Ground numbers in the part of the READMEs the model actually read.
  const draft = groundMetrics(result.draft, read);
  await io.publish({
    slug: candidate.slug,
    name: candidate.name,
    repos: candidate.repos,
    markdown: renderCaseStudy(draft, candidate),
    markdownId: renderCaseStudyId(draft, candidate),
    provider: result.provider,
    model: result.model,
    date: io.today(),
    droppedMetrics: result.draft.metrics.length - draft.metrics.length,
  });
  return true;
}
