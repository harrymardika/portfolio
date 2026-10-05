import { describe, expect, it } from 'bun:test';

import { UI, useTranslations } from '@/lib/i18n';

describe('UI dictionary', () => {
  it('has the same keys in every locale, all non-empty', () => {
    const englishKeys = Object.keys(UI.en).sort();
    expect(Object.keys(UI.id).sort()).toEqual(englishKeys);
    for (const locale of ['en', 'id'] as const) {
      expect(Object.values(UI[locale]).filter((value) => value.trim() === '')).toEqual([]);
    }
  });
});

describe('useTranslations', () => {
  it('returns the string for the bound locale', () => {
    expect(useTranslations('id')('date.present')).toBe('Sekarang');
    expect(useTranslations('en')('date.present')).toBe('Present');
  });
});
