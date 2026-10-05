/**
 * Public statistics summary: the shape served by GET /api/stats/summary and shown on /homelab.
 * One schema for the service (types) and the page (validating what it receives).
 */
import { z } from 'astro/zod';

import { LOCALE_TAGS, type Locale } from '@/lib/i18n/locales';

const ranked = z.array(z.strictObject({ key: z.string(), count: z.number().int().min(0) }));

export const summarySchema = z.strictObject({
  generatedAt: z.string(),
  /** First day with data (YYYY-MM-DD), null when empty. */
  since: z.string().nullable(),
  visitors: z.strictObject({ total: z.number().int().min(0), last30Days: z.number().int().min(0) }),
  pageviews: z.strictObject({ total: z.number().int().min(0), last30Days: z.number().int().min(0) }),
  downloads: z.strictObject({ cv: z.number().int().min(0), portfolio: z.number().int().min(0) }),
  topPages: ranked,
  topReferrers: ranked,
  topCountries: ranked,
});

export type Summary = z.infer<typeof summarySchema>;
export type Ranked = Summary['topPages'][number];

/** 1234 → "1,234" (en) / "1.234" (id). */
export function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale]).format(value);
}

/** "ID" → "Indonesia" (en) / "Indonesia" (id); unknown codes are returned unchanged. */
export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([LOCALE_TAGS[locale]], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** "2026-10-05" → "Oct 2026" / "Okt 2026". */
export function formatSince(day: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
}
