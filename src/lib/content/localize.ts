import type { LocalizedText } from './schemas';
import type { Locale } from '@/lib/i18n/locales';

/**
 * Pick the text for a locale. Indonesian falls back to English when it has not been translated yet.
 * Plain strings (proper nouns such as "Decklify") are returned unchanged.
 */
export function localize(text: LocalizedText | string, locale: Locale): string {
  if (typeof text === 'string') return text;
  return locale === 'id' ? (text.id ?? text.en) : text.en;
}

/** True when the Indonesian text is missing and the English fallback will be shown. */
export function isFallback(text: LocalizedText, locale: Locale): boolean {
  return locale === 'id' && text.id === undefined;
}

/** A grade such as "3.99/4.00" with the locale's decimal separator ("3,99/4,00" in Indonesian). */
export function formatGpa(gpa: string, locale: Locale): string {
  return locale === 'id' ? gpa.replace(/(\d)\.(\d)/g, '$1,$2') : gpa;
}
