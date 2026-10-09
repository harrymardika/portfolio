/**
 * Size budgets and checks for the assistant's knowledge (T11.1, ADR 0014). Pure; used by
 * scripts/generate-knowledge.ts at build time and by the assistant service when it builds a prompt.
 */
import { PHONE_PATTERN } from '@/lib/security/contact';
import { localizePath } from '@/lib/i18n/routing';

import type { Knowledge, KnowledgeSection, KnowledgeSource } from './knowledge';

/** Full knowledge for Gemini: generous, but well under one free-tier minute of tokens. */
export const FULL_MAX_TOKENS = 25_000;
/** Compact knowledge for Groq, whose free tier allows about 8,000 tokens per minute (ADR 0014). */
export const COMPACT_MAX_TOKENS = 5_000;

/**
 * Phone numbers: the one rule shared with the content integrity test and the kind-words form
 * (src/lib/security/contact.ts). The assistant service checks its answers with it (T11.2).
 */
export { PHONE_PATTERN };

/** Share of a budget at which the build warns that the knowledge is close to its limit. */
export const BUDGET_WARNING_RATIO = 0.9;

/**
 * Rough token count without a tokenizer dependency. English and Indonesian average about four
 * characters per token; dividing by 3.5 overestimates on purpose, so the budgets hold for real.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/** Estimated tokens of the knowledge as prompt text. */
export const knowledgeTokens = (knowledge: Pick<Knowledge, 'sections'>): number =>
  estimateTokens(knowledgeText(knowledge));

/** The knowledge as prompt text: one block per section, Indonesian and detail only when present. */
export function knowledgeText(knowledge: Pick<Knowledge, 'sections'>): string {
  return knowledge.sections
    .map(({ key, path, text, detail }) =>
      [
        `## ${key} (${path})`,
        text.en,
        text.id && `[id] ${text.id}`,
        detail?.en,
        detail?.id && `[id] ${detail.id}`,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');
}

/** The compact knowledge: English only, without `detail` (extra highlights, tags, links, case study bodies). */
export function toCompact(knowledge: Knowledge): Knowledge {
  return {
    ...knowledge,
    sections: knowledge.sections.map(({ key, path, text }): KnowledgeSection => ({
      key,
      path,
      text: { en: text.en },
    })),
  };
}

/** Site pages from the build output's files (`/` separators), without print pages, the OG template, and the 404 page. */
export function pagePaths(htmlFiles: readonly string[]): string[] {
  return htmlFiles
    .filter((file) => /(^|\/)index\.html$/.test(file))
    .map((file) => `/${file.slice(0, -'index.html'.length)}`)
    .filter((path) => !/^\/(id\/)?(print|og-template)\//.test(path))
    .sort();
}

/**
 * Check the source against the build output and list every path an answer may link to.
 * Throws with the missing paths, so a renamed page fails the build instead of producing dead links.
 */
export function finalizeKnowledge(
  source: KnowledgeSource,
  output: { readonly pages: readonly string[]; readonly files: ReadonlySet<string> },
): Knowledge {
  const pages = new Set(output.pages);
  const missingPages = [
    ...new Set(source.sections.flatMap(({ path }) => [path, localizePath(path, 'id')])),
  ].filter((path) => !pages.has(path));
  const missingFiles = source.files.filter((file) => !output.files.has(file));
  if (missingPages.length > 0 || missingFiles.length > 0) {
    throw new Error(
      `Assistant knowledge links to paths the build does not have: ${[...missingPages, ...missingFiles].join(', ')}. ` +
        'Update src/lib/assistant/sections.ts or the page it points to.',
    );
  }
  return {
    version: source.version,
    site: source.site,
    paths: [...output.pages, ...source.files].sort(),
    sections: source.sections,
  };
}

/** Problems that must stop the build: a phone number, or knowledge over its token budget. */
export function knowledgeProblems(knowledge: Knowledge, maxTokens: number): string[] {
  const text = knowledgeText(knowledge);
  const tokens = knowledgeTokens(knowledge);
  return [
    ...(PHONE_PATTERN.test(text) ? ['contains something that looks like a phone number'] : []),
    ...(tokens > maxTokens ? [`is about ${tokens} tokens, over the budget of ${maxTokens}`] : []),
  ];
}
