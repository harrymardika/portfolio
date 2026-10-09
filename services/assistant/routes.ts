/**
 * The providers the assistant asks, in order, with their knowledge and limits (ADR 0014, 0015). Shared by the
 * service (server.ts) and the evaluation (scripts/assistant-eval.ts), so the evaluation tests the exact
 * production setup. Also loads the knowledge files a build wrote.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ASSISTANT_GEMINI_MODEL, gemini, groq, type ProviderOptions } from '../../src/lib/ai';
import {
  ANSWER_JSON_SCHEMA,
  KNOWLEDGE_COMPACT_FILE,
  KNOWLEDGE_FILE,
  knowledgeSchema,
  type Knowledge,
} from '../../src/lib/assistant';

import type { Route } from './handler';

export interface RouteKeys {
  readonly geminiKey?: string | undefined;
  readonly groqKey?: string | undefined;
}

/** Both knowledge files from a build's meta folder (build-meta/ or the image's /app/knowledge). */
export function loadKnowledge(dir: string): { full: Knowledge; compact: Knowledge } {
  const load = (file: string): Knowledge =>
    knowledgeSchema.parse(JSON.parse(readFileSync(join(dir, file), 'utf8')));
  return { full: load(KNOWLEDGE_FILE), compact: load(KNOWLEDGE_COMPACT_FILE) };
}

/**
 * Gemini Flash Lite first with the full knowledge, then Groq (ADR 0015), within the 20 s budget: Gemini 12 s
 * then Groq 8 s, or Groq alone 15 s. The chat never retries a busy model. Groq gets the compact knowledge,
 * 2 earlier messages, and low reasoning effort to stay within its 8k tokens per minute. `options` lets tests
 * inject a fake fetch.
 */
export function createRoutes(
  { geminiKey, groqKey }: RouteKeys,
  knowledge: { full: Knowledge; compact: Knowledge },
  options: Pick<ProviderOptions, 'fetch'> = {},
): Route[] {
  const routes: Route[] = [];
  if (geminiKey) {
    routes.push({
      provider: gemini(geminiKey, {
        ...options,
        model: ASSISTANT_GEMINI_MODEL,
        retries: 0,
        timeoutMs: 12_000,
      }),
      knowledge: knowledge.full,
    });
  }
  if (groqKey) {
    routes.push({
      provider: groq(groqKey, {
        ...options,
        retries: 0,
        timeoutMs: geminiKey ? 8_000 : 15_000,
        jsonSchema: { name: 'ask_harry_answer', schema: ANSWER_JSON_SCHEMA },
        reasoningEffort: 'low',
        maxTokens: 1_024,
      }),
      knowledge: knowledge.compact,
      maxHistory: 2,
    });
  }
  return routes;
}
