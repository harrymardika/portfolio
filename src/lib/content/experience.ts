import type { Experience, ExperienceCategory } from './schemas';

/** Categories shown under "Experience"; the rest go under "Leadership & teaching" (mirrors the CV). */
export const PROFESSIONAL_CATEGORIES: readonly ExperienceCategory[] = ['work', 'founder', 'research'];

/** Split experience into professional roles and leadership/teaching roles, keeping order. */
export function splitExperience<T extends Pick<Experience, 'category'>>(
  items: readonly T[],
): { professional: T[]; leadership: T[] } {
  return {
    professional: items.filter((item) => PROFESSIONAL_CATEGORIES.includes(item.category)),
    leadership: items.filter((item) => !PROFESSIONAL_CATEGORIES.includes(item.category)),
  };
}
