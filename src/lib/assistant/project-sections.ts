/**
 * Knowledge sections for the Projects page and the CVs by role (T11.1). Pure.
 */
import { itemYear, localize, type ProjectItem } from '@/lib/content';
import type { CvVariant, LocalizedText } from '@/lib/content';

import { both, lines, optionalDetail, plainMarkdown } from './text';

import type { KnowledgeSection } from './knowledge';

/**
 * A case study links to its own page with the summary in `text`; metrics, tags, links, and the body are
 * `detail`, since the compact answers link to that page anyway. A GitHub-only repo links to /projects/.
 * The detail is English only: the model answers in either language from it, and both bodies would
 * double the largest part of the full knowledge (ADR 0022).
 */
export function projectSection(
  item: ProjectItem,
  caseStudies: Readonly<Record<string, LocalizedText>>,
): KnowledgeSection {
  if (item.kind === 'github') {
    const { repo } = item;
    return {
      key: `repo/${repo.name}`,
      path: '/projects/',
      text: both((locale) => {
        const about = repo.summary ? localize(repo.summary, locale) : repo.description;
        return `${repo.title ?? repo.name} (GitHub, ${itemYear(item)})${about ? `: ${about}` : ''}`;
      }),
      detail: { en: `Code: ${repo.members.map((m) => m.url).join(', ')}` },
    };
  }
  const { project, slug } = item;
  const body = caseStudies[slug];
  const links = Object.entries(project.links).map(([kind, url]) => `${kind} ${url}`);
  return {
    key: `project/${slug}`,
    path: `/projects/${slug}/`,
    text: both(
      (locale) =>
        `${project.title} (${project.year}), ${localize(project.role, locale)}: ${localize(project.summary, locale)}`,
    ),
    ...optionalDetail({
      en: lines(
        project.metrics.length > 0 &&
          `Metrics: ${project.metrics.map((m) => `${m.value} ${localize(m.label, 'en')}`).join('; ')}`,
        project.tags.length > 0 && `Tags: ${project.tags.join(', ')}`,
        links.length > 0 && `Links: ${links.join(', ')}`,
        body && plainMarkdown(localize(body, 'en')),
      ),
    }),
  };
}

/** The CVs by role listed on /cv/; nothing while there are no variants. */
export function cvSections(variants: readonly CvVariant[]): KnowledgeSection[] {
  if (variants.length === 0) return [];
  return [
    {
      key: 'cv-variants',
      path: '/cv/',
      text: both((locale) =>
        variants.map((v) => `- ${localize(v.name, locale)}: ${localize(v.role, locale)}`).join('\n'),
      ),
    },
  ];
}
