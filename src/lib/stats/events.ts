/**
 * The one place that defines statistics events (docs/08-analytics.md, ADR 0009).
 * Shared by the page beacon and the stats service; pure (Zod only).
 */
import { z } from 'astro/zod';

import { LOCALES } from '@/lib/i18n/locales';

export const EVENT_TYPES = ['pageview', 'download', 'outbound'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const DOWNLOAD_DETAILS = ['cv', 'portfolio'] as const;
export const OUTBOUND_DETAILS = ['linkedin', 'instagram', 'github', 'medium', 'email'] as const;

/** Where the beacon posts; Caddy routes /api/stats/* to the stats service. */
export const STATS_EVENT_URL = '/api/stats/event';
export const STATS_SUMMARY_URL = '/api/stats/summary';

const path = z
  .string()
  .max(200)
  .regex(/^\/[^?#\s]*$/, 'path must start with / and contain no query or fragment');

/** Body the beacon sends. Strict: unknown keys are rejected. */
export const eventPayloadSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('pageview'),
    path,
    lang: z.enum(LOCALES),
    /** document.referrer; reduced to its host by the service, never stored in full. */
    referrer: z.string().max(500).optional(),
    /** Value of ?ref= on the landing page (private, owner-only). */
    ref: z
      .string()
      .max(60)
      .regex(/^[a-z0-9-]+$/, 'ref must be lowercase letters, digits, and dashes')
      .optional(),
  }),
  z.strictObject({
    type: z.literal('download'),
    path,
    lang: z.enum(LOCALES),
    detail: z.enum(DOWNLOAD_DETAILS),
  }),
  z.strictObject({
    type: z.literal('outbound'),
    path,
    lang: z.enum(LOCALES),
    detail: z.enum(OUTBOUND_DETAILS),
  }),
]);

export type EventPayload = z.infer<typeof eventPayloadSchema>;
