/**
 * Usage limits of the assistant (T11.2, ADR 0014), kept in memory: per visitor per hour and per day, for
 * the whole site per day, and the number of questions answered at once. They protect the free model
 * quotas and the home server. A restart resets them, which is acceptable for a small site. No Node APIs, so
 * the module stays safe to import from the browser widget.
 */

/** UTC day, e.g. "2026-10-08". */
const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

export interface LimitOptions {
  readonly perVisitorHour?: number;
  readonly perVisitorDay?: number;
  readonly perSiteDay?: number;
  readonly concurrent?: number;
}

export type LimitReason = 'visitor-hour' | 'visitor-day' | 'site-day' | 'busy';

export type Acquired =
  { readonly ok: true; readonly release: () => void } | { readonly ok: false; readonly reason: LimitReason };

const HOUR_MS = 3_600_000;
/** Bound memory under abuse: forget visitors when this many are tracked (the site limit still holds). */
const MAX_VISITORS = 10_000;

export function createLimiter(options: LimitOptions = {}): (visitor: string, at: Date) => Acquired {
  const { perVisitorHour = 10, perVisitorDay = 30, perSiteDay = 300, concurrent = 3 } = options;
  let day = '';
  let siteCount = 0;
  let running = 0;
  const visitors = new Map<string, number[]>();

  return (visitor, at) => {
    // Visitor ids are daily hashes, so a new day starts every count afresh.
    if (dayKey(at) !== day) {
      day = dayKey(at);
      siteCount = 0;
      visitors.clear();
    }
    const times = visitors.get(visitor) ?? [];
    if (running >= concurrent) return { ok: false, reason: 'busy' };
    if (siteCount >= perSiteDay) return { ok: false, reason: 'site-day' };
    if (times.length >= perVisitorDay) return { ok: false, reason: 'visitor-day' };
    if (times.filter((time) => time > at.getTime() - HOUR_MS).length >= perVisitorHour) {
      return { ok: false, reason: 'visitor-hour' };
    }
    if (visitors.size >= MAX_VISITORS) visitors.clear();
    visitors.set(visitor, [...times, at.getTime()]);
    siteCount += 1;
    running += 1;
    let released = false;
    return {
      ok: true,
      release: () => {
        if (!released) running -= 1;
        released = true;
      },
    };
  };
}
