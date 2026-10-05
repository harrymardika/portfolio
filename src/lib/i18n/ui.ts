/**
 * UI strings (labels, buttons, section titles). Personal content lives in `content/`.
 * English defines the keys; the Indonesian dictionary must provide every key,
 * so a missing translation is a type error.
 */
import type { Locale } from './locales';

const en = {
  'lang.name': 'English',
  'lang.short': 'EN',
  'lang.switchLabel': 'Language',
  'lang.readIn': 'Read this page in English',
  'date.present': 'Present',
  'theme.toDark': 'Switch to dark theme',
  'theme.toLight': 'Switch to light theme',
} as const;

export type UiKey = keyof typeof en;

const id: Record<UiKey, string> = {
  'lang.name': 'Bahasa Indonesia',
  'lang.short': 'ID',
  'lang.switchLabel': 'Bahasa',
  'lang.readIn': 'Baca halaman ini dalam Bahasa Indonesia',
  'date.present': 'Sekarang',
  'theme.toDark': 'Ganti ke tema gelap',
  'theme.toLight': 'Ganti ke tema terang',
};

export const UI: Readonly<Record<Locale, Readonly<Record<UiKey, string>>>> = { en, id };

/** Return a translator bound to `locale`. */
export function useTranslations(locale: Locale): (key: UiKey) => string {
  return (key) => UI[locale][key];
}
