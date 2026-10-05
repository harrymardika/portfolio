/**
 * Locale-aware URL helpers (ADR 0008): English lives at `/…/`, Indonesian at `/id/…/`.
 * Pure string functions so they can be used at build time, in components, and in tests.
 * All returned paths end with a trailing slash to match `trailingSlash: 'always'`.
 */
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './locales';

function withSlashes(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}/`;
}

/** Split `/id/projects/` into `{ locale: 'id', path: '/projects/' }`; unprefixed paths are English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [first, ...rest] = withSlashes(pathname).split('/').filter(Boolean);
  if (first !== undefined && first !== DEFAULT_LOCALE && isLocale(first)) {
    return { locale: first, path: withSlashes(rest.join('/')) };
  }
  return { locale: DEFAULT_LOCALE, path: withSlashes(pathname) };
}

/** Build the URL path of a locale-neutral `path` (e.g. `/projects/`) for `locale`. */
export function localizePath(path: string, locale: Locale): string {
  const neutral = splitLocale(path).path;
  return locale === DEFAULT_LOCALE ? neutral : withSlashes(`${locale}${neutral}`);
}

/** The same page in every locale, used for `hreflang` links and the language switch. */
export function alternates(pathname: string): Record<Locale, string> {
  const { path } = splitLocale(pathname);
  return Object.fromEntries(LOCALES.map((locale) => [locale, localizePath(path, locale)])) as Record<
    Locale,
    string
  >;
}

/** `getStaticPaths` entries for a `[...locale]` route: `undefined` renders the unprefixed English page. */
export function localeStaticPaths(): { params: { locale: string | undefined }; props: { locale: Locale } }[] {
  return LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}
