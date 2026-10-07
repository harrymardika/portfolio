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

/** URL-safe tag key for comparing tags (project categories), e.g. "Next.js" → "next-js". */
export function tagKey(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
