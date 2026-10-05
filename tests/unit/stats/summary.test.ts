import { describe, expect, it } from 'bun:test';

import { StatsStore } from '../../../services/stats/store';
import { countryName, formatCount, formatSince, summarySchema } from '@/lib/stats/summary';

describe('summary formatting', () => {
  it('formats counts per locale', () => {
    expect(formatCount(1234, 'en')).toBe('1,234');
    expect(formatCount(1234, 'id')).toBe('1.234');
  });

  it('names countries per locale and keeps unknown codes', () => {
    expect(countryName('ID', 'en')).toBe('Indonesia');
    expect(countryName('US', 'id')).toBe('Amerika Serikat');
    expect(countryName('not-a-code', 'en')).toBe('not-a-code');
  });

  it('formats the first day with data', () => {
    expect(formatSince('2026-10-05', 'en')).toBe('Oct 2026');
    expect(formatSince('2026-10-05', 'id')).toBe('Okt 2026');
  });
});

describe('summarySchema', () => {
  it('accepts exactly what the stats service returns', () => {
    const store = new StatsStore();
    store.record(
      {
        type: 'pageview',
        path: '/',
        lang: 'en',
        detail: null,
        referrerHost: 'github.com',
        country: 'ID',
        ref: null,
        visitor: 'v',
      },
      new Date(),
    );
    expect(summarySchema.safeParse(store.summary(new Date())).success).toBe(true);
    store.close();
  });

  it('rejects unexpected shapes', () => {
    expect(summarySchema.safeParse({ visitors: 1 }).success).toBe(false);
  });
});
