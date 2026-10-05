import { describe, expect, it } from 'bun:test';

import { alternates, localeStaticPaths, localizePath, splitLocale } from '@/lib/i18n';

describe('splitLocale', () => {
  it('treats unprefixed paths as English', () => {
    expect(splitLocale('/')).toEqual({ locale: 'en', path: '/' });
    expect(splitLocale('/projects/decklify/')).toEqual({ locale: 'en', path: '/projects/decklify/' });
  });

  it('extracts the Indonesian prefix', () => {
    expect(splitLocale('/id/')).toEqual({ locale: 'id', path: '/' });
    expect(splitLocale('/id/projects')).toEqual({ locale: 'id', path: '/projects/' });
  });

  it('does not treat an explicit /en/ prefix or look-alike segments as a locale', () => {
    expect(splitLocale('/en/about/')).toEqual({ locale: 'en', path: '/en/about/' });
    expect(splitLocale('/identity/')).toEqual({ locale: 'en', path: '/identity/' });
  });
});

describe('localizePath', () => {
  it('prefixes Indonesian paths and leaves English unprefixed', () => {
    expect(localizePath('/about/', 'id')).toBe('/id/about/');
    expect(localizePath('/about', 'en')).toBe('/about/');
    expect(localizePath('/', 'id')).toBe('/id/');
  });

  it('re-localizes a path that already has a locale', () => {
    expect(localizePath('/id/about/', 'en')).toBe('/about/');
    expect(localizePath('/id/about/', 'id')).toBe('/id/about/');
  });
});

describe('alternates', () => {
  it('maps a page to every locale', () => {
    expect(alternates('/id/projects/')).toEqual({ en: '/projects/', id: '/id/projects/' });
  });
});

describe('localeStaticPaths', () => {
  it('renders English without a prefix and Indonesian under /id/', () => {
    expect(localeStaticPaths()).toEqual([
      { params: { locale: undefined }, props: { locale: 'en' } },
      { params: { locale: 'id' }, props: { locale: 'id' } },
    ]);
  });
});
