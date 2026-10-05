import { toYearMonth } from './dates';
import type { Certification } from './schemas';

/**
 * A certification is shown while its expiry month has not passed.
 * "Expires 2026-07" means it is still valid during July 2026 and hidden from August 2026.
 */
export function isActiveCertification(cert: Pick<Certification, 'expires'>, now: Date): boolean {
  return cert.expires === undefined || cert.expires >= toYearMonth(now);
}
