import { describe, expect, it } from 'bun:test';

import {
  estimateTokens,
  knowledgeTokens,
  finalizeKnowledge,
  knowledgeProblems,
  knowledgeSchema,
  knowledgeText,
  pagePaths,
  PHONE_PATTERN,
  toCompact,
  type Knowledge,
  type KnowledgeSource,
} from '@/lib/assistant';

const source: KnowledgeSource = {
  version: 1,
  site: 'https://example.com',
  files: ['/downloads/cv.pdf'],
  sections: [
    { key: 'profile', path: '/', text: { en: 'Ada builds AI.', id: 'Ada membangun AI.' } },
    {
      key: 'project/x',
      path: '/projects/x/',
      text: { en: 'X.' },
      detail: { en: 'Long story.', id: 'Cerita.' },
    },
  ],
};
const pages = ['/', '/id/', '/projects/x/', '/id/projects/x/'];
const finalize = (): Knowledge => finalizeKnowledge(source, { pages, files: new Set(['/downloads/cv.pdf']) });

describe('pagePaths', () => {
  it('lists linkable pages from the build output, without print pages, the OG template, and 404', () => {
    const files = [
      'index.html',
      'id/index.html',
      'projects/x/index.html',
      'print/cv/index.html',
      'id/print/cv/index.html',
      'og-template/index.html',
      'fooindex.html',
      '404.html',
      'downloads/cv.pdf',
    ];
    expect(pagePaths(files)).toEqual(['/', '/id/', '/projects/x/']);
  });
});

describe('finalizeKnowledge', () => {
  it('lists every page and file an answer may link to, sorted', () => {
    expect(finalize().paths).toEqual(['/', '/downloads/cv.pdf', '/id/', '/id/projects/x/', '/projects/x/']);
  });

  it('produces knowledge that passes its schema', () => {
    expect(knowledgeSchema.safeParse(finalize()).success).toBe(true);
  });

  it('fails on a section whose page is missing in either language', () => {
    expect(() =>
      finalizeKnowledge(source, {
        pages: ['/', '/id/', '/projects/x/'],
        files: new Set(['/downloads/cv.pdf']),
      }),
    ).toThrow('/id/projects/x/');
  });

  it('fails on a download that the build did not produce', () => {
    expect(() => finalizeKnowledge(source, { pages, files: new Set() })).toThrow('/downloads/cv.pdf');
  });
});

describe('knowledgeText and toCompact', () => {
  it('renders both languages and the detail in the full knowledge', () => {
    expect(knowledgeText(finalize())).toBe(
      '## profile (/)\nAda builds AI.\n[id] Ada membangun AI.\n\n## project/x (/projects/x/)\nX.\nLong story.\n[id] Cerita.',
    );
  });

  it('keeps only the English text in the compact knowledge', () => {
    const knowledge = finalize();
    const compact = toCompact(knowledge);
    expect(compact.paths).toEqual(knowledge.paths);
    expect(knowledgeText(compact)).toBe('## profile (/)\nAda builds AI.\n\n## project/x (/projects/x/)\nX.');
  });
});

describe('knowledgeProblems', () => {
  it('accepts knowledge within its budget', () => {
    expect(knowledgeProblems(finalize(), 1_000)).toEqual([]);
  });

  it('reports knowledge over its token budget', () => {
    expect(knowledgeProblems(finalize(), 5)).toEqual([expect.stringContaining('over the budget of 5')]);
  });

  it('reports anything that looks like a phone number', () => {
    const leaked = {
      ...finalize(),
      sections: [{ key: 'p', path: '/', text: { en: 'Call 0812 3456 7890' } }],
    };
    expect(knowledgeProblems(leaked, 1_000)).toEqual(['contains something that looks like a phone number']);
  });
});

describe('estimateTokens and PHONE_PATTERN', () => {
  it('counts the prompt text of a knowledge file', () => {
    const knowledge = finalize();
    expect(knowledgeTokens(knowledge)).toBe(estimateTokens(knowledgeText(knowledge)));
  });

  it('overestimates at 3.5 characters per token', () => {
    expect(estimateTokens('a'.repeat(35))).toBe(10);
    expect(estimateTokens('a'.repeat(36))).toBe(11);
  });

  it('matches Indonesian mobile and +62 numbers but not years or metrics', () => {
    expect(PHONE_PATTERN.test('+62 812-3456-7890')).toBe(true);
    expect(PHONE_PATTERN.test('081234567890')).toBe(true);
    expect(PHONE_PATTERN.test('2026, 92.5%, 12,000 users')).toBe(false);
  });
});

describe('knowledgeSchema', () => {
  it('rejects a path that is not a site path', () => {
    const bad = { ...finalize(), paths: ['https://evil.example/'] };
    expect(knowledgeSchema.safeParse(bad).success).toBe(false);
  });
});
