/**
 * Structured data (schema.org JSON-LD) for search engines. Pure builders: pages pass plain content
 * and absolute URLs; BaseLayout serializes the result. Never includes the email or a phone number.
 */
import { localize } from '@/lib/content/localize';
import type { Education, Profile, Project } from '@/lib/content/schemas';
import { LOCALE_TAGS, LOCALES, type Locale } from '@/lib/i18n/locales';

export type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

/** Stable identifier so other entities (case studies) can point at the same person. */
export function personId(site: string | URL): string {
  return new URL('/#person', site).href;
}

export interface PersonInput {
  profile: Pick<Profile, 'name' | 'role' | 'tagline' | 'location' | 'socials'>;
  education: readonly Pick<Education, 'institution'>[];
  locale: Locale;
  site: string | URL;
  /** Absolute URL of the profile page in this locale. */
  url: string;
  /** Absolute URL of the profile photo. */
  image: string;
}

export function personJsonLd({ profile, education, locale, site, url, image }: PersonInput): JsonLd {
  const [locality, country] = profile.location.split(',').map((part) => part.trim());
  const institutions = [...new Set(education.map((item) => item.institution))];
  return {
    '@context': CONTEXT,
    '@type': 'Person',
    '@id': personId(site),
    name: profile.name,
    jobTitle: localize(profile.role, locale),
    description: localize(profile.tagline, locale),
    url,
    image,
    // Public profiles only: email stays out of structured data to limit scraping.
    sameAs: profile.socials.filter((social) => social.platform !== 'email').map((social) => social.url),
    address: { '@type': 'PostalAddress', addressLocality: locality, addressCountry: country },
    alumniOf: institutions.map((name) => ({ '@type': 'EducationalOrganization', name })),
  };
}

export function websiteJsonLd(input: {
  name: string;
  site: string | URL;
  locale: Locale;
  url: string;
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    inLanguage: LOCALE_TAGS[input.locale],
    availableLanguage: LOCALES.map((locale) => LOCALE_TAGS[locale]),
    author: { '@id': personId(input.site) },
  };
}

export interface ProjectInput {
  project: Pick<Project, 'title' | 'summary' | 'year' | 'tags' | 'links'>;
  locale: Locale;
  site: string | URL;
  url: string;
  image: string;
}

export function projectJsonLd({ project, locale, site, url, image }: ProjectInput): JsonLd {
  const sameAs = [project.links.live, project.links.repo].filter((link): link is string => Boolean(link));
  return {
    '@context': CONTEXT,
    '@type': 'CreativeWork',
    name: project.title,
    description: localize(project.summary, locale),
    url,
    image,
    inLanguage: LOCALE_TAGS[locale],
    dateCreated: String(project.year),
    author: { '@id': personId(site) },
    ...(project.tags.length > 0 ? { keywords: project.tags.join(', ') } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** JSON for a `<script type="application/ld+json">` block; `<` is escaped so content cannot close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
