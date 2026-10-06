/**
 * Person JSON-LD with real content (profile, education, optimized photo URL). Uses astro:assets and
 * content queries, so like src/lib/content/queries.ts it is Astro-only and not exported from ./index.
 */
import { getImage } from 'astro:assets';

import { contentImage } from '@/lib/content/media';
import { getEducation, getProfile } from '@/lib/content/queries';
import { localizePath, type Locale } from '@/lib/i18n';

import { type JsonLd, personJsonLd } from './json-ld';

/** `Astro.site`, which structured data needs for absolute URLs. */
export function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('Structured data needs `site` in astro.config.ts');
  return site;
}

export async function getPersonJsonLd(locale: Locale, siteUrl: URL | undefined): Promise<JsonLd> {
  const site = requireSite(siteUrl);
  const [profile, education] = await Promise.all([getProfile(), getEducation()]);
  const photo = await getImage({ src: contentImage(profile.photo), width: 640, format: 'jpeg' });
  return personJsonLd({
    profile,
    education,
    locale,
    site,
    url: new URL(localizePath('/', locale), site).href,
    image: new URL(photo.src, site).href,
  });
}
