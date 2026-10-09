/**
 * Turn a checked draft into content/projects/<slug>.md (T8.2). The frontmatter goes through the real
 * project schema, so a file that would break the build is never produced. Published as soon as it is
 * merged (`draft: false`): the pull request is the review step, so an unmerged PR is the draft.
 */
import { dump } from 'js-yaml';

import { projectSchema } from '@/lib/content/schemas/entities';
import type { ApiRepo } from '@/lib/github/schemas';

import type { DraftCandidate } from './candidates';
import type { Draft } from './schema';

/** The year the work happened: last push, else creation. */
export function projectYear(repo: ApiRepo): number {
  return new Date(repo.pushed_at ?? repo.created_at).getUTCFullYear();
}

/**
 * A group's title replaces the model's, its year is the latest of its repos, and it links its first repo
 * (the one its card on the site links, ADR 0016).
 */
export function frontmatter(draft: Draft, candidate: DraftCandidate): Record<string, unknown> {
  const [main] = candidate.repos;
  if (!main) throw new Error(`${candidate.name} has no repository`);
  const data = {
    title: candidate.title ?? draft.title,
    summary: draft.summary,
    role: draft.role,
    year: Math.max(...candidate.repos.map(projectYear)),
    tags: draft.tags,
    metrics: draft.metrics,
    links: { repo: main.html_url },
    featured: false,
    // Owner decision (ADR 0013): merging the pull request publishes the case study.
    draft: false,
  };
  projectSchema.parse(data); // throws with the exact field if anything is off
  return data;
}

/**
 * The case study file. Provenance (provider, model, date) lives in the pull request and commit, not in
 * the body: Markdown keeps HTML comments, so a note here would end up in the public page.
 */
export function renderCaseStudy(draft: Draft, candidate: DraftCandidate): string {
  const yaml = dump(frontmatter(draft, candidate), { lineWidth: -1, noRefs: true });
  return withSections(yaml, draft, 'en', ['Problem', 'Approach', 'Result']);
}

/** The Indonesian body, content/projects/id/<slug>.md (T9.3): same sections as the English file. */
export function renderCaseStudyId(draft: Draft, candidate?: DraftCandidate): string {
  const yaml = dump({ title: candidate?.title ?? draft.title }, { lineWidth: -1 });
  return withSections(yaml, draft, 'id', ['Masalah', 'Pendekatan', 'Hasil']);
}

function withSections(
  yaml: string,
  draft: Draft,
  language: 'en' | 'id',
  [problem, approach, result]: readonly [string, string, string],
): string {
  return [
    '---',
    yaml.trimEnd(),
    '---',
    '',
    `## ${problem}`,
    draft.problem[language],
    '',
    `## ${approach}`,
    draft.approach[language],
    '',
    `## ${result}`,
    draft.result.map((line) => `- ${line[language]}`).join('\n'),
    '',
  ].join('\n');
}
