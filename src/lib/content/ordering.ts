import type { EndDate, YearMonth } from './schemas';

/** Sort key where ongoing items (`present`) rank above any finished month. */
const endKey = (end: EndDate): string => (end === 'present' ? '9999-12' : end);

/** Newest first: ongoing items, then latest end date, then latest start date. */
export function compareRangesDesc(
  a: { start: YearMonth; end: EndDate },
  b: { start: YearMonth; end: EndDate },
): number {
  return endKey(b.end).localeCompare(endKey(a.end)) || b.start.localeCompare(a.start);
}

/** Newest first for `YYYY` or `YYYY-MM` strings. A bare year sorts as December of that year. */
export function compareDatesDesc(a: string, b: string): number {
  const key = (value: string): string => (value.length === 4 ? `${value}-12` : value);
  return key(b).localeCompare(key(a));
}

/** Return a sorted copy; never mutates the input. */
export function sortedBy<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}
