/**
 * Content collections. Every file in `content/` is validated here at build time;
 * an invalid file fails the build with the file name and field path.
 * Schemas live in src/lib/content/schemas so they can be unit-tested without Astro.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

import {
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  homelabSchema,
  milestoneSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  trainingSchema,
} from '@/lib/content/schemas';
import { parseYamlList, parseYamlSingleton, type ListOptions } from '@/lib/content/yaml';
import { githubCacheSchema, githubRepoSchema } from '@/lib/github/schemas';

const CONTENT_DIR = 'content';

/** A YAML file whose entries sit under a top-level key such as `items:`. */
function listFile(name: string, key = 'items', options: ListOptions = {}) {
  return file(`${CONTENT_DIR}/${name}.yaml`, { parser: (text) => parseYamlList(text, key, options) });
}

/**
 * Written by scripts/fetch-github.ts before each build; a fresh clone without it has no GitHub projects.
 * GITHUB_CACHE points e2e builds at a separate file so test fixtures never leak into dev or production.
 */
const GITHUB_CACHE = join(process.cwd(), process.env['GITHUB_CACHE'] ?? 'src/data/generated/github.json');

async function loadGithubRepos() {
  const text = await readFile(GITHUB_CACHE, 'utf8').catch(() => null);
  if (text === null) return [];
  return githubCacheSchema.parse(JSON.parse(text)).repos.map((repo) => ({ id: repo.name, ...repo }));
}

export const collections = {
  profile: defineCollection({
    loader: file(`${CONTENT_DIR}/profile.yaml`, { parser: (text) => parseYamlSingleton(text, 'profile') }),
    schema: profileSchema,
  }),
  homelab: defineCollection({
    loader: file(`${CONTENT_DIR}/homelab.yaml`, { parser: (text) => parseYamlSingleton(text, 'homelab') }),
    schema: homelabSchema,
  }),
  experience: defineCollection({ loader: listFile('experience'), schema: experienceSchema }),
  education: defineCollection({ loader: listFile('education'), schema: educationSchema }),
  awards: defineCollection({ loader: listFile('awards'), schema: awardSchema }),
  trainings: defineCollection({ loader: listFile('trainings'), schema: trainingSchema }),
  certifications: defineCollection({ loader: listFile('certifications'), schema: certificationSchema }),
  // Order matters for these two, so the parser records each entry's position in the file.
  skills: defineCollection({
    loader: listFile('skills', 'groups', { withPosition: true }),
    schema: skillGroupSchema,
  }),
  journey: defineCollection({
    loader: listFile('journey', 'milestones', { withPosition: true }),
    schema: milestoneSchema,
  }),
  githubRepos: defineCollection({
    loader: loadGithubRepos,
    schema: githubRepoSchema.extend({ id: githubRepoSchema.shape.name }),
  }),
  projects: defineCollection({
    // `<slug>.id.md` translation files are handled separately (T2.4).
    loader: glob({ pattern: ['*.md', '!*.id.md'], base: `./${CONTENT_DIR}/projects` }),
    schema: projectSchema,
  }),
};
