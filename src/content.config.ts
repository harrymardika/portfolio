/**
 * Content collections. Every file in `content/` is validated here at build time;
 * an invalid file fails the build with the file name and field path.
 * Schemas live in src/lib/content/schemas so they can be unit-tested without Astro.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';

import {
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  milestoneSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  trainingSchema,
} from '@/lib/content/schemas';
import { parseYamlList, parseYamlSingleton } from '@/lib/content/yaml';

const CONTENT_DIR = 'content';

/** A YAML file whose entries sit under a top-level key such as `items:`. */
function listFile(name: string, key = 'items') {
  return file(`${CONTENT_DIR}/${name}.yaml`, { parser: (text) => parseYamlList(text, key) });
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
  skills: defineCollection({ loader: listFile('skills', 'groups'), schema: skillGroupSchema }),
  journey: defineCollection({ loader: listFile('journey', 'milestones'), schema: milestoneSchema }),
  projects: defineCollection({
    // `<slug>.id.md` translation files are handled separately (T2.4).
    loader: glob({ pattern: ['*.md', '!*.id.md'], base: `./${CONTENT_DIR}/projects` }),
    schema: projectSchema,
  }),
};
