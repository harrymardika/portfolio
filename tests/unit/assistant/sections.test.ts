import { describe, expect, it } from 'bun:test';

import {
  buildKnowledgeSource,
  cvSections,
  knowledgeSourceSchema,
  projectSection,
  type KnowledgeInput,
  type KnowledgeSection,
} from '@/lib/assistant';
import { cvVariantSchema, profileSchema, projectSchema } from '@/lib/content/schemas';

const profile = profileSchema.parse({
  name: 'Ada Lovelace',
  role: { en: 'AI Product Manager', id: 'AI Product Manager' },
  headline: { en: "Let's build *something*", id: 'Mari membangun *sesuatu*' },
  tagline: { en: 'Tagline' },
  summary: { en: 'Built **real** products.' },
  location: 'Jakarta, Indonesia',
  email: 'ada@example.com',
  photo: 'media/ada.jpg',
  socials: [
    { platform: 'github', url: 'https://github.com/ada' },
    { platform: 'email', url: 'mailto:ada@example.com' },
  ],
  stats: [
    { value: '92.5%', label: { en: 'accuracy', id: 'akurasi' } },
    { value: '3', label: { en: 'months' } },
    { value: '+45', label: { en: 'NPS' } },
  ],
  journey: { title: { en: 'Journey' }, intro: { en: 'Intro' } },
  projects: { intro: { en: 'Projects' } },
  contact: { title: { en: 'Contact' }, intro: { en: 'Say hi' } },
});

const job = {
  id: 'acme',
  organization: 'Acme',
  role: { en: 'Engineer', id: 'Insinyur' },
  category: 'work' as const,
  location: 'Jakarta',
  start: '2024-01',
  end: 'present' as const,
  highlights: [{ en: 'First' }, { en: 'Second' }, { en: 'Third' }],
  tags: ['Python'],
  show_on_web: true,
  show_on_cv: true,
};

const decklify = projectSchema.parse({
  title: 'Decklify',
  summary: { en: 'An AI studio.', id: 'Studio AI.' },
  role: { en: 'Founder' },
  year: 2026,
  tags: ['Go'],
  metrics: [{ value: '83.68%', label: { en: 'margin', id: 'margin' } }],
  links: { live: 'https://decklify.id' },
});

const input = (overrides: Partial<KnowledgeInput> = {}): KnowledgeInput => ({
  site: 'https://example.com',
  profile,
  experience: [job],
  education: [],
  trainings: [],
  awards: [],
  certifications: [],
  skills: [],
  projects: [],
  caseStudies: {},
  cvVariants: [],
  messages: [],
  files: ['/downloads/cv.pdf'],
  presentLabel: { en: 'Present', id: 'Sekarang' },
  ...overrides,
});

const section = (sections: readonly KnowledgeSection[], key: string): KnowledgeSection => {
  const found = sections.find((s) => s.key === key);
  if (!found) throw new Error(`no section ${key}`);
  return found;
};

describe('buildKnowledgeSource', () => {
  it('produces a source that passes its schema', () => {
    expect(knowledgeSourceSchema.safeParse(buildKnowledgeSource(input())).success).toBe(true);
  });

  it('writes the profile as plain text with localized numbers, without the duplicate email link', () => {
    const { text } = section(buildKnowledgeSource(input()).sections, 'profile');
    expect(text.en).toContain("Ada Lovelace: AI Product Manager. Let's build something");
    expect(text.en).toContain('Built real products.');
    expect(text.en).toContain('92.5% accuracy');
    expect(text.id).toContain('92,5% akurasi');
    expect(text.en).toContain('Email: ada@example.com.');
    expect(text.en).not.toContain('mailto:');
  });

  it('keeps two highlights in the text and moves the rest and the tags to the detail', () => {
    const experience = section(buildKnowledgeSource(input()).sections, 'experience/acme');
    expect(experience.path).toBe('/about/');
    expect(experience.text.en).toBe(
      'Engineer at Acme (work), Jakarta, Jan 2024 – Present\n- First\n- Second',
    );
    expect(experience.text.id).toContain('Insinyur at Acme');
    expect(experience.detail).toEqual({ en: '- Third\nTags: Python' });
  });

  it('lists the kind words on the home page, the first two in the text and the rest in the detail', () => {
    const message = (name: string, position: number) => ({
      id: name.toLowerCase(),
      name,
      relationship: { en: 'Mentor' },
      message: { en: 'Great work.' },
      approved: '2026-10',
      position,
    });
    const messages = [
      { ...message('Grace', 0), role: { en: 'Admiral' } },
      message('Alan', 1),
      message('Edsger', 2),
    ];
    const kindWords = section(buildKnowledgeSource(input({ messages })).sections, 'kind-words');
    expect(kindWords.path).toBe('/');
    expect(kindWords.text.en).toBe('- Grace, Admiral (Mentor): Great work.\n- Alan (Mentor): Great work.');
    expect(kindWords.detail).toEqual({ en: '- Edsger (Mentor): Great work.' });
  });

  it('leaves out the profile links line when email is the only one', () => {
    const emailOnly = {
      ...profile,
      socials: [{ platform: 'email' as const, url: 'mailto:ada@example.com' }],
    };
    const { text } = section(buildKnowledgeSource(input({ profile: emailOnly })).sections, 'profile');
    expect(text.en).not.toContain('Profiles:');
  });

  it('leaves out lists that are empty', () => {
    const keys = buildKnowledgeSource(input()).sections.map((s) => s.key);
    expect(keys).not.toContain('certifications');
    expect(keys).not.toContain('cv-variants');
    expect(keys).not.toContain('kind-words');
  });
});

describe('projectSection', () => {
  const local = { kind: 'local' as const, slug: 'decklify', project: decklify, repo: null };

  it('links a case study to its page with the summary and localized metrics', () => {
    const result = projectSection(local, {});
    expect(result.path).toBe('/projects/decklify/');
    expect(result.text).toEqual({
      en: 'Decklify (2026), Founder: An AI studio.\n83.68% margin',
      id: 'Decklify (2026), Founder: Studio AI.\n83,68% margin',
    });
  });

  it('puts tags, links, and the body in the detail, in each language', () => {
    const result = projectSection(local, {
      decklify: { en: '## Problem\nSlides.', id: '## Masalah\nSlide.' },
    });
    expect(result.detail?.en).toBe('Tags: Go\nLinks: live https://decklify.id\nProblem:\nSlides.');
    expect(result.detail?.id).toContain('Masalah:\nSlide.');
  });

  it('has no detail when there is nothing beyond the summary', () => {
    const bare = { ...local, project: { ...decklify, tags: [], links: {} } };
    expect(projectSection(bare, {}).detail).toBeUndefined();
  });

  it('links a GitHub-only repository to the projects page', () => {
    const repo = {
      name: 'tool',
      title: null,
      summary: null,
      description: 'A tool.',
      url: 'https://github.com/ada/tool',
      homepage: null,
      topics: [],
      language: 'Go',
      stars: 0,
      createdAt: '2025-01-01T00:00:00Z',
      pushedAt: '2025-06-01T00:00:00Z',
      members: [{ name: 'tool', url: 'https://github.com/ada/tool' }],
    };
    const result = projectSection({ kind: 'github', repo }, {});
    expect(result).toEqual({
      key: 'repo/tool',
      path: '/projects/',
      text: { en: 'tool (GitHub, 2025): A tool.' },
      detail: { en: 'Code: https://github.com/ada/tool' },
    });
  });

  it('ends a GitHub repository line without a dangling colon when it has no description', () => {
    const repo = {
      name: 'bare',
      title: null,
      summary: null,
      description: null,
      url: 'https://github.com/ada/bare',
      homepage: null,
      topics: [],
      language: null,
      stars: 0,
      createdAt: '2025-01-01T00:00:00Z',
      pushedAt: null,
      members: [{ name: 'bare', url: 'https://github.com/ada/bare' }],
    };
    expect(projectSection({ kind: 'github', repo }, {}).text).toEqual({ en: 'bare (GitHub, 2025)' });
  });
});

describe('cvSections', () => {
  it('lists the CVs by role on /cv/', () => {
    const variant = cvVariantSchema.parse({
      id: 'data-engineer',
      position: 0,
      name: { en: 'Data Engineer' },
      role: { en: 'Data Engineer · ML' },
      summary: { en: 'Summary' },
      focus: ['data'],
      sections: ['experience'],
    });
    expect(cvSections([variant])).toEqual([
      { key: 'cv-variants', path: '/cv/', text: { en: '- Data Engineer: Data Engineer · ML' } },
    ]);
  });
});
