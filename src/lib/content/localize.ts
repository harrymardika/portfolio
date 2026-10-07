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

/**
 * Write the numbers in a language-neutral value (a GPA, a metric) with the locale's separators.
 * Values are written in English style ("92.5%", "12,000", "3.99/4.00"); Indonesian swaps the
 * decimal point and the thousands comma ("92,5%", "12.000", "3,99/4,00"), as PUEBI prescribes.
 */
export function localizeNumber(value: string, locale: Locale): string {
  if (locale === 'en') return value;
  return value.replace(/\d[\d.,]*\d/g, (number) =>
    number.replace(/[.,]/g, (separator) => (separator === '.' ? ',' : '.')),
  );
}

const FOREIGN_DECIMAL: Record<Locale, RegExp> = {
  en: /\d,(?!\d{3}(?!\d))\d/,
  id: /\d\.(?!\d{3}(?!\d))\d/,
};

/**
 * True when a text uses the other language's decimal separator: a comma decimal in English
 * ("92,5") or a point decimal in Indonesian ("92.5"). A separator followed by exactly three
 * digits is a thousands separator and is allowed in both ("12,000", "12.000").
 */
export function hasForeignDecimal(text: string, locale: Locale): boolean {
  return FOREIGN_DECIMAL[locale].test(text);
}
