import { describe, expect, it } from 'bun:test';

// lhci 0.15 reads each assertion as ONE [level, options] pair; a list of pairs silently disables it.
const { ci } = (await import('../../lighthouserc.cjs')) as {
  ci: {
    collect: { url: string[] };
    assert: { assertMatrix: { matchingUrlPattern: string; assertions: Record<string, unknown> }[] };
  };
};

describe('lighthouserc', () => {
  const matrix = ci.assert.assertMatrix;

  it('writes every assertion as a single [level, options] pair', () => {
    for (const { assertions } of matrix) {
      for (const [name, value] of Object.entries(assertions)) {
        expect(Array.isArray(value), name).toBe(true);
        const [level, options] = value as [string, unknown];
        expect(['error', 'warn', 'off'], name).toContain(level);
        expect(typeof options, name).toBe('object');
        expect(Array.isArray(options), name).toBe(false);
      }
    }
  });

  it('gates every page on all four categories', () => {
    for (const url of ci.collect.url) {
      const names = matrix
        .filter((entry) => new RegExp(entry.matchingUrlPattern).test(url))
        .flatMap((entry) => Object.keys(entry.assertions));
      for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
        expect(names, url).toContain(`categories:${category}`);
      }
    }
  });

  it('fails the 3D home pages below 0.8 and every other page below 0.9', () => {
    const floor = (url: string): number =>
      Math.min(
        ...matrix
          .filter((entry) => new RegExp(entry.matchingUrlPattern).test(url))
          .map(
            (entry) =>
              entry.assertions['categories:performance'] as [string, { minScore: number }] | undefined,
          )
          .filter((value) => value?.[0] === 'error')
          .map((value) => value?.[1].minScore ?? 1),
      );
    for (const url of ci.collect.url) {
      const path = new URL(url).pathname;
      expect(floor(url), url).toBe(path === '/' || path === '/id/' ? 0.8 : 0.9);
    }
  });
});
