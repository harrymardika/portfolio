import { describe, expect, it } from 'bun:test';

import { createLimiter } from '@/lib/assistant';

const at = (iso: string): Date => new Date(iso);

describe('createLimiter', () => {
  it('allows a visitor up to the hourly limit, then again an hour later', () => {
    const limit = createLimiter({ perVisitorHour: 2 });
    const first = limit('v', at('2026-10-08T01:00:00Z'));
    if (first.ok) first.release();
    const second = limit('v', at('2026-10-08T01:10:00Z'));
    if (second.ok) second.release();
    expect(limit('v', at('2026-10-08T01:20:00Z'))).toEqual({ ok: false, reason: 'visitor-hour' });
    expect(limit('v', at('2026-10-08T02:05:00Z')).ok).toBe(true);
  });

  it('stops a visitor at the daily limit and starts afresh the next UTC day', () => {
    const limit = createLimiter({ perVisitorHour: 100, perVisitorDay: 1 });
    const first = limit('v', at('2026-10-08T01:00:00Z'));
    if (first.ok) first.release();
    expect(limit('v', at('2026-10-08T20:00:00Z'))).toEqual({ ok: false, reason: 'visitor-day' });
    expect(limit('v', at('2026-10-09T00:00:01Z')).ok).toBe(true);
  });

  it('caps the whole site per day across visitors', () => {
    const limit = createLimiter({ perSiteDay: 1 });
    const first = limit('a', at('2026-10-08T01:00:00Z'));
    if (first.ok) first.release();
    expect(limit('b', at('2026-10-08T01:00:01Z'))).toEqual({ ok: false, reason: 'site-day' });
  });

  it('answers only a few questions at once and frees a slot on release', () => {
    const limit = createLimiter({ concurrent: 1 });
    const first = limit('a', at('2026-10-08T01:00:00Z'));
    expect(limit('b', at('2026-10-08T01:00:00Z'))).toEqual({ ok: false, reason: 'busy' });
    if (first.ok) {
      first.release();
      first.release();
    }
    expect(limit('b', at('2026-10-08T01:00:01Z')).ok).toBe(true);
  });
});
