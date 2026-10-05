/**
 * Reusable building blocks for content schemas (docs/04-content-guide.md §2).
 * Error messages are written for the person editing YAML, not for developers.
 */
import { z } from 'astro/zod';

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Text shown to visitors: English is required, Indonesian falls back to English. */
export const localizedText = z.strictObject({
  en: z.string().trim().min(1, 'English text (en) must not be empty'),
  id: z.string().trim().min(1, 'Indonesian text (id) must not be empty; remove the key instead').optional(),
});

/** Lowercase kebab-case identifier, e.g. `crowd-violence-detection`. */
export const slug = z.string().regex(SLUG, 'Use lowercase letters, digits, and dashes, e.g. "my-project"');

/** Month precision date, e.g. `2025-09`. */
export const yearMonth = z.string().regex(YEAR_MONTH, 'Use the YYYY-MM format, e.g. 2025-09');

/** End of a date range: a month, or `present` for ongoing items. */
export const endDate = z.union([yearMonth, z.literal('present')], {
  error: 'Use the YYYY-MM format or the word "present"',
});

export const year = z
  .number({ error: 'Use a four-digit year without quotes, e.g. 2025' })
  .int()
  .min(1990)
  .max(2100);

/** Award dates may be a bare year (`2025`) or a month (`2025-04`); normalized to a string. */
export const yearOrYearMonth = z.union([year.transform(String), yearMonth], {
  error: 'Use a year (2025) or the YYYY-MM format (2025-04)',
});

/** Visibility flags shared by list items. */
export const visibility = {
  show_on_web: z.boolean().default(true),
  show_on_cv: z.boolean().default(true),
};

/** Fails when `end` is before `start`. `present` is always after any month. */
export function isValidRange(start: string, end: string): boolean {
  return end === 'present' || start <= end;
}

export type LocalizedText = z.infer<typeof localizedText>;
export type YearMonth = z.infer<typeof yearMonth>;
export type EndDate = z.infer<typeof endDate>;
