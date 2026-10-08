#!/usr/bin/env bun
/**
 * "Ask Harry" assistant entry point (T11.2, ADR 0014). Configuration through environment variables:
 *   ASSISTANT_ENABLED        "true" turns the feature on (default off: the kill switch)
 *   GEMINI_API_KEY           primary provider, with the full knowledge
 *   GROQ_API_KEY             fallback provider, with the compact knowledge
 *   ASSISTANT_KNOWLEDGE_DIR  folder with knowledge.json and knowledge-compact.json (default build-meta)
 *   ASSISTANT_PORT           port (default 8788)
 *   ASSISTANT_SITE_HOST      public site host allowed as Origin (default harry.mardika.my.id)
 * Keys are separate from the case study draft keys (T11.6) and never logged.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createHandler, MAX_BODY_BYTES, type Route } from './handler';
import {
  ANSWER_JSON_SCHEMA,
  KNOWLEDGE_COMPACT_FILE,
  KNOWLEDGE_FILE,
  knowledgeSchema,
  type Knowledge,
} from '../../src/lib/assistant';
import { gemini, groq } from '../../src/lib/ai';

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;

const dir = env('ASSISTANT_KNOWLEDGE_DIR') ?? 'build-meta';
const load = (file: string): Knowledge =>
  knowledgeSchema.parse(JSON.parse(readFileSync(join(dir, file), 'utf8')));
const full = load(KNOWLEDGE_FILE);
const compact = load(KNOWLEDGE_COMPACT_FILE);

// Within the 20 s budget: Gemini 12 s then Groq 8 s, or Groq alone 15 s. The chat never retries a busy
// model. Groq gets 2 earlier messages and low reasoning effort to stay within its 8k tokens per minute.
const routes: Route[] = [];
const geminiKey = env('GEMINI_API_KEY');
const groqKey = env('GROQ_API_KEY');
if (geminiKey) {
  routes.push({ provider: gemini(geminiKey, { retries: 0, timeoutMs: 12_000 }), knowledge: full });
}
if (groqKey) {
  routes.push({
    provider: groq(groqKey, {
      retries: 0,
      timeoutMs: geminiKey ? 8_000 : 15_000,
      jsonSchema: { name: 'ask_harry_answer', schema: ANSWER_JSON_SCHEMA },
      reasoningEffort: 'low',
      maxTokens: 1_024,
    }),
    knowledge: compact,
    maxHistory: 2,
  });
}

const enabled = env('ASSISTANT_ENABLED') === 'true' && routes.length > 0;
const handler = createHandler({
  enabled,
  siteHost: env('ASSISTANT_SITE_HOST') ?? 'harry.mardika.my.id',
  routes,
});

const server = Bun.serve({
  port: Number(env('ASSISTANT_PORT') ?? 8788),
  maxRequestBodySize: MAX_BODY_BYTES,
  fetch: handler,
});
console.log(
  `assistant: listening on ${server.url}; ${enabled ? 'enabled' : 'disabled'}, ` +
    `providers: ${routes.map((route) => route.provider.name).join(', ') || 'none'}, ` +
    `knowledge: ${full.sections.length} sections`,
);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => void server.stop().then(() => process.exit(0)));
}
