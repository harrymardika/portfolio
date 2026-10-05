import type { EndDate, YearMonth } from './schemas';
import { LOCALE_TAGS, type Locale } from '@/lib/i18n/locales';

/** Current month as `YYYY-MM` in UTC, so builds do not depend on the server's time zone. */
export function toYearMonth(date: Date): YearMonth {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Format `2025-09` as "Sep 2025" (en) or "Sep 2025" / "Agu 2025" (id). */
export function formatYearMonth(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split('-').map(Number);
  if (year === undefined || month === undefined) throw new Error(`Invalid year-month: ${value}`);
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * Format a range such as "Sep 2025 – Dec 2025" or "May 2026 – Present".
 * A range that starts and ends in the same month collapses to a single month.
 * `presentLabel` comes from the UI dictionary so this module stays free of UI strings.
 */
export function formatDateRange(
  range: { start: YearMonth; end: EndDate },
  locale: Locale,
  presentLabel: string,
): string {
  const start = formatYearMonth(range.start, locale);
  if (range.end === 'present') return `${start} – ${presentLabel}`;
  if (range.end === range.start) return start;
  return `${start} – ${formatYearMonth(range.end, locale)}`;
}
