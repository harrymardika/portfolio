/**
 * CV variants (T10.1, D10): pick and order existing content for one kind of position. Pure; never adds
 * or rewrites text, so every variant stays as true as the general CV.
 */
import { PROFESSIONAL_CATEGORIES } from './experience';
import type {
  CvSection,
  CvVariant,
  Education,
  Experience,
  FocusArea,
  Highlight,
  SkillGroup,
  Training,
} from './schemas';

/** Section order of the general CV (docs/09-pdf-generation.md §2). */
export const DEFAULT_CV_SECTIONS: readonly CvSection[] = [
  'education',
  'skills',
  'experience',
  'leadership',
  'training',
  'awards',
  'certifications',
];

/** An unlabeled highlight belongs to every variant; a labeled one to variants sharing a focus. */
export function showsHighlight(item: Pick<Highlight, 'focus'>, focus: readonly FocusArea[]): boolean {
  return !item.focus || item.focus.some((area) => focus.includes(area));
}

/**
 * The highlights a variant shows. With `keepOne`, an entry that must stay on the CV (a job, a degree)
 * keeps its first highlight when none match, so it never appears empty.
 */
export function pickHighlights<T extends Pick<Highlight, 'focus'>>(
  highlights: readonly T[],
  focus: readonly FocusArea[],
  keepOne = false,
): T[] {
  const picked = highlights.filter((item) => showsHighlight(item, focus));
  return picked.length === 0 && keepOne ? highlights.slice(0, 1) : picked;
}

export interface CvContent {
  experience: Experience[];
  education: Education[];
  trainings: Training[];
  skills: SkillGroup[];
}

/**
 * Apply a variant: jobs and degrees always stay (no gaps in the work history); leadership roles and
 * trainings whose highlights all belong to other focus areas are left out; skill groups follow the variant's order.
 * Awards and certifications are not filtered.
 */
export function applyVariant(content: CvContent, variant: Pick<CvVariant, 'focus' | 'skills'>): CvContent {
  const { focus } = variant;
  const experience = content.experience.flatMap((item) => {
    const required = PROFESSIONAL_CATEGORIES.includes(item.category);
    const highlights = pickHighlights(item.highlights, focus, required);
    return highlights.length > 0 ? [{ ...item, highlights }] : [];
  });
  const education = content.education.map((item) => ({
    ...item,
    highlights: pickHighlights(item.highlights, focus),
  }));
  const trainings = content.trainings.flatMap((item) => {
    const highlights = pickHighlights(item.highlights, focus);
    // A training listed without highlights is kept as it is in the general CV.
    return item.highlights.length === 0 || highlights.length > 0 ? [{ ...item, highlights }] : [];
  });
  const skills = variant.skills
    ? variant.skills.flatMap((id) => content.skills.filter((group) => group.id === id))
    : content.skills;
  return { experience, education, trainings, skills };
}
