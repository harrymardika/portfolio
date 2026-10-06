import type { APIRoute } from 'astro';

import { buildRobots } from '@/lib/seo';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('robots.txt needs `site` in astro.config.ts');
  return new Response(buildRobots(site), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
