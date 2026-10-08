/**
 * Providers for case study drafts (T8.2, ADR 0013): the shared Gemini and Groq clients (src/lib/ai) with
 * the draft's strict JSON schema for Groq, and the loop that tries each in turn.
 */
import {
  failureReason,
  gemini as geminiProvider,
  groq as groqProvider,
  parseJson,
  type Prompt,
  type Provider,
  type ProviderOptions,
} from '@/lib/ai';

import { DRAFT_JSON_SCHEMA, draftSchema, normalizeAnswer, unsafeContent, type Draft } from './schema';

export { GEMINI_MODEL, GROQ_MODEL, type Provider, type ProviderOptions } from '@/lib/ai';

export const gemini = (apiKey: string, options: ProviderOptions = {}): Provider =>
  geminiProvider(apiKey, options);

export const groq = (apiKey: string, options: ProviderOptions = {}): Provider =>
  groqProvider(apiKey, { jsonSchema: { name: 'case_study_draft', schema: DRAFT_JSON_SCHEMA }, ...options });

export type DraftResult =
  | {
      readonly ok: true;
      readonly draft: Draft;
      readonly provider: string;
      readonly model: string;
      readonly failures: string[];
    }
  | { readonly ok: false; readonly failures: string[] };

/** Ask each provider in turn; the first answer that parses, validates, and is safe wins. */
export async function generateDraft(providers: readonly Provider[], prompt: Prompt): Promise<DraftResult> {
  const failures: string[] = [];
  for (const provider of providers) {
    try {
      const parsed = draftSchema.safeParse(normalizeAnswer(parseJson(await provider.complete(prompt))));
      if (!parsed.success) {
        failures.push(
          `${provider.name}: answer does not match the draft schema (${parsed.error.issues[0]?.path.join('.') ?? '?'})`,
        );
        continue;
      }
      const unsafe = unsafeContent(parsed.data);
      if (unsafe.length > 0) {
        failures.push(`${provider.name}: unsafe answer (${unsafe.join('; ')})`);
        continue;
      }
      return { ok: true, draft: parsed.data, provider: provider.name, model: provider.model, failures };
    } catch (error) {
      failures.push(`${provider.name}: ${failureReason(error)}`);
    }
  }
  return { ok: false, failures };
}
