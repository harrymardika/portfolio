/**
 * The assistant's knowledge (T11.1, ADR 0014): what the "Ask Harry" chatbot may answer from. Built at
 * build time from the same queries as the pages, so it holds only what the public site shows (no drafts,
 * hidden items, expired certifications, or phone numbers). Pure types and schema; sections.ts builds it.
 */
import { z } from 'astro/zod';

/** Text in English, plus Indonesian when it differs (the full knowledge only). */
export const bilingualSchema = z.strictObject({ en: z.string().min(1), id: z.string().min(1).optional() });
export type Bilingual = z.infer<typeof bilingualSchema>;

/** Site paths: absolute, ending in `/` for pages; files such as PDFs keep their extension. */
const sitePath = z.string().regex(/^\/[\w\-./]*$/, 'Use a site path such as /projects/decklify/');

export const knowledgeSectionSchema = z.strictObject({
  /** Stable label, e.g. `experience/decklify` or `project/decklify`. */
  key: z.string().min(1),
  /** The English page that shows these facts; the Indonesian page is the same path under /id/. */
  path: sitePath,
  /** Facts for both knowledge sizes. */
  text: bilingualSchema,
  /** Long form (a case study body), only in the full knowledge. */
  detail: bilingualSchema.optional(),
});
export type KnowledgeSection = z.infer<typeof knowledgeSectionSchema>;

/** What the build endpoint emits: sections plus the downloadable files the answers may link to. */
export const knowledgeSourceSchema = z.strictObject({
  version: z.literal(1),
  site: z.url(),
  files: z.array(sitePath),
  sections: z.array(knowledgeSectionSchema).min(1),
});
export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;

/** The files the assistant service loads: sections plus every path an answer may link to. */
export const knowledgeSchema = z.strictObject({
  version: z.literal(1),
  site: z.url(),
  /** Pages in both languages and downloadable files, checked against the build output. */
  paths: z.array(sitePath).min(1),
  sections: z.array(knowledgeSectionSchema).min(1),
});
export type Knowledge = z.infer<typeof knowledgeSchema>;

/** Written by the build endpoint into the output folder, then moved out by scripts/generate-knowledge.ts. */
export const KNOWLEDGE_SOURCE_FILE = 'assistant-knowledge.json';
export const KNOWLEDGE_FILE = 'knowledge.json';
export const KNOWLEDGE_COMPACT_FILE = 'knowledge-compact.json';
