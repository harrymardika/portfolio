/**
 * Public statistics summary: the shape served by GET /api/stats/summary and shown on /stats/.
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

/** One tracking link (?ref=) in the owner-only report from GET /api/stats/private. */
export const refReportSchema = z.strictObject({
  ref: z.string(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  visits: z.number().int().min(0),
  pageviews: z.number().int().min(0),
  downloadedCv: z.boolean(),
  downloadedPortfolio: z.boolean(),
});

const askOutcomes = z.strictObject({
  answered: z.number().int().min(0),
  unavailable: z.number().int().min(0),
  limit: z.number().int().min(0),
});

/** Chatbot questions by outcome (T11.4): counts only, never text. */
export const askReportSchema = z.strictObject({ total: askOutcomes, last30Days: askOutcomes });

export const privateReportSchema = z.strictObject({
  generatedAt: z.string(),
  refs: z.array(refReportSchema),
  /** Optional so the report script still reads a stats service from before T11.4. */
  asks: askReportSchema.optional(),
});

export type RefReport = z.infer<typeof refReportSchema>;
export type AskReport = z.infer<typeof askReportSchema>;

/** One line per period: answered, unavailable (fallback shown), and stopped by the usage limits. */
export function formatAskReport(asks: AskReport): string {
  const line = (label: string, o: AskReport['total']): string =>
    `${label}: ${o.answered + o.unavailable + o.limit} questions (${o.answered} answered, ${o.unavailable} unavailable, ${o.limit} over the limit)`;
  return [line('Last 30 days', asks.last30Days), line('All time', asks.total)].join('\n');
}

/** Plain-text table for the terminal, newest first. Times in UTC, minute precision. */
export function formatRefReport(refs: readonly RefReport[]): string {
  if (refs.length === 0) return 'No tracking links have been opened yet.';
  const time = (iso: string): string => iso.slice(0, 16).replace('T', ' ');
  const rows = [
    ['ref', 'first opened (UTC)', 'last opened (UTC)', 'visits', 'pages', 'CV', 'portfolio'],
    ...[...refs]
      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
      .map((r) => [
        r.ref,
        time(r.firstSeen),
        time(r.lastSeen),
        String(r.visits),
        String(r.pageviews),
        r.downloadedCv ? 'yes' : '-',
        r.downloadedPortfolio ? 'yes' : '-',
      ]),
  ];
  const widths =
    rows[0]?.map((_, column) => Math.max(...rows.map((row) => (row[column] ?? '').length))) ?? [];
  return rows
    .map((row) =>
      row
        .map((cell, column) => cell.padEnd(widths[column] ?? 0))
        .join('  ')
        .trimEnd(),
    )
    .join('\n');
}
