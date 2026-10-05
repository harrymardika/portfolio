/**
 * Site-wide constants that are not personal content.
 * Personal content (name, bio, links) belongs in `content/`, not here.
 */
export const SITE = {
  /** Canonical origin, resolved from Astro's `site` config at build time. */
  url: new URL(import.meta.env.SITE),
  /** Default document language until i18n routing lands (T1.5). */
  defaultLocale: 'en',
} as const;
