import { describe, expect, it } from 'bun:test';

import {
  compareDatesDesc,
  collectTags,
  compareProjects,
  filterByTag,
  compareRangesDesc,
  formatDateRange,
  formatYearMonth,
  isActiveCertification,
  isFallback,
  isPublished,
  localize,
  sortedBy,
  splitExperience,
  splitEmphasis,
  stripEmphasis,
  tagKey,
  toYearMonth,
  visibleOn,
} from '@/lib/content';

describe('localize', () => {
  it('returns the text for the requested locale', () => {
    expect(localize({ en: 'Founder', id: 'Pendiri' }, 'en')).toBe('Founder');
    expect(localize({ en: 'Founder', id: 'Pendiri' }, 'id')).toBe('Pendiri');
  });

  it('falls back to English when Indonesian is missing', () => {
    expect(localize({ en: 'Founder' }, 'id')).toBe('Founder');
    expect(isFallback({ en: 'Founder' }, 'id')).toBe(true);
    expect(isFallback({ en: 'Founder', id: 'Pendiri' }, 'id')).toBe(false);
    expect(isFallback({ en: 'Founder' }, 'en')).toBe(false);
  });

  it('returns plain strings unchanged', () => {
    expect(localize('Decklify', 'id')).toBe('Decklify');
  });
});

describe('dates', () => {
  it('converts a date to its UTC year-month', () => {
    expect(toYearMonth(new Date(Date.UTC(2026, 9, 5)))).toBe('2026-10');
    expect(toYearMonth(new Date(Date.UTC(2026, 0, 31, 23, 59)))).toBe('2026-01');
  });

  it('formats a month in English and Indonesian', () => {
    expect(formatYearMonth('2025-09', 'en')).toBe('Sep 2025');
    expect(formatYearMonth('2025-08', 'id')).toBe('Agu 2025');
  });

  it('rejects malformed year-month values', () => {
    expect(() => formatYearMonth('2025', 'en')).toThrow('Invalid year-month');
  });

  it('formats closed, ongoing, and single-month ranges', () => {
    expect(formatDateRange({ start: '2025-09', end: '2025-12' }, 'en', 'Present')).toBe('Sep 2025 – Dec 2025');
    expect(formatDateRange({ start: '2026-05', end: 'present' }, 'id', 'Sekarang')).toBe('Mei 2026 – Sekarang');
    expect(formatDateRange({ start: '2025-01', end: '2025-01' }, 'en', 'Present')).toBe('Jan 2025');
  });
});

describe('isActiveCertification', () => {
  const now = new Date(Date.UTC(2026, 9, 5)); // October 2026

  it('keeps certifications without an expiry date', () => {
    expect(isActiveCertification({ expires: undefined }, now)).toBe(true);
  });

  it('keeps a certification during its expiry month', () => {
    expect(isActiveCertification({ expires: '2026-10' }, now)).toBe(true);
  });

  it('hides certifications whose expiry month has passed', () => {
    expect(isActiveCertification({ expires: '2026-07' }, now)).toBe(false);
  });
});

describe('ordering', () => {
  it('puts ongoing items first, then the latest end, then the latest start', () => {
    const items = [
      { id: 'old', start: '2024-01', end: '2024-06' },
      { id: 'ongoing', start: '2026-05', end: 'present' as const },
      { id: 'late-start', start: '2025-03', end: '2025-12' },
      { id: 'early-start', start: '2025-01', end: '2025-12' },
    ];
    expect(sortedBy(items, compareRangesDesc).map((item) => item.id)).toEqual([
      'ongoing',
      'late-start',
      'early-start',
      'old',
    ]);
  });

  it('sorts years and months newest first, a bare year counting as December', () => {
    expect(['2024-04', '2025', '2024'].sort(compareDatesDesc)).toEqual(['2025', '2024', '2024-04']);
  });

  it('does not mutate the input array', () => {
    const input = ['2024', '2025'];
    sortedBy(input, compareDatesDesc);
    expect(input).toEqual(['2024', '2025']);
  });
});

describe('visibleOn', () => {
  const items = [
    { id: 'both', show_on_web: true, show_on_cv: true },
    { id: 'web-only', show_on_web: true, show_on_cv: false },
    { id: 'cv-only', show_on_web: false, show_on_cv: true },
  ];

  it('filters by surface', () => {
    expect(visibleOn(items, 'web').map((item) => item.id)).toEqual(['both', 'web-only']);
    expect(visibleOn(items, 'cv').map((item) => item.id)).toEqual(['both', 'cv-only']);
  });
});

describe('emphasis', () => {
  it('splits emphasized words marked with asterisks', () => {
    expect(splitEmphasis("Let's build something *useful.*")).toEqual([
      { text: "Let's build something ", emphasis: false },
      { text: 'useful.', emphasis: true },
    ]);
  });

  it('handles several emphasized parts and text without markers', () => {
    expect(splitEmphasis('*a* and *b*').map((s) => s.emphasis)).toEqual([true, false, true]);
    expect(splitEmphasis('plain')).toEqual([{ text: 'plain', emphasis: false }]);
  });

  it('keeps an unmatched asterisk as literal text', () => {
    expect(stripEmphasis('5* rating')).toBe('5* rating');
  });

  it('strips markers for plain-text contexts', () => {
    expect(stripEmphasis("Let's build something *useful.*")).toBe("Let's build something useful.");
  });
});

describe('projects', () => {
  const base = { draft: false, featured: false, order: undefined, year: 2024, title: 'B' };

  it('hides drafts', () => {
    expect(isPublished({ draft: true })).toBe(false);
    expect(isPublished({ draft: false })).toBe(true);
  });

  it('orders featured by `order`, then others by newest year and title', () => {
    const projects = [
      { ...base, title: 'Old', year: 2023 },
      { ...base, title: 'Second', featured: true, order: 2 },
      { ...base, title: 'Alpha', year: 2025 },
      { ...base, title: 'First', featured: true, order: 1 },
      { ...base, title: 'Beta', year: 2025 },
      { ...base, title: 'Unordered', featured: true },
    ];
    expect(sortedBy(projects, compareProjects).map((p) => p.title)).toEqual([
      'First',
      'Second',
      'Unordered',
      'Alpha',
      'Beta',
      'Old',
    ]);
  });
});

describe('project tags', () => {
  const projects = [
    { title: 'A', tags: ['YOLO', 'RAG'] },
    { title: 'B', tags: ['YOLO', 'Next.js'] },
    { title: 'C', tags: ['Go'] },
  ];

  it('collects tags by frequency, then alphabetically', () => {
    expect(collectTags(projects)).toEqual(['YOLO', 'Go', 'Next.js', 'RAG']);
  });

  it('keeps only tags shared by enough projects', () => {
    expect(collectTags(projects, 2)).toEqual(['YOLO']);
  });

  it('filters by tag, or returns all for null', () => {
    expect(filterByTag(projects, 'YOLO').map((p) => p.title)).toEqual(['A', 'B']);
    expect(filterByTag(projects, null)).toHaveLength(3);
    expect(filterByTag(projects, 'Rust')).toEqual([]);
  });

  it('turns tags into URL-safe keys', () => {
    expect(tagKey('Next.js')).toBe('next-js');
    expect(tagKey('Edge AI (Hailo-8L)')).toBe('edge-ai-hailo-8l');
  });
});

describe('splitExperience', () => {
  it('separates professional roles from leadership and teaching, keeping order', () => {
    const items = [
      { id: 'a', category: 'founder' as const },
      { id: 'b', category: 'teaching' as const },
      { id: 'c', category: 'research' as const },
      { id: 'd', category: 'leadership' as const },
      { id: 'e', category: 'program' as const },
      { id: 'f', category: 'work' as const },
    ];
    const { professional, leadership } = splitExperience(items);
    expect(professional.map((i) => i.id)).toEqual(['a', 'c', 'f']);
    expect(leadership.map((i) => i.id)).toEqual(['b', 'd', 'e']);
  });
});
