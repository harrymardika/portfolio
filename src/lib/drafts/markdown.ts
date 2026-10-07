/**
 * Turn a checked draft into content/projects/<slug>.md (T8.2). The frontmatter goes through the real
 * project schema, so a file that would break the build is never produced. Published as soon as it is
 * merged (`draft: false`): the pull request is the review step, so an unmerged PR is the draft.
 */
import { dump } from 'js-yaml';

import { projectSchema } from '@/lib/content/schemas/entities';
import type { ApiRepo } from '@/lib/github/schemas';

import type { Draft } from './schema';

/** The year the work happened: last push, else creation. */
export function projectYear(repo: ApiRepo): number {
  return new Date(repo.pushed_at ?? repo.created_at).getUTCFullYear();
}

export function frontmatter(draft: Draft, repo: ApiRepo): Record<string, unknown> {
  const data = {
    title: draft.title,
    summary: draft.summary,
    role: draft.role,
    year: projectYear(repo),
    tags: draft.tags,
    metrics: draft.metrics,
    links: { repo: repo.html_url },
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
export function renderCaseStudy(draft: Draft, repo: ApiRepo): string {
  const yaml = dump(frontmatter(draft, repo), { lineWidth: -1, noRefs: true });
  const result = draft.result.map((line) => `- ${line}`).join('\n');
  return [
    '---',
    yaml.trimEnd(),
    '---',
    '',
    '## Problem',
    draft.problem,
    '',
    '## Approach',
    draft.approach,
    '',
    '## Result',
    result,
    '',
  ].join('\n');
}
