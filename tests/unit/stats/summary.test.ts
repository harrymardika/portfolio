import { describe, expect, it } from 'bun:test';

import { StatsStore } from '../../../services/stats/store';
import {
  countryName,
  formatCount,
  formatRefReport,
  formatSince,
  privateReportSchema,
  summarySchema,
} from '@/lib/stats/summary';

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

describe('formatRefReport', () => {
  it('prints an aligned table, newest first', () => {
    const table = formatRefReport([
      {
        ref: 'old-co',
        firstSeen: '2026-10-01T08:00:00.000Z',
        lastSeen: '2026-10-01T08:05:00.000Z',
        visits: 1,
        pageviews: 2,
        downloadedCv: false,
        downloadedPortfolio: false,
      },
      {
        ref: 'acme-ml-engineer',
        firstSeen: '2026-10-04T09:00:00.000Z',
        lastSeen: '2026-10-05T10:30:00.000Z',
        visits: 2,
        pageviews: 7,
        downloadedCv: true,
        downloadedPortfolio: false,
      },
    ]);
    const lines = table.split('\n');
    expect(lines[0]).toStartWith('ref');
    expect(lines[1]).toStartWith('acme-ml-engineer  2026-10-04 09:00');
    expect(lines[1]).toContain('yes');
    expect(lines[2]).toStartWith('old-co');
    // Columns line up.
    expect(lines[1]?.indexOf('2026')).toBe(lines[2]?.indexOf('2026'));
  });

  it('says when nothing has been opened', () => {
    expect(formatRefReport([])).toBe('No tracking links have been opened yet.');
  });

  it('matches what the stats service returns', () => {
    const store = new StatsStore();
    const now = new Date('2026-10-05T12:00:00Z');
    store.record(
      {
        type: 'pageview',
        path: '/',
        lang: 'en',
        detail: null,
        referrerHost: null,
        country: null,
        ref: 'x',
        visitor: 'v',
      },
      now,
    );
    expect(
      privateReportSchema.safeParse({ generatedAt: now.toISOString(), refs: store.refReport() }).success,
    ).toBe(true);
    store.close();
  });
});
