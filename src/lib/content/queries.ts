/**
 * Data access for pages and layouts. This is the only module in lib/content that touches
 * `astro:content`; everything it returns is already filtered and sorted with the pure helpers.
 * Not importable from unit tests (Astro virtual modules); cover the pure helpers instead.
 */
import { getCollection, getEntry } from 'astro:content';

import { isActiveCertification } from './certifications';
import { resolveMilestoneSource, type MilestoneSource } from './journey';
import { compareDatesDesc, compareRangesDesc, sortedBy } from './ordering';
import { compareProjects, isPublished } from './projects';
import { visibleOn, type Surface } from './visibility';

import type {
  Award,
  Certification,
  Education,
  Experience,
  Homelab,
  Milestone,
  Profile,
  SkillGroup,
  Training,
} from './schemas';

const dataOf = async <T>(entries: Promise<{ data: T }[]>): Promise<T[]> => (await entries).map((e) => e.data);

export async function getProfile(): Promise<Profile> {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error('content/profile.yaml is missing');
  return entry.data;
}

export async function getHomelab(): Promise<Homelab> {
  const entry = await getEntry('homelab', 'homelab');
  if (!entry) throw new Error('content/homelab.yaml is missing');
  return entry.data;
}

export async function getExperience(surface: Surface = 'web'): Promise<Experience[]> {
  return sortedBy(visibleOn(await dataOf(getCollection('experience')), surface), compareRangesDesc);
}

export async function getEducation(surface: Surface = 'web'): Promise<Education[]> {
  return sortedBy(visibleOn(await dataOf(getCollection('education')), surface), compareRangesDesc);
}

export async function getTrainings(surface: Surface = 'web'): Promise<Training[]> {
  return sortedBy(visibleOn(await dataOf(getCollection('trainings')), surface), compareRangesDesc);
}

export async function getAwards(surface: Surface = 'web'): Promise<Award[]> {
  return sortedBy(visibleOn(await dataOf(getCollection('awards')), surface), (a, b) =>
    compareDatesDesc(a.date, b.date),
  );
}

/** Active certifications only; `now` is injectable so builds and tests are reproducible. */
export async function getCertifications(now: Date = new Date()): Promise<Certification[]> {
  const active = (await dataOf(getCollection('certifications'))).filter((c) => isActiveCertification(c, now));
  return sortedBy(active, (a, b) => compareDatesDesc(a.issued, b.issued));
}

const byPosition = (a: { position: number }, b: { position: number }): number => a.position - b.position;

/** Skill groups in file order (Astro returns entries sorted by id). */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  return sortedBy(await dataOf(getCollection('skills')), byPosition);
}

/** Journey milestones in file order (oldest first), as the 3D path expects. */
export async function getMilestones(): Promise<Milestone[]> {
  return sortedBy(await dataOf(getCollection('journey')), byPosition);
}

/** Published projects, featured first. Entries keep their `id` (the file slug) for routing. */
export async function getProjects() {
  const entries = (await getCollection('projects')).filter((entry) => isPublished(entry.data));
  return sortedBy(entries, (a, b) => compareProjects(a.data, b.data));
}

/** Milestones with the item each one summarizes, for the Journey section and its detail popovers. */
export async function getJourney(): Promise<{ milestone: Milestone; source: MilestoneSource | null }[]> {
  const [milestones, experience, education, trainings, awards] = await Promise.all([
    getMilestones(),
    dataOf(getCollection('experience')),
    dataOf(getCollection('education')),
    dataOf(getCollection('trainings')),
    dataOf(getCollection('awards')),
  ]);
  const sources = { experience, education, trainings, awards };
  return milestones.map((milestone) => ({ milestone, source: resolveMilestoneSource(milestone, sources) }));
}
