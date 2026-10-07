import type { Project } from './schemas';
import type { Locale } from '@/lib/i18n/locales';

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
 * Which body a case study page renders (T9.3): the Indonesian translation on Indonesian pages when
 * one exists, otherwise the English case study, flagged as a fallback on non-English pages.
 */
export function pickCaseStudyBody<T>(
  english: T,
  translation: T | undefined,
  locale: Locale,
): { entry: T; isFallback: boolean } {
  if (locale === 'en') return { entry: english, isFallback: false };
  return translation ? { entry: translation, isFallback: false } : { entry: english, isFallback: true };
}

/** URL-safe tag key for comparing tags (project categories), e.g. "Next.js" → "next-js". */
export function tagKey(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
