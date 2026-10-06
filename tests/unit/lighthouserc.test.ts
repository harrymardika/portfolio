import { describe, expect, it } from 'bun:test';

// lhci 0.15 reads each assertion as ONE [level, options] pair; a list of pairs silently disables it.
const { ci } = (await import('../../lighthouserc.cjs')) as {
  ci: {
    collect: { url: string[] };
    assert: { assertions: Record<string, unknown> };
  };
};

describe('lighthouserc', () => {
  const { assertions } = ci.assert;

  it('writes every assertion as a single [level, options] pair', () => {
    for (const [name, value] of Object.entries(assertions)) {
      expect(Array.isArray(value), name).toBe(true);
      const [level, options] = value as [string, unknown];
      expect(['error', 'warn', 'off'], name).toContain(level);
      expect(typeof options, name).toBe('object');
      expect(Array.isArray(options), name).toBe(false);
    }
  });

  it('fails any page below the targets in docs/01-srs.md', () => {
    const floor = (category: string) =>
      (assertions[`categories:${category}`] as [string, { minScore: number }] | undefined)?.[1].minScore;
    expect(floor('performance')).toBe(0.9);
    for (const category of ['accessibility', 'best-practices', 'seo']) expect(floor(category)).toBe(0.95);
    expect(ci.collect.url.length).toBeGreaterThanOrEqual(6);
  });
});
