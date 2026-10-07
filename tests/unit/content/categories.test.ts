import { describe, expect, it } from 'bun:test';

import { itemCategoryIds, matchesSearch, normalizeSearch, usefulCategories } from '@/lib/content';
import { profileSchema } from '@/lib/content/schemas';

const categories = [
  { id: 'computer-vision', label: { en: 'Computer Vision' }, tags: ['Computer Vision', 'YOLO'] },
  { id: 'web', label: { en: 'Web & product', id: 'Web & produk' }, tags: ['Next.js', 'Go'] },
  { id: 'data', label: { en: 'Data' }, tags: ['Time Series'] },
];

describe('itemCategoryIds', () => {
  it('matches tags ignoring case and punctuation, in the categories order', () => {
    expect(itemCategoryIds(['next-js', 'yolo'], categories)).toEqual(['computer-vision', 'web']);
    expect(itemCategoryIds(['NEXT.JS'], categories)).toEqual(['web']);
    expect(itemCategoryIds(['Rust'], categories)).toEqual([]);
    expect(itemCategoryIds([], categories)).toEqual([]);
  });
});

describe('usefulCategories', () => {
  it('counts projects per category and drops categories with too few', () => {
    const lists = [['YOLO'], ['Computer Vision', 'Go'], ['Go'], ['Time Series']];
    expect(usefulCategories(lists, categories).map(({ category, count }) => [category.id, count])).toEqual([
      ['computer-vision', 2],
      ['web', 2],
    ]);
    expect(usefulCategories(lists, categories, 1)).toHaveLength(3);
  });
});

describe('search', () => {
  it('normalizes case, accents, and spaces', () => {
    expect(normalizeSearch('  Pengenalan   ÉKSPRESI ')).toBe('pengenalan ekspresi');
  });

  it('needs every word of the query, in any order', () => {
    const text = 'Crowd violence detection · YOLO · Temporal Shift Module';
    expect(matchesSearch(text, 'yolo')).toBe(true);
    expect(matchesSearch(text, 'shift  YOLO')).toBe(true);
    expect(matchesSearch(text, 'yolo bert')).toBe(false);
    expect(matchesSearch(text, '   ')).toBe(true);
  });
});

describe('categories schema', () => {
  it('rejects two categories with the same id (one ?filter= must mean one field)', () => {
    const projects = profileSchema.shape.projects;
    const category = { id: 'cv', label: { en: 'CV' }, tags: ['YOLO'] };
    expect(projects.safeParse({ intro: { en: 'x' }, categories: [category] }).success).toBe(true);
    expect(projects.safeParse({ intro: { en: 'x' }, categories: [category, category] }).success).toBe(false);
  });
});
