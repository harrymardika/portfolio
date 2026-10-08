#!/usr/bin/env bun
/**
 * Write the assistant's knowledge (T11.1, ADR 0014) from the finished build: the endpoint
 * src/pages/assistant-knowledge.json.ts is checked against the pages and files in the output, then
 * written as <BUILD_META_DIR>/knowledge.json (full, Gemini) and knowledge-compact.json (Groq), and removed
 * from the site. Fails the build on a dead link, a phone number, or knowledge over its token budget.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  BUDGET_WARNING_RATIO,
  COMPACT_MAX_TOKENS,
  finalizeKnowledge,
  FULL_MAX_TOKENS,
  KNOWLEDGE_COMPACT_FILE,
  KNOWLEDGE_FILE,
  KNOWLEDGE_SOURCE_FILE,
  knowledgeProblems,
  knowledgeSchema,
  knowledgeSourceSchema,
  knowledgeTokens,
  pagePaths,
  toCompact,
} from '../src/lib/assistant';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');
const META_DIR = resolve(ROOT, process.env['BUILD_META_DIR'] ?? 'build-meta');
const SOURCE = join(OUT_DIR, KNOWLEDGE_SOURCE_FILE);
const HELP = 'See docs/10-operations.md §5.8 and ADR 0014.';

const sourceText = await readFile(SOURCE, 'utf8').catch(() => {
  console.error(
    `Assistant knowledge: ${SOURCE} is missing. Run \`astro build\` first (this step removes it).`,
  );
  process.exit(1);
});
const source = knowledgeSourceSchema.parse(JSON.parse(sourceText));
const outputFiles = (await readdir(OUT_DIR, { recursive: true })).map((file) => file.replaceAll('\\', '/'));
// Parsed again so the service (T11.2) never receives a file it would reject, e.g. a path with `%`.
const full = knowledgeSchema.parse(
  finalizeKnowledge(source, {
    pages: pagePaths(outputFiles),
    files: new Set(outputFiles.map((file) => `/${file}`)),
  }),
);
const compact = knowledgeSchema.parse(toCompact(full));

const budgets = [
  { file: KNOWLEDGE_FILE, knowledge: full, max: FULL_MAX_TOKENS },
  { file: KNOWLEDGE_COMPACT_FILE, knowledge: compact, max: COMPACT_MAX_TOKENS },
];
const problems = budgets.flatMap(({ file, knowledge, max }) =>
  knowledgeProblems(knowledge, max).map((problem) => `${file} ${problem}`),
);
if (problems.length > 0) {
  console.error(`Assistant knowledge: ${problems.join('; ')}. ${HELP}`);
  process.exit(1);
}
for (const { file, knowledge, max } of budgets) {
  const tokens = knowledgeTokens(knowledge);
  if (tokens > max * BUDGET_WARNING_RATIO) {
    console.warn(
      `Assistant knowledge: ${file} is ~${tokens} of ${max} tokens; the build fails above ${max}. ${HELP}`,
    );
  }
}

await mkdir(META_DIR, { recursive: true });
await writeFile(join(META_DIR, KNOWLEDGE_FILE), `${JSON.stringify(full, null, 2)}\n`);
await writeFile(join(META_DIR, KNOWLEDGE_COMPACT_FILE), `${JSON.stringify(compact, null, 2)}\n`);
// The knowledge belongs to the assistant service, not the public site.
await rm(SOURCE);

console.log(
  `Assistant knowledge: ${full.sections.length} sections, ${full.paths.length} linkable paths; ` +
    budgets
      .map(({ file, knowledge, max }) => `${file} ~${knowledgeTokens(knowledge)} tokens (≤ ${max})`)
      .join(', ') +
    ` → ${META_DIR}`,
);
