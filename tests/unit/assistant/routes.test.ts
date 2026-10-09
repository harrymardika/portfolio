import { describe, expect, it } from 'bun:test';

import { createRoutes } from '../../../services/assistant/routes';

import type { Knowledge } from '@/lib/assistant';

const knowledge = (key: string): Knowledge => ({
  version: 1,
  site: 'https://example.com',
  paths: ['/'],
  sections: [{ key, path: '/', text: { en: key } }],
});
const both = { full: knowledge('full'), compact: knowledge('compact') };

/** Records each request body and answers with an empty object, so the settings sent can be checked. */
function recorder(): { fetch: typeof fetch; bodies: Record<string, unknown>[] } {
  const bodies: Record<string, unknown>[] = [];
  const impl = (async (_url: string, init: RequestInit) => {
    bodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
    return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }));
  }) as unknown as typeof fetch;
  return { fetch: impl, bodies };
}

describe('createRoutes', () => {
  it('asks Gemini Flash Lite with the full knowledge first, then Groq with the compact one and two earlier messages', () => {
    const routes = createRoutes({ geminiKey: 'g', groqKey: 'q' }, both);
    expect(
      routes.map((r) => [r.provider.name, r.provider.model, r.knowledge.sections[0]?.key, r.maxHistory]),
    ).toEqual([
      ['Gemini', 'gemini-3.5-flash-lite', 'full', undefined],
      ['Groq', 'openai/gpt-oss-120b', 'compact', 2],
    ]);
  });

  it('skips a provider without a key', () => {
    expect(createRoutes({ groqKey: 'q' }, both).map((r) => r.provider.name)).toEqual(['Groq']);
    expect(createRoutes({}, both)).toEqual([]);
  });

  it('sends Groq the strict answer schema, low reasoning effort, and an answer token cap', async () => {
    const { fetch, bodies } = recorder();
    const [groq] = createRoutes({ groqKey: 'q' }, both, { fetch });
    await groq?.provider.complete({ system: 's', user: 'u' });
    expect(bodies[0]).toMatchObject({
      reasoning_effort: 'low',
      max_completion_tokens: 1_024,
      response_format: { type: 'json_schema', json_schema: { name: 'ask_harry_answer', strict: true } },
    });
  });
});
