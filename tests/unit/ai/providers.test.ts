import { describe, expect, it } from 'bun:test';

import { failureReason, gemini, groq, parseJson } from '@/lib/ai';

interface Call {
  readonly url: string;
  readonly body: Record<string, unknown>;
}

function fakeFetch(responses: Response[]): { impl: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) as Record<string, unknown> });
    const next = responses.shift();
    if (!next) throw new Error('no response');
    return next;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status });
const groqAnswer = (text: string) => json({ choices: [{ message: { content: text } }] });

describe('groq', () => {
  it('uses plain JSON mode without a schema and the strict schema when given one', async () => {
    const { impl, calls } = fakeFetch([groqAnswer('{}'), groqAnswer('{}')]);
    const prompt = { system: 's', user: 'u' };
    await groq('k', { fetch: impl }).complete(prompt);
    await groq('k', { fetch: impl, jsonSchema: { name: 'answer', schema: { type: 'object' } } }).complete(
      prompt,
    );
    expect(calls[0]?.body['response_format']).toEqual({ type: 'json_object' });
    expect(calls[1]?.body['response_format']).toEqual({
      type: 'json_schema',
      json_schema: { name: 'answer', strict: true, schema: { type: 'object' } },
    });
  });
});

describe('groq options', () => {
  it('sends low reasoning effort and an answer token cap only when asked', async () => {
    const { impl, calls } = fakeFetch([groqAnswer('{}'), groqAnswer('{}')]);
    const prompt = { system: 's', user: 'u' };
    await groq('k', { fetch: impl }).complete(prompt);
    await groq('k', { fetch: impl, reasoningEffort: 'low', maxTokens: 1_024 }).complete(prompt);
    expect(calls[0]?.body).not.toContainKey('reasoning_effort');
    expect(calls[1]?.body).toMatchObject({ reasoning_effort: 'low', max_completion_tokens: 1_024 });
  });
});

describe('retries', () => {
  it('does not retry a busy model when retries is 0', async () => {
    const { impl, calls } = fakeFetch([json({}, 429)]);
    const provider = gemini('k', { fetch: impl, retries: 0 });
    await expect(provider.complete({ system: 's', user: 'u' })).rejects.toThrow(
      'Gemini responded with HTTP 429',
    );
    expect(calls).toHaveLength(1);
  });
});

describe('parseJson and failureReason', () => {
  it('parses an answer inside a json code fence', () => {
    expect(parseJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('names invalid JSON and timeouts without echoing any text', () => {
    expect(failureReason(new SyntaxError('Unexpected token'))).toBe('answer is not valid JSON');
    expect(failureReason(new DOMException('The operation timed out.', 'TimeoutError'))).toBe('timed out');
    expect(failureReason('weird')).toBe('unknown error');
  });
});
