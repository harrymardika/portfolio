import { describe, expect, it } from 'bun:test';

import { DEFAULT_LOCALE, isLocale, LOCALES } from '@/lib/i18n/locales';

describe('locales', () => {
  it('serves English by default and supports Indonesian', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(LOCALES).toEqual(['en', 'id']);
  });

  it('recognizes supported locales only', () => {
    expect(isLocale('id')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
