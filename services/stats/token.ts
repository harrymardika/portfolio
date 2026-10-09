/** Bearer tokens for the owner-only endpoints, compared in constant time. */
import { timingSafeEqual } from 'node:crypto';

export function sameToken(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The token from an `Authorization: Bearer …` header, or an empty string. */
export function bearer(headers: Headers): string {
  return headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
}
