import { describe, expect, it } from 'bun:test';

import { createHandler, type AssistantOptions, type Route } from '../../../services/assistant/handler';
import { createLimiter, type Knowledge } from '@/lib/assistant';
import type { Provider } from '@/lib/ai';

const knowledge: Knowledge = {
  version: 1,
  site: 'https://example.com',
  paths: ['/', '/about/', '/id/', '/id/about/'],
  sections: [{ key: 'profile', path: '/', text: { en: 'Ada builds AI products.' } }],
};

const reply = (answer: string, links: { path: string; label: string }[] = []) =>
  JSON.stringify({ answer, links });

/** A provider that returns the given answers in turn (or throws an Error), recording each prompt. */
function fake(name: string, answers: (string | Error)[]): Provider & { prompts: string[] } {
  const prompts: string[] = [];
  return {
    name,
    model: `${name}-1`,
    prompts,
    complete: async (prompt) => {
      prompts.push(prompt.user);
      const next = answers.shift() ?? new Error('no more answers');
      if (next instanceof Error) throw next;
      return next;
    },
  };
}

const BROWSER = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36';

const askRequest = (body: unknown, headers: Record<string, string> = {}): Request =>
  new Request('http://assistant/api/ask', {
    method: 'POST',
    headers: {
      origin: 'https://example.com',
      'user-agent': BROWSER,
      'cf-connecting-ip': '203.0.113.7',
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const question = { question: 'What does Ada build?', lang: 'en' };

function setup(routes: Route[], overrides: Partial<AssistantOptions> = {}) {
  const logs: Record<string, unknown>[] = [];
  const handler = createHandler({
    enabled: true,
    siteHost: 'example.com',
    routes,
    now: () => new Date('2026-10-08T01:00:00Z'),
    log: (entry) => void logs.push({ ...entry }),
    ...overrides,
  });
  return { handler, logs };
}

describe('POST /api/ask', () => {
  it('answers from the first provider with checked links', async () => {
    const gemini = fake('Gemini', [reply('Ada builds AI products.', [{ path: '/about/', label: 'About' }])]);
    const { handler, logs } = setup([{ provider: gemini, knowledge }]);
    const response = await handler(askRequest(question));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      answer: 'Ada builds AI products.',
      links: [{ href: '/about/', label: 'About' }],
    });
    expect(gemini.prompts[0]).toContain('What does Ada build?');
    expect(logs).toEqual([
      { event: 'ask', status: 200, provider: 'Gemini', ms: expect.any(Number), failures: [] },
    ]);
  });

  it('falls back to the next provider when the first fails or answers unsafely', async () => {
    for (const failure of [new Error('Gemini responded with HTTP 503'), reply('See https://evil.example')]) {
      const groq = fake('Groq', [reply('Ada builds AI.')]);
      const { handler, logs } = setup([
        { provider: fake('Gemini', [failure]), knowledge },
        { provider: groq, knowledge },
      ]);
      const response = await handler(askRequest(question));
      expect(response.status).toBe(200);
      expect(logs[0]?.['provider']).toBe('Groq');
      expect((logs[0]?.['failures'] as string[])[0]).toStartWith('Gemini: ');
    }
  });

  it('answers 503 "unavailable" when every provider fails, without logging the question', async () => {
    const { handler, logs } = setup([{ provider: fake('Gemini', ['not json']), knowledge }]);
    const response = await handler(askRequest(question));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'unavailable' });
    expect(JSON.stringify(logs)).not.toContain('What does Ada build?');
    expect(logs[0]?.['failures']).toEqual(['Gemini: answer is not valid JSON']);
  });

  it('answers 503 "disabled" when the kill switch is off, without calling a model', async () => {
    const gemini = fake('Gemini', [reply('Hi')]);
    const { handler } = setup([{ provider: gemini, knowledge }], { enabled: false });
    const response = await handler(askRequest(question));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'disabled' });
    expect(gemini.prompts).toEqual([]);
  });

  it('refuses other origins, a missing origin, and bots', async () => {
    const { handler } = setup([{ provider: fake('Gemini', []), knowledge }]);
    for (const headers of [
      { origin: 'https://evil.example' },
      { origin: 'not a url' },
      { origin: '' },
      { 'user-agent': 'curl/8.0' },
    ]) {
      expect((await handler(askRequest(question, headers))).status).toBe(403);
    }
  });

  it('answers 400 to invalid JSON, an invalid question, or an oversized body', async () => {
    const { handler } = setup([{ provider: fake('Gemini', []), knowledge }]);
    for (const body of [
      '{',
      { question: '', lang: 'en' },
      { question: 'x', lang: 'en', pad: 'y'.repeat(9_000) },
    ]) {
      const response = await handler(askRequest(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'invalid' });
    }
  });

  it('refuses a body declared larger than 8 KB without reading it', async () => {
    const { handler } = setup([{ provider: fake('Gemini', []), knowledge }]);
    const response = await handler(askRequest(question, { 'content-length': '100000' }));
    expect(response.status).toBe(400);
  });

  it('gives a provider only the earlier messages its route allows', async () => {
    const groq = fake('Groq', [reply('Hi')]);
    const { handler } = setup([{ provider: groq, knowledge, maxHistory: 1 }]);
    const history = [
      { role: 'visitor', text: 'first' },
      { role: 'assistant', text: 'second' },
    ];
    await handler(askRequest({ ...question, history }));
    expect(groq.prompts[0]).toContain('"history":[{"role":"assistant","text":"second"}]');
  });

  it('answers 429 with the reason once a visitor reaches the limit', async () => {
    const { handler } = setup([{ provider: fake('Gemini', [reply('One'), reply('Two')]), knowledge }], {
      limiter: createLimiter({ perVisitorHour: 1 }),
    });
    expect((await handler(askRequest(question))).status).toBe(200);
    const limited = await handler(askRequest(question));
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: 'limit', reason: 'visitor-hour' });
    // A new User-Agent from the same address is the same visitor; another address is not.
    expect((await handler(askRequest(question, { 'user-agent': `${BROWSER} Edg/140` }))).status).toBe(429);
    expect((await handler(askRequest(question, { 'cf-connecting-ip': '198.51.100.2' }))).status).toBe(200);
  });
});

describe('GET /api/ask/health', () => {
  it('reports whether the feature is on', async () => {
    const { handler } = setup([], { enabled: false });
    const response = await handler(new Request('http://assistant/api/ask/health'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, enabled: false });
  });

  it('answers 404 to anything else', async () => {
    const { handler } = setup([]);
    expect((await handler(new Request('http://assistant/api/ask', { method: 'GET' }))).status).toBe(404);
  });
});
