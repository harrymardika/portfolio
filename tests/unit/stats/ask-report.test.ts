import { describe, expect, it } from 'bun:test';

import { eventPayloadSchema } from '@/lib/stats/events';
import { formatAskReport, privateReportSchema } from '@/lib/stats/summary';

describe('ask events', () => {
  it('accepts a chatbot outcome without any text', () => {
    expect(
      eventPayloadSchema.safeParse({ type: 'ask', path: '/', lang: 'en', detail: 'answered' }).success,
    ).toBe(true);
  });

  it('rejects an unknown outcome or a question smuggled in', () => {
    for (const payload of [
      { type: 'ask', path: '/', lang: 'en', detail: 'what is your salary?' },
      { type: 'ask', path: '/', lang: 'en', detail: 'answered', question: 'hi' },
    ]) {
      expect(eventPayloadSchema.safeParse(payload).success).toBe(false);
    }
  });
});

describe('formatAskReport', () => {
  it('lists the last 30 days and all time with each outcome', () => {
    const outcomes = { answered: 5, unavailable: 1, limit: 2 };
    expect(formatAskReport({ total: outcomes, last30Days: { answered: 1, unavailable: 0, limit: 0 } })).toBe(
      'Last 30 days: 1 questions (1 answered, 0 unavailable, 0 over the limit)\n' +
        'All time: 8 questions (5 answered, 1 unavailable, 2 over the limit)',
    );
  });

  it('still reads a private report from a stats service without chatbot counts', () => {
    expect(privateReportSchema.safeParse({ generatedAt: '2026-10-08T00:00:00Z', refs: [] }).success).toBe(
      true,
    );
  });
});
