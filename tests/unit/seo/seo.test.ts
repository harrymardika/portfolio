import { describe, expect, it } from 'bun:test';

import {
  buildRobots,
  buildSitemap,
  ogHeading,
  ogImagePath,
  pageFromHtml,
  readPageMeta,
  personJsonLd,
  projectJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const SITE = 'https://harry.mardika.my.id';

describe('ogImagePath', () => {
  it('derives one file name per page path', () => {
    expect(ogImagePath('/')).toBe('/og/home.jpg');
    expect(ogImagePath('/id/')).toBe('/og/id.jpg');
    expect(ogImagePath('/about/')).toBe('/og/about.jpg');
    expect(ogImagePath('/id/projects/decklify/')).toBe('/og/id-projects-decklify.jpg');
  });

  it('keeps file names safe', () => {
    expect(ogImagePath('/projects/Odd Name!/')).toBe('/og/projects-odd-name-.jpg');
  });
});

describe('ogHeading', () => {
  it('uses the page name, or the person on the home page', () => {
    expect(ogHeading('About me · Harry Mardika', 'Harry Mardika')).toBe('About me');
    expect(ogHeading('Harry Mardika · AI Engineer', 'Harry Mardika')).toBe('Harry Mardika');
    expect(ogHeading('Decklify', 'Harry Mardika')).toBe('Decklify');
  });
});

describe('readPageMeta', () => {
  it('reads the title, description, language, and image path with entities decoded', () => {
    const html = `<!doctype html><html lang="id-ID"><head>
      <title>Proyek &amp; riset · Harry</title>
      <meta name="description" content="Model &quot;AI&quot; &lt;3 &#39;edge&#39;">
      <meta property="og:image" content="${SITE}/og/id-projects.jpg">
      </head><body><title>ignored</title></body></html>`;
    expect(readPageMeta(html)).toEqual({
      title: 'Proyek & riset · Harry',
      description: `Model "AI" <3 'edge'`,
      lang: 'id-ID',
      image: '/og/id-projects.jpg',
    });
  });

  it('copes with pages without an image or description', () => {
    expect(readPageMeta('<html><head><title>x</title></head></html>')).toEqual({
      title: 'x',
      description: '',
      lang: 'en-US',
      image: null,
    });
  });
});

describe('pageFromHtml', () => {
  const head = (extra: string) => `<html><head>
    <link rel="canonical" href="${SITE}/about/">
    <link rel="alternate" hreflang="en" href="${SITE}/about/">
    <link rel="alternate" hreflang="id" href="${SITE}/id/about/">
    <link rel="alternate" hreflang="x-default" href="${SITE}/about/">
    ${extra}</head><body><link rel="canonical" href="${SITE}/ignored/"></body></html>`;

  it('reads the canonical URL and alternates from the head', () => {
    expect(pageFromHtml(head(''))).toEqual({
      url: `${SITE}/about/`,
      alternates: { en: `${SITE}/about/`, id: `${SITE}/id/about/`, 'x-default': `${SITE}/about/` },
    });
  });

  it('skips noindex pages and pages without a canonical URL', () => {
    expect(pageFromHtml(head('<meta name="robots" content="noindex">'))).toBeNull();
    expect(pageFromHtml('<html><head><title>404</title></head></html>')).toBeNull();
  });
});

describe('pageFromHtml entities', () => {
  it('decodes attribute values so the sitemap escapes them only once', () => {
    const page = pageFromHtml(`<html><head><link rel="canonical" href="${SITE}/?a=1&amp;b=2"></head></html>`);
    expect(page?.url).toBe(`${SITE}/?a=1&b=2`);
    expect(buildSitemap(page ? [page] : [])).toContain('?a=1&amp;b=2</loc>');
  });
});

describe('buildSitemap', () => {
  it('lists pages in a stable order with escaped hreflang links', () => {
    const xml = buildSitemap([
      { url: `${SITE}/id/`, alternates: { id: `${SITE}/id/`, en: `${SITE}/` } },
      { url: `${SITE}/?a=1&b=2`, alternates: {} },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.indexOf(`${SITE}/?a=1&amp;b=2`)).toBeLessThan(xml.indexOf(`<loc>${SITE}/id/</loc>`));
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="en" href="${SITE}/"/>`);
    expect(xml).not.toContain('&b=');
  });
});

describe('buildRobots', () => {
  it('allows crawling, hides the API and the CV variants, and points at the sitemap', () => {
    expect(buildRobots(SITE)).toBe(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /downloads/cv/\n\nSitemap: ${SITE}/sitemap.xml\n`,
    );
  });
});

describe('JSON-LD', () => {
  const profile = {
    name: 'Harry Mardika',
    role: { en: 'AI Engineer', id: 'Insinyur AI' },
    tagline: { en: 'Builds AI products.' },
    location: 'Jakarta, Indonesia',
    socials: [
      { platform: 'linkedin' as const, url: 'https://www.linkedin.com/in/harry-mardika/' },
      { platform: 'email' as const, url: 'mailto:someone@example.com' },
    ],
  };

  it('describes the person without the email address', () => {
    const person = personJsonLd({
      profile,
      education: [{ institution: 'Universitas Gunadarma' }, { institution: 'Universitas Gunadarma' }],
      locale: 'id',
      site: SITE,
      url: `${SITE}/id/`,
      image: `${SITE}/_astro/photo.jpg`,
    });
    expect(person).toMatchObject({
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      jobTitle: 'Insinyur AI',
      description: 'Builds AI products.', // falls back to English
      sameAs: ['https://www.linkedin.com/in/harry-mardika/'],
      address: { addressLocality: 'Jakarta', addressCountry: 'Indonesia' },
      alumniOf: [{ '@type': 'EducationalOrganization', name: 'Universitas Gunadarma' }],
    });
    expect(JSON.stringify(person)).not.toContain('mailto');
  });

  it('links the website and case studies to the same person', () => {
    const website = websiteJsonLd({ name: 'Harry Mardika', site: SITE, locale: 'en', url: `${SITE}/` });
    expect(website).toMatchObject({
      '@type': 'WebSite',
      inLanguage: 'en-US',
      author: { '@id': `${SITE}/#person` },
    });
    const project = projectJsonLd({
      project: {
        title: 'Decklify',
        summary: { en: 'Slides from text.' },
        year: 2025,
        tags: ['NLP', 'SaaS'],
        links: { live: 'https://decklify.id' },
      },
      locale: 'en',
      site: SITE,
      url: `${SITE}/projects/decklify/`,
      image: `${SITE}/og/projects-decklify.jpg`,
    });
    expect(project).toMatchObject({
      '@type': 'CreativeWork',
      name: 'Decklify',
      dateCreated: '2025',
      keywords: 'NLP, SaaS',
      sameAs: ['https://decklify.id'],
      author: { '@id': `${SITE}/#person` },
    });
  });

  it('serializes safely inside a script tag', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
