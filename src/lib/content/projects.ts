import type { Project } from './schemas';

type ProjectFlags = Pick<Project, 'draft' | 'featured' | 'order' | 'year' | 'title'>;

/** Drafts are never shown on the website or in PDFs. */
export function isPublished(project: Pick<Project, 'draft'>): boolean {
  return !project.draft;
}

/** Featured projects first (by `order`), then newest year, then title A–Z. */
export function compareProjects(a: ProjectFlags, b: ProjectFlags): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB || b.year - a.year || a.title.localeCompare(b.title);
}

/**
 * Tags used by at least `minCount` projects, most used first, then A–Z.
 * A tag on a single project filters nothing useful, so the filter uses minCount = 2.
 */
export function collectTags(projects: readonly Pick<Project, 'tags'>[], minCount = 1): string[] {
  const counts = new Map<string, number>();
  for (const tag of projects.flatMap((project) => project.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

/** Projects carrying `tag`; all projects when `tag` is null. */
export function filterByTag<T extends Pick<Project, 'tags'>>(projects: readonly T[], tag: string | null): T[] {
  return tag === null ? [...projects] : projects.filter((project) => project.tags.includes(tag));
}

/** URL-safe tag key used in `data-tags` and filter buttons, e.g. "Next.js" → "next-js". */
export function tagKey(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
