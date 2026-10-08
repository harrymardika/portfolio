/**
 * Build-time source of the assistant's knowledge (T11.1, ADR 0014), read with the same queries as the
 * pages so it holds only what the public site shows. scripts/generate-knowledge.ts checks it against the
 * build output, writes the knowledge files to build-meta/, and removes this file from the site.
 */
import type { APIRoute } from 'astro';

import { buildKnowledgeSource } from '@/lib/assistant';
import {
  getAwards,
  getCaseStudyBody,
  getCertifications,
  getCvVariants,
  getEducation,
  getExperience,
  getMessages,
  getProfile,
  getProjectItems,
  getProjects,
  getSkillGroups,
  getTrainings,
} from '@/lib/content/queries';
import { allDownloads, DOWNLOADS_DIR, variantDownloads } from '@/lib/downloads';
import { UI } from '@/lib/i18n';

import type { LocalizedText } from '@/lib/content';

/** Case study bodies by slug; Indonesian only when the case study has been translated. */
async function caseStudyBodies(): Promise<Record<string, LocalizedText>> {
  const entries = await Promise.all(
    (await getProjects()).map(async (project) => {
      const translated = await getCaseStudyBody(project, 'id');
      const en = project.body ?? '';
      const id = translated.isFallback ? undefined : translated.entry.body;
      return [project.id, id ? { en, id } : { en }] as const;
    }),
  );
  return Object.fromEntries(entries.filter(([, body]) => body.en.trim() !== ''));
}

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('The assistant knowledge needs `site` in astro.config.ts');
  const profile = await getProfile();
  const [
    experience,
    education,
    trainings,
    awards,
    certifications,
    skills,
    projects,
    caseStudies,
    cvVariants,
  ] = await Promise.all([
    getExperience(),
    getEducation(),
    getTrainings(),
    getAwards(),
    getCertifications(),
    getSkillGroups('web'),
    getProjectItems(),
    caseStudyBodies(),
    getCvVariants(),
  ]);
  const source = buildKnowledgeSource({
    site: site.origin,
    profile,
    experience,
    education,
    trainings,
    awards,
    certifications,
    skills,
    projects,
    caseStudies,
    cvVariants,
    messages: await getMessages(),
    // The main PDFs and the CVs by role (/cv/), so an answer can link the exact file.
    files: [...allDownloads(profile.name), ...variantDownloads(profile.name, cvVariants)].map(
      (download) => `/${DOWNLOADS_DIR}/${download.file}`,
    ),
    presentLabel: { en: UI.en['date.present'], id: UI.id['date.present'] },
  });
  return new Response(JSON.stringify(source), { headers: { 'Content-Type': 'application/json' } });
};
