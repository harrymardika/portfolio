/**
 * Turns site content into knowledge sections (T11.1). Pure: the build endpoint passes in what the pages
 * show (src/pages/assistant-knowledge.json.ts), so visibility rules live in one place (queries.ts).
 */
import { formatDateRange, localize, localizeNumber, type ProjectItem } from '@/lib/content';
import type {
  Award,
  Certification,
  CvVariant,
  Education,
  EndDate,
  Experience,
  LocalizedText,
  Message,
  Profile,
  SkillGroup,
  Training,
  YearMonth,
} from '@/lib/content';
import type { Locale } from '@/lib/i18n/locales';

import { cvSections, projectSection } from './project-sections';
import { both, lines, optionalDetail, plain, withHighlights } from './text';

import type { KnowledgeSection, KnowledgeSource } from './knowledge';

export interface KnowledgeInput {
  readonly site: string;
  readonly profile: Profile;
  readonly experience: readonly Experience[];
  readonly education: readonly Education[];
  readonly trainings: readonly Training[];
  readonly awards: readonly Award[];
  readonly certifications: readonly Certification[];
  readonly skills: readonly SkillGroup[];
  readonly projects: readonly ProjectItem[];
  /** Case study Markdown bodies by slug; `id` only when a translation exists. */
  readonly caseStudies: Readonly<Record<string, LocalizedText>>;
  readonly cvVariants: readonly CvVariant[];
  readonly messages: readonly Message[];
  /** Downloadable files the answers may link to, e.g. the CV PDFs. */
  readonly files: readonly string[];
  /** "Present" for open-ended date ranges, from the UI dictionary. */
  readonly presentLabel: Readonly<Record<Locale, string>>;
}

/** Kind words beyond this many go to `detail`, so approved messages (T12.1) cannot outgrow the compact budget. */
export const COMPACT_MESSAGES = 2;

function profileSection({ profile }: KnowledgeInput): KnowledgeSection {
  const profiles = profile.socials.filter((s) => s.platform !== 'email').map((s) => `${s.platform} ${s.url}`);
  return {
    key: 'profile',
    path: '/',
    text: both((locale) =>
      lines(
        `${profile.name}: ${localize(profile.role, locale)}. ${plain(localize(profile.headline, locale))}`,
        plain(localize(profile.tagline, locale)),
        plain(localize(profile.summary, locale)),
        profile.status_badge ? localize(profile.status_badge, locale) : undefined,
        `Location: ${profile.location}. Email: ${profile.email}.`,
        profile.stats
          .map((s) => `${localizeNumber(s.value, locale)} ${localize(s.label, locale)}`)
          .join('; '),
        profiles.length > 0 && `Profiles: ${profiles.join(', ')}`,
      ),
    ),
  };
}

/** "Kind words" on the home page: the first messages in `text`, the rest as `detail`. */
function messagesSection({ messages }: KnowledgeInput): KnowledgeSection[] {
  if (messages.length === 0) return [];
  const render = (list: readonly Message[]) => (locale: Locale) =>
    list
      .map(
        (m) =>
          `- ${m.name}${m.role ? `, ${localize(m.role, locale)}` : ''} (${localize(m.relationship, locale)}): ${localize(m.message, locale)}`,
      )
      .join('\n');
  return [
    {
      key: 'kind-words',
      path: '/',
      text: both(render(messages.slice(0, COMPACT_MESSAGES))),
      ...optionalDetail(both(render(messages.slice(COMPACT_MESSAGES)))),
    },
  ];
}

function timeline(input: KnowledgeInput): KnowledgeSection[] {
  const range = (item: { start: YearMonth; end: EndDate }, locale: Locale): string =>
    formatDateRange(item, locale, input.presentLabel[locale]);
  const experience = input.experience.map((item) => ({
    key: `experience/${item.id}`,
    path: '/about/',
    ...withHighlights(
      (locale) =>
        `${localize(item.role, locale)} at ${item.organization} (${item.category}), ${item.location}, ${range(item, locale)}`,
      item.highlights,
      item.tags.length > 0 ? `Tags: ${item.tags.join(', ')}` : '',
    ),
  }));
  const education = input.education.map((item) => ({
    key: `education/${item.id}`,
    path: '/about/',
    ...withHighlights(
      (locale) =>
        lines(
          `${localize(item.degree, locale)}, ${item.institution}, ${item.location}, ${range(item, locale)}`,
          item.gpa && `GPA ${localizeNumber(item.gpa, locale)}`,
        ),
      item.highlights,
    ),
  }));
  const trainings = input.trainings.map((item) => ({
    key: `training/${item.id}`,
    path: '/about/',
    ...withHighlights(
      (locale) =>
        `${localize(item.program, locale)}, ${item.institution}, ${item.location}, ${range(item, locale)}`,
      item.highlights,
    ),
  }));
  return [...experience, ...education, ...trainings];
}

function recognition({ awards, certifications, skills }: KnowledgeInput): KnowledgeSection[] {
  return [
    {
      key: 'awards',
      path: '/about/',
      text: both((locale) =>
        awards
          .map(
            (a) =>
              `- ${localize(a.title, locale)}, ${localize(a.issuer, locale)}, ${a.date}${a.rank ? ` (${a.rank})` : ''}`,
          )
          .join('\n'),
      ),
    },
    {
      key: 'certifications',
      path: '/about/',
      text: { en: certifications.map((c) => `- ${c.name}, ${c.issuer}, ${c.issued}`).join('\n') },
    },
    {
      key: 'skills',
      path: '/about/',
      text: both((locale) =>
        skills
          .map((g) => `${localize(g.name, locale)}: ${g.items.map((i) => localize(i, locale)).join(', ')}`)
          .join('\n'),
      ),
    },
  ].filter((section) => section.text.en !== '');
}

/** Every section the public site shows, in page order: profile, About, projects, CVs. */
export function buildKnowledgeSource(input: KnowledgeInput): KnowledgeSource {
  return {
    version: 1,
    site: input.site,
    files: [...input.files],
    sections: [
      profileSection(input),
      ...messagesSection(input),
      ...timeline(input),
      ...recognition(input),
      ...input.projects.map((item) => projectSection(item, input.caseStudies)),
      ...cvSections(input.cvVariants),
    ],
  };
}
