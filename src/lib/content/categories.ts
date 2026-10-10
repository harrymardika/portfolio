/**
 * Project categories and search for /projects/ (pure, shared by the page build and its script).
 * Categories come from profile.yaml (`projects.categories`); a project belongs to a category when one
 * of its tags is listed there, ignoring case and punctuation ("Next.js" matches "next-js").
 */
import { tagKey } from './projects';

import type { Profile } from './schemas';

export type ProjectCategory = Profile['projects']['categories'][number];

/** Ids of the categories a project with these tags belongs to, in the categories' order. */
export function itemCategoryIds(tags: readonly string[], categories: readonly ProjectCategory[]): string[] {
  const keys = new Set(tags.map(tagKey));
  return categories.filter((category) => category.tags.some((tag) => keys.has(tagKey(tag)))).map((c) => c.id);
}

/**
 * Categories worth offering as filters, with how many projects each holds. A category with fewer than
 * `minCount` projects filters nothing useful and is left out.
 */
export function usefulCategories(
  tagLists: readonly (readonly string[])[],
  categories: readonly ProjectCategory[],
  minCount = 2,
): { category: ProjectCategory; count: number }[] {
  return categories
    .map((category) => ({
      category,
      count: tagLists.filter((tags) => itemCategoryIds(tags, [category]).length > 0).length,
    }))
    .filter(({ count }) => count >= minCount);
}

/** Lowercase, without accents, single spaces: "Pengenalan  Ekspresi" → "pengenalan ekspresi". */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every word of the query appears somewhere in the text; an empty query matches all. */
export function matchesSearch(text: string, query: string): boolean {
  const haystack = normalizeSearch(text);
  return normalizeSearch(query)
    .split(' ')
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** A project on the home page's sorting line (T13.6): what the 3D card shows and where it goes. */
export interface SortingCard {
  readonly title: string;
  readonly href: string;
  readonly year: string;
  /** Category id: the bin the card is sorted into. */
  readonly bin: string;
}

/**
 * Cards and bins for the sorting line: projects that belong to a category, in the order given
 * (featured first), at most `limit`; each goes to its first category. Bins are the categories that
 * receive a card, in the categories' order. Projects without a category stay off the line.
 */
export function sortingLine<T extends { readonly tags: readonly string[] }>(
  projects: readonly T[],
  categories: readonly ProjectCategory[],
  limit: number,
): { cards: { project: T; bin: string }[]; bins: ProjectCategory[] } {
  const cards = projects
    .map((project) => ({ project, bin: itemCategoryIds(project.tags, categories)[0] }))
    .filter((card): card is { project: T; bin: string } => card.bin !== undefined)
    .slice(0, Math.max(0, limit));
  const used = new Set(cards.map((card) => card.bin));
  return { cards, bins: categories.filter((category) => used.has(category.id)) };
}
