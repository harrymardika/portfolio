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
  'a11y.skipToContent': 'Skip to content',
  'nav.primary': 'Main',
  'nav.home': 'Home',
  'footer.socials': 'Find me online',
  'footer.builtWith': 'Built with Astro and self-hosted on a home server.',
  'hero.photoAlt': 'Photo of',
  'hero.detectionLabel': 'person · AI eng 0.99',
  'hero.ctaContact': 'Get in touch',
  'hero.ctaLinkedIn': 'LinkedIn profile',
  'hero.statsLabel': 'Highlights',
  'journey.eyebrow': 'Journey',
  'journey.openDetail': 'Read the story',
  'journey.gpa': 'GPA',
  'common.close': 'Close',
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
  'a11y.skipToContent': 'Lewati ke konten',
  'nav.primary': 'Utama',
  'nav.home': 'Beranda',
  'footer.socials': 'Temukan saya di',
  'footer.builtWith': 'Dibangun dengan Astro dan di-host sendiri di server rumah.',
  'hero.photoAlt': 'Foto',
  'hero.detectionLabel': 'person · AI eng 0.99',
  'hero.ctaContact': 'Hubungi saya',
  'hero.ctaLinkedIn': 'Profil LinkedIn',
  'hero.statsLabel': 'Sorotan',
  'journey.eyebrow': 'Perjalanan',
  'journey.openDetail': 'Baca ceritanya',
  'journey.gpa': 'IPK',
  'common.close': 'Tutup',
};

export const UI: Readonly<Record<Locale, Readonly<Record<UiKey, string>>>> = { en, id };

/** Return a translator bound to `locale`. */
export function useTranslations(locale: Locale): (key: UiKey) => string {
  return (key) => UI[locale][key];
}
