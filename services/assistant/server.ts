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
import { createHandler, MAX_BODY_BYTES } from './handler';
import { createRoutes, loadKnowledge } from './routes';

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;

const knowledge = loadKnowledge(env('ASSISTANT_KNOWLEDGE_DIR') ?? 'build-meta');
const routes = createRoutes({ geminiKey: env('GEMINI_API_KEY'), groqKey: env('GROQ_API_KEY') }, knowledge);

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
    `knowledge: ${knowledge.full.sections.length} sections`,
);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => void server.stop().then(() => process.exit(0)));
}
