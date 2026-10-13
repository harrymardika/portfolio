import { describe, expect, it } from 'bun:test';

import { laptopSize, statusLine, visitorsOf } from '@/scenes/room/parts/laptop';

const labels = { online: 'Online', visitors: 'Visitors in the last 30 days: {count}' };

describe('statusLine', () => {
  it('says online with the 30-day visitor count, in the page language', () => {
    expect(statusLine(true, 1234, labels, 'en-US')).toBe('Online · Visitors in the last 30 days: 1,234');
    expect(statusLine(true, 1234, { online: 'Online', visitors: 'Pengunjung: {count}' }, 'id-ID')).toBe(
      'Online · Pengunjung: 1.234',
    );
  });

  it('says only online when the statistics are not available', () => {
    expect(statusLine(true, null, labels, 'en-US')).toBe('Online');
  });

  it('is left out when the server does not answer', () => {
    expect(statusLine(false, 1234, labels, 'en-US')).toBeNull();
  });
});

describe('visitorsOf', () => {
  it('reads the 30-day visitor count from a summary', () => {
    expect(visitorsOf({ visitors: { total: 900, last30Days: 42 } })).toBe(42);
    expect(visitorsOf({ visitors: { total: 900, last30Days: 0 } })).toBe(0);
  });

  it('is null for anything else', () => {
    for (const value of [
      null,
      {},
      { visitors: {} },
      { visitors: { last30Days: '42' } },
      { visitors: { last30Days: -1 } },
    ])
      expect(visitorsOf(value)).toBeNull();
  });
});

describe('laptopSize', () => {
  it('is at most 320 design px wide, with a screen in proportion', () => {
    const size = laptopSize(2000, 2000);
    expect(size.width).toBe(320);
    expect(size.lid).toBeCloseTo(320 * 0.64, 6);
    expect(laptopSize(100, 100).width).toBe(120);
  });
});
