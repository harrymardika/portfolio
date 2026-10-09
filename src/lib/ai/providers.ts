/**
 * Model providers shared by the case study drafts (ADR 0013) and the "Ask Harry" assistant (ADR 0014):
 * Gemini first, Groq as the fallback. `fetch` is injectable for tests. API keys go only into request
 * headers and never into messages or errors.
 */
export interface Prompt {
  readonly system: string;
  readonly user: string;
}

export interface Provider {
  readonly name: string;
  readonly model: string;
  /** Raw model text, expected to be one JSON object. */
  complete(prompt: Prompt): Promise<string>;
}

/** A JSON schema that Groq enforces strictly (`response_format: json_schema`). */
export interface JsonSchemaSpec {
  readonly name: string;
  readonly schema: Readonly<Record<string, unknown>>;
}

export interface ProviderOptions {
  readonly fetch?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  /** Retries of a busy or rate-limited answer (429, 5xx); the chat uses 0 and moves on to the fallback. */
  readonly retries?: number;
  /** Wait before a retry. */
  readonly retryDelayMs?: number;
  readonly timeoutMs?: number;
  readonly model?: string;
  /** Groq only: the strict JSON schema of the answer; without it, plain JSON mode. */
  readonly jsonSchema?: JsonSchemaSpec;
  /** Groq only. Gemini 3 models are tuned for their default temperature; lower values can make them loop. */
  readonly temperature?: number;
  /** Groq only: fewer hidden reasoning tokens, so a chat stays within the per-minute token limit. */
  readonly reasoningEffort?: 'low' | 'medium' | 'high';
  /** Groq only: the most tokens the answer (including reasoning) may use. */
  readonly maxTokens?: number;
}

export const GEMINI_MODEL = 'gemini-3.5-flash';
/**
 * The chatbot's Gemini model (ADR 0015): its free tier allows 500 requests a day and 15 a minute, against
 * 20 and 5 for GEMINI_MODEL, which stays with the case study drafts (a few long answers a day).
 */
export const ASSISTANT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const GROQ_MODEL = 'openai/gpt-oss-120b';
const TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 5_000;
const busy = (status: number): boolean => status === 429 || status >= 500;

/** Only identifiers (status, code, quota id) leave an error body: never free text, which may echo a prompt. */
const IDENTIFIER = /^[\w.-]{1,64}$/;

/**
 * The machine-readable cause in an error body, e.g. "RESOURCE_EXHAUSTED, GenerateRequestsPerMinute…" from
 * Gemini or "json_validate_failed" from Groq, so a log tells a per-minute limit from a daily one.
 */
async function errorCause(response: Response): Promise<string> {
  try {
    const { error } = (await response.json()) as {
      error?: {
        status?: unknown;
        code?: unknown;
        details?: { violations?: { quotaId?: unknown }[] }[];
      };
    };
    const ids = [
      error?.status,
      error?.code,
      ...(error?.details ?? []).flatMap((detail) => (detail.violations ?? []).map((v) => v.quotaId)),
    ].filter((id): id is string => typeof id === 'string' && IDENTIFIER.test(id));
    return ids.length > 0 ? ` (${[...new Set(ids)].join(', ')})` : '';
  } catch {
    return '';
  }
}

/** POST JSON; a busy or rate-limited answer (429, 5xx) is retried `retries` times after a short wait. */
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
    retries = 1,
    retryDelayMs = RETRY_DELAY_MS,
  } = options;
  for (let attempt = 0; ; attempt++) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.ok) return response.json();
    if (attempt >= retries || !busy(response.status))
      throw new Error(`${name} responded with HTTP ${response.status}${await errorCause(response)}`);
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
  const { model = GROQ_MODEL, jsonSchema, temperature = 0.3, reasoningEffort, maxTokens } = options;
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
          temperature,
          ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
          ...(maxTokens && { max_completion_tokens: maxTokens }),
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          response_format: jsonSchema
            ? {
                type: 'json_schema',
                json_schema: { name: jsonSchema.name, strict: true, schema: jsonSchema.schema },
              }
            : { type: 'json_object' },
        },
        'Groq',
      )) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Groq returned no text');
      return text;
    },
  };
}

/** Parse a model answer, stripping a ```json fence some models add despite JSON mode. */
export function parseJson(text: string): unknown {
  const fenced = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/.exec(text);
  return JSON.parse(fenced?.[1] ?? text);
}

/** A short reason for a failed provider call, without any request or answer text. */
export function failureReason(error: unknown): string {
  if (error instanceof SyntaxError) return 'answer is not valid JSON';
  if (error instanceof Error && error.name === 'TimeoutError') return 'timed out';
  return error instanceof Error ? error.message : 'unknown error';
}
