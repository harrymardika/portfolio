/**
 * Model providers for case study drafts (T8.2, ADR 0013): Gemini first, Groq as the fallback.
 * `fetch` is injectable for tests. API keys go only into request headers and never into messages.
 */
import { DRAFT_JSON_SCHEMA, draftSchema, normalizeAnswer, unsafeContent, type Draft } from './schema';
import type { Prompt } from './prompt';

export interface Provider {
  readonly name: string;
  readonly model: string;
  /** Raw model text, expected to be one JSON object. */
  complete(prompt: Prompt): Promise<string>;
}

export interface ProviderOptions {
  readonly fetch?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  /** Wait before the one retry of a busy or rate-limited answer (429, 5xx). */
  readonly retryDelayMs?: number;
  readonly timeoutMs?: number;
  readonly model?: string;
}

export const GEMINI_MODEL = 'gemini-3.5-flash';
export const GROQ_MODEL = 'openai/gpt-oss-120b';
const TIMEOUT_MS = 60_000;

const RETRY_DELAY_MS = 5_000;
const busy = (status: number): boolean => status === 429 || status >= 500;

/** POST JSON; a busy or rate-limited answer (429, 5xx) is retried once after a short wait. */
async function post(
  options: ProviderOptions,
  url: string,
  headers: Record<string, string>,
  body: unknown,
  name: string,
): Promise<unknown> {
  const {
    fetch: fetchImpl = fetch,
    timeoutMs = TIMEOUT_MS,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    retryDelayMs = RETRY_DELAY_MS,
  } = options;
  for (let attempt = 1; ; attempt++) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.ok) return response.json();
    if (attempt >= 2 || !busy(response.status))
      throw new Error(`${name} responded with HTTP ${response.status}`);
    await sleep(retryDelayMs);
  }
}

export function gemini(apiKey: string, options: ProviderOptions = {}): Provider {
  const { model = GEMINI_MODEL } = options;
  return {
    name: 'Gemini',
    model,
    async complete(prompt) {
      const data = (await post(
        options,
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        { 'x-goog-api-key': apiKey },
        {
          systemInstruction: { parts: [{ text: prompt.system }] },
          contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
          // Gemini 3 models are tuned for the default temperature (1.0); lower values can make them loop.
          generationConfig: { responseMimeType: 'application/json' },
        },
        'Gemini',
      )) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
      if (!text) throw new Error('Gemini returned no text');
      return text;
    },
  };
}

export function groq(apiKey: string, options: ProviderOptions = {}): Provider {
  const { model = GROQ_MODEL } = options;
  return {
    name: 'Groq',
    model,
    async complete(prompt) {
      const data = (await post(
        options,
        'https://api.groq.com/openai/v1/chat/completions',
        { Authorization: `Bearer ${apiKey}` },
        {
          model,
          temperature: 0.3,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'case_study_draft', strict: true, schema: DRAFT_JSON_SCHEMA },
          },
        },
        'Groq',
      )) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Groq returned no text');
      return text;
    },
  };
}

/** Strip a ```json fence some models add despite JSON mode. */
function parseJson(text: string): unknown {
  const fenced = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/.exec(text);
  return JSON.parse(fenced?.[1] ?? text);
}

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
      const message = error instanceof SyntaxError ? 'answer is not valid JSON' : (error as Error).message;
      failures.push(`${provider.name}: ${message}`);
    }
  }
  return { ok: false, failures };
}
