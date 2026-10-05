/** Supported locales (ADR 0008). English is the default and is served without a URL prefix. */
export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** BCP 47 tags used for `Intl` formatting and the `lang` attribute. */
export const LOCALE_TAGS: Readonly<Record<Locale, string>> = { en: 'en-US', id: 'id-ID' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
