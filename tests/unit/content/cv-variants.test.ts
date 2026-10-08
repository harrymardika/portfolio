import { describe, expect, it } from 'bun:test';

import { applyVariant, pickHighlights, showsHighlight, type CvContent } from '@/lib/content';
import { cvVariantSchema } from '@/lib/content/schemas';

const line = (en: string, focus?: ('ai' | 'data' | 'product' | 'leadership')[]) => ({
  en,
  ...(focus ? { focus } : {}),
});

const job = {
  id: 'job',
  organization: 'Org',
  role: { en: 'Engineer' },
  category: 'work' as const,
  location: 'Jakarta',
  start: '2024-01',
  end: 'present' as const,
  tags: [],
  show_on_web: true,
  show_on_cv: true,
};

const content: CvContent = {
  experience: [
    { ...job, id: 'ml-job', highlights: [line('Trained a model', ['ai']), line('Shipped a product', ['product'])] },
    { ...job, id: 'sales-job', highlights: [line('Sold things', ['product']), line('Ran a team', ['leadership'])] },
    { ...job, id: 'club', category: 'leadership', highlights: [line('Led a club', ['leadership'])] },
    { ...job, id: 'mentor', category: 'teaching', highlights: [line('Taught Python')] },
  ],
  education: [
    {
      id: 'uni',
      institution: 'Uni',
      degree: { en: 'BSc' },
      location: 'Depok',
      start: '2021-09',
      end: '2025-09',
      highlights: [line('Thesis on CNNs', ['ai']), line('Student council', ['leadership'])],
      show_on_web: true,
      show_on_cv: true,
    },
  ],
  trainings: [
    {
      id: 'bootcamp',
      institution: 'Camp',
      program: { en: 'ML path' },
      location: 'Online',
      start: '2024-01',
      end: '2024-06',
      tags: [],
      highlights: [line('Built a recommender', ['data'])],
      show_on_web: true,
      show_on_cv: true,
    },
    {
      id: 'english',
      institution: 'School',
      program: { en: 'English course' },
      location: 'Online',
      start: '2023-01',
      end: '2023-02',
      tags: [],
      highlights: [],
      show_on_web: true,
      show_on_cv: true,
    },
  ],
  skills: [
    { id: 'ml', position: 0, name: { en: 'ML' }, items: ['PyTorch'] },
    { id: 'web', position: 1, name: { en: 'Web' }, items: ['Astro'] },
    { id: 'data', position: 2, name: { en: 'Data' }, items: ['SQL'] },
  ],
};

describe('CV variant selection', () => {
  it('shows unlabeled highlights everywhere and labeled ones for a matching focus', () => {
    expect(showsHighlight(line('x'), ['ai'])).toBe(true);
    expect(showsHighlight(line('x', ['data', 'ai']), ['ai'])).toBe(true);
    expect(showsHighlight(line('x', ['product']), ['ai', 'data'])).toBe(false);
  });

  it('keeps the first highlight of an entry that must stay when nothing matches', () => {
    const items = [line('a', ['product']), line('b', ['leadership'])];
    expect(pickHighlights(items, ['ai'])).toEqual([]);
    expect(pickHighlights(items, ['ai'], true)).toEqual(items.slice(0, 1));
  });

  it('keeps every job and degree, drops unrelated leadership and trainings, and orders skills', () => {
    const result = applyVariant(content, { focus: ['ai'], skills: ['data', 'ml'] });
    expect(result.experience.map((item) => item.id)).toEqual(['ml-job', 'sales-job', 'mentor']);
    expect(result.experience[0]?.highlights.map((h) => h.en)).toEqual(['Trained a model']);
    expect(result.experience[1]?.highlights.map((h) => h.en)).toEqual(['Sold things']); // no gap in the history
    expect(result.education[0]?.highlights.map((h) => h.en)).toEqual(['Thesis on CNNs']);
    expect(result.trainings.map((item) => item.id)).toEqual(['english']);
    expect(result.skills.map((group) => group.id)).toEqual(['data', 'ml']);
  });

  it('keeps every skill group when the variant does not choose', () => {
    expect(applyVariant(content, { focus: ['data'] }).skills).toHaveLength(3);
  });
});

describe('cvVariantSchema', () => {
  const variant = {
    id: 'data-engineer',
    position: 0,
    name: { en: 'Data Engineer' },
    role: { en: 'Data Engineer' },
    summary: { en: 'Builds pipelines.' },
    focus: ['data'],
    sections: ['skills', 'experience', 'education'],
  };

  it('accepts a variant that only selects and orders', () => {
    expect(cvVariantSchema.safeParse(variant).success).toBe(true);
  });

  it('rejects unknown focus labels, unknown or repeated sections, and an empty focus', () => {
    expect(cvVariantSchema.safeParse({ ...variant, focus: ['marketing'] }).success).toBe(false);
    expect(cvVariantSchema.safeParse({ ...variant, focus: [] }).success).toBe(false);
    expect(cvVariantSchema.safeParse({ ...variant, sections: ['projects'] }).success).toBe(false);
    expect(cvVariantSchema.safeParse({ ...variant, sections: ['skills', 'skills'] }).success).toBe(false);
  });
});
