/**
 * Link journey milestones to the item they summarize (`ref` in journey.yaml),
 * so the detail popover can tell the full story. Pure: callers pass the collections.
 */
import type { Award, Education, Experience, Milestone, Training } from './schemas';

export type MilestoneSource =
  | { readonly kind: 'experience'; readonly item: Experience }
  | { readonly kind: 'education'; readonly item: Education }
  | { readonly kind: 'training'; readonly item: Training }
  | { readonly kind: 'award'; readonly item: Award };

export interface JourneySources {
  readonly experience: readonly Experience[];
  readonly education: readonly Education[];
  readonly trainings: readonly Training[];
  readonly awards: readonly Award[];
}

export function resolveMilestoneSource(
  milestone: Pick<Milestone, 'ref'>,
  sources: JourneySources,
): MilestoneSource | null {
  const { ref } = milestone;
  if (ref === undefined) return null;
  const experience = sources.experience.find((item) => item.id === ref);
  if (experience) return { kind: 'experience', item: experience };
  const education = sources.education.find((item) => item.id === ref);
  if (education) return { kind: 'education', item: education };
  const training = sources.trainings.find((item) => item.id === ref);
  if (training) return { kind: 'training', item: training };
  const award = sources.awards.find((item) => item.id === ref);
  if (award) return { kind: 'award', item: award };
  return null;
}

/** First and last milestone year, e.g. `{ from: 2022, to: 2026 }`; null for an empty journey. */
export function journeySpan(milestones: readonly Pick<Milestone, 'year'>[]): { from: number; to: number } | null {
  if (milestones.length === 0) return null;
  const years = milestones.map((m) => m.year);
  return { from: Math.min(...years), to: Math.max(...years) };
}
