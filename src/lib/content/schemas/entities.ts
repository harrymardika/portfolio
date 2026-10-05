/**
 * Schemas for every file in `content/` (docs/04-content-guide.md §3).
 * Content types are inferred from these schemas; never redeclare them by hand.
 */
import { z } from 'astro/zod';

import {
  endDate,
  isValidRange,
  localizedText,
  slug,
  visibility,
  year,
  yearMonth,
  yearOrYearMonth,
} from './primitives';

const RANGE_ERROR = { message: '`end` must not be before `start`', path: ['end'] };
const hasValidRange = (item: { start: string; end: string }): boolean => isValidRange(item.start, item.end);

export const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'github', 'email'] as const;
export const EXPERIENCE_CATEGORIES = ['work', 'founder', 'research', 'leadership', 'teaching', 'program'] as const;

export const profileSchema = z.strictObject({
  name: z.string().trim().min(1),
  role: localizedText,
  headline: localizedText,
  tagline: localizedText,
  summary: localizedText,
  location: z.string().trim().min(1),
  email: z.email(),
  photo: z.string().trim().min(1),
  status_badge: localizedText.nullish(),
  socials: z
    .array(
      z.strictObject({
        platform: z.enum(SOCIAL_PLATFORMS),
        url: z.url(),
        handle: z.string().trim().min(1).optional(),
      }),
    )
    .min(1),
  stats: z
    .array(z.strictObject({ value: z.string().trim().min(1), label: localizedText }))
    .length(3, 'The hero shows exactly 3 stats'),
  journey: z.strictObject({ title: localizedText, intro: localizedText }),
  projects: z.strictObject({ intro: localizedText }),
  contact: z.strictObject({ title: localizedText, intro: localizedText }),
});

export const experienceSchema = z
  .strictObject({
    id: slug,
    organization: z.string().trim().min(1),
    role: localizedText,
    category: z.enum(EXPERIENCE_CATEGORIES),
    location: z.string().trim().min(1),
    start: yearMonth,
    end: endDate,
    highlights: z.array(localizedText).min(1, 'Add at least one highlight'),
    tags: z.array(z.string().trim().min(1)).default([]),
    ...visibility,
  })
  .refine(hasValidRange, RANGE_ERROR);

export const educationSchema = z
  .strictObject({
    id: slug,
    institution: z.string().trim().min(1),
    degree: localizedText,
    location: z.string().trim().min(1),
    start: yearMonth,
    end: endDate,
    gpa: z.string().trim().min(1).optional(),
    highlights: z.array(localizedText).default([]),
    ...visibility,
  })
  .refine(hasValidRange, RANGE_ERROR);

export const trainingSchema = z
  .strictObject({
    id: slug,
    institution: z.string().trim().min(1),
    program: localizedText,
    location: z.string().trim().min(1),
    start: yearMonth,
    end: endDate,
    tags: z.array(z.string().trim().min(1)).default([]),
    highlights: z.array(localizedText).default([]),
    ...visibility,
  })
  .refine(hasValidRange, RANGE_ERROR);

export const awardSchema = z.strictObject({
  id: slug,
  title: localizedText,
  issuer: z.string().trim().min(1),
  date: yearOrYearMonth,
  rank: z.string().trim().min(1).optional(),
  ...visibility,
});

export const certificationSchema = z
  .strictObject({
    id: slug,
    name: z.string().trim().min(1),
    issuer: z.string().trim().min(1),
    issued: yearMonth,
    expires: yearMonth.optional(),
    credential_id: z.string().trim().min(1).optional(),
    url: z.url().optional(),
  })
  .refine((c) => c.expires === undefined || c.issued <= c.expires, {
    message: '`expires` must not be before `issued`',
    path: ['expires'],
  });

/** Added by the YAML parser (file order); never written by hand. */
const position = z.number().int().min(0);

export const skillGroupSchema = z.strictObject({
  id: slug,
  position,
  name: localizedText,
  items: z.array(z.string().trim().min(1)).min(1),
});

export const milestoneSchema = z.strictObject({
  id: slug,
  position,
  year,
  title: localizedText,
  subtitle: localizedText,
  ref: slug.optional(),
});

export const projectSchema = z.strictObject({
  title: z.string().trim().min(1),
  summary: localizedText,
  role: localizedText,
  year,
  tags: z.array(z.string().trim().min(1)).default([]),
  metrics: z
    .array(z.strictObject({ value: z.string().trim().min(1), label: localizedText }))
    .max(3, 'Show at most 3 metrics per project')
    .default([]),
  links: z
    .strictObject({
      live: z.url().optional(),
      repo: z.url().optional(),
      demo: z.url().optional(),
    })
    .default({}),
  cover: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(1).optional(),
  draft: z.boolean().default(false),
});

export const homelabSchema = z.strictObject({
  intro: localizedText,
  pipeline: z.array(z.strictObject({ title: localizedText, body: localizedText })).min(1),
  stack: z.array(z.string().trim().min(1)).min(1),
  hardware: z.array(z.strictObject({ label: localizedText, value: z.string().trim().min(1) })).default([]),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Training = z.infer<typeof trainingSchema>;
export type Award = z.infer<typeof awardSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Homelab = z.infer<typeof homelabSchema>;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];
