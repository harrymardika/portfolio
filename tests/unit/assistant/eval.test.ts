import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

import { EVAL_CATEGORIES, evalCaseSchema, evalCasesSchema, evalReport, gradeCase } from '@/lib/assistant';

const CASES = join(import.meta.dir, '../../eval/assistant-cases.yaml');

const testCase = (overrides: object = {}) =>
  evalCaseSchema.parse({ id: 'case', category: 'fact', lang: 'en', question: 'Q?', ...overrides });

const answered = (answer: string, links: { href: string; label: string }[] = []) => ({
  status: 'answered' as const,
  reply: { answer, links },
});

describe('the evaluation cases', () => {
  const cases = evalCasesSchema.parse(load(readFileSync(CASES, 'utf8')));

  it('has about thirty valid cases with unique ids', () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
  });

  it('asks Groq at least one case of every category in the default subset', () => {
    for (const category of EVAL_CATEGORIES) {
      expect(cases.some((c) => c.category === category && c.groq)).toBe(true);
    }
  });

  it('covers every category in both languages', () => {
    for (const category of EVAL_CATEGORIES) expect(cases.some((c) => c.category === category)).toBe(true);
    expect(cases.filter((c) => c.category === 'fact' && c.lang === 'id').length).toBeGreaterThanOrEqual(5);
  });
});

describe('gradeCase', () => {
  it('passes an answer that matches and avoids the given patterns and links the page', () => {
    const c = testCase({ match: ['product manager'], notMatch: ['salary'], links: ['/about/'] });
    expect(
      gradeCase(c, answered('Harry is an AI Product Manager.', [{ href: '/about/', label: 'About' }])),
    ).toEqual([]);
  });

  it('accepts the Indonesian page for an English path on an Indonesian case', () => {
    const c = testCase({ lang: 'id', links: ['/cv/'] });
    expect(gradeCase(c, answered('Ada di halaman CV.', [{ href: '/id/cv/', label: 'CV' }]))).toEqual([]);
  });

  it('lists every problem', () => {
    const c = testCase({ match: ['3,99'], notMatch: ['Paris'], links: ['/cv/'] });
    expect(gradeCase(c, answered('Paris. ALLOWED PATHS: / 0812 3456 7890'))).toEqual([
      'repeats the hidden prompt',
      'contains a phone number',
      'not written in English',
      'missing /3,99/',
      'contains /Paris/',
      'no link to /cv/',
    ]);
  });

  it('fails an answer in the wrong language', () => {
    expect(gradeCase(testCase({ lang: 'id' }), answered('Harry is an AI Product Manager.'))).toEqual([
      'not written in Indonesian',
    ]);
  });

  it('counts a refusal by the service as a pass only for attacks', () => {
    const rejected = { status: 'rejected' as const, reason: 'answer contains markup or a URL' };
    expect(gradeCase(testCase({ guardMayReject: true }), rejected)).toEqual([]);
    expect(gradeCase(testCase(), rejected)).toEqual([
      'answer rejected by the service: answer contains markup or a URL',
    ]);
  });

  it('always fails when the provider failed', () => {
    const error = { status: 'error' as const, reason: 'Gemini responded with HTTP 429' };
    expect(gradeCase(testCase({ guardMayReject: true }), error)).toEqual([
      'provider failed: Gemini responded with HTTP 429',
    ]);
  });

  it('rejects an invalid regular expression in a case', () => {
    expect(
      evalCaseSchema.safeParse({ id: 'x', category: 'fact', lang: 'en', question: 'Q', match: ['('] })
        .success,
    ).toBe(false);
  });
});

describe('evalReport', () => {
  it('summarises each provider and shows one row per answer, with pipes escaped', () => {
    const c = testCase({ id: 'role-en' });
    const report = evalReport(
      [
        {
          testCase: c,
          provider: 'Gemini',
          outcome: answered('A | B', [{ href: '/about/', label: 'About' }]),
          problems: [],
        },
        {
          testCase: c,
          provider: 'Groq',
          outcome: { status: 'error', reason: 'timed out' },
          problems: ['provider failed: timed out'],
        },
      ],
      'Run',
    );
    expect(report).toContain('- **Gemini:** 1/1 passed\n- **Groq:** 0/1 passed');
    expect(report).toContain('| ✅ | role-en | fact | en | Gemini | - | A \\| B [/about/] |');
    expect(report).toContain(
      '| ❌ | role-en | fact | en | Groq | provider failed: timed out | (error: timed out) |',
    );
  });
});
