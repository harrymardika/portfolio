/**
 * Primary navigation. Add an item when its page exists (T2.4 projects, T2.5 about, T2.7 homelab),
 * so the site never links to a 404. Paths are locale-neutral; render them with `localizePath`.
 */
import type { UiKey } from '@/lib/i18n';

export interface NavItem {
  readonly labelKey: UiKey;
  readonly path: string;
}

export const NAV_ITEMS: readonly NavItem[] = [{ labelKey: 'nav.projects', path: '/projects/' }];

/** Display names for social platforms (proper nouns, identical in every locale). */
export const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  github: 'GitHub',
  email: 'Email',
} as const;
