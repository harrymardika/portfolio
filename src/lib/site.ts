/**
 * Site-wide constants that are not personal content.
 * Personal content (name, bio, links) belongs in `content/`, not here.
 * Kept free of Astro/Vite APIs so it can be imported by config files and unit tests.
 */

/** Production origin. Override at build time with the SITE_URL env var. */
export const DEFAULT_SITE_URL = 'https://harry.mardika.my.id';

/** Resolve the public site URL from an env value, falling back to production. */
export function resolveSiteUrl(envValue: string | undefined): string {
  const value = envValue?.trim();
  if (!value) return DEFAULT_SITE_URL;
  // Throws a TypeError with the offending value if it is not a valid absolute URL.
  return new URL(value).origin;
}
