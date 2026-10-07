/**
 * Content collections. Every file in `content/` is validated here at build time;
 * an invalid file fails the build with the file name and field path.
 * Schemas live in src/lib/content/schemas so they can be unit-tested without Astro.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

import {
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  milestoneSchema,
  profileSchema,
  projectSchema,
  projectTranslationSchema,
  skillGroupSchema,
  messageSchema,
  trainingSchema,
} from '@/lib/content/schemas';
import { parseYamlList, parseYamlSingleton, pruneEmpty, type ListOptions } from '@/lib/content/yaml';
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
  // MESSAGES_FILE points e2e builds at fixtures, like GITHUB_FIXTURE: the real file may be empty.
  messages: defineCollection({
    loader: file(process.env['MESSAGES_FILE'] ?? `${CONTENT_DIR}/messages.yaml`, {
      parser: (text) => parseYamlList(text, 'items', { withPosition: true, mayBeEmpty: true }),
    }),
    schema: messageSchema,
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
    // Not recursive: Indonesian bodies in projects/id/ are the collection below.
    loader: glob({ pattern: '*.md', base: `./${CONTENT_DIR}/projects` }),
    // Frontmatter skips the YAML parsers above, so blank values from the browser editor are removed here.
    schema: z.preprocess(pruneEmpty, projectSchema),
  }),
  // Indonesian case study bodies, matched to projects by file name (T9.3). Everything else stays in
  // the English file; the title only labels the file in the CMS.
  projectTranslations: defineCollection({
    loader: glob({ pattern: '*.md', base: `./${CONTENT_DIR}/projects/id` }),
    schema: projectTranslationSchema,
  }),
};
