/**
 * Light/dark theme choice (docs/03-design-system.md §2).
 * No stored choice means "follow the OS"; a click stores an explicit choice.
 */
export type Theme = 'light' | 'dark';

/** localStorage key, shared with the inline pre-paint script in BaseLayout. */
export const THEME_STORAGE_KEY = 'theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The theme actually shown: the stored choice, otherwise the OS preference. */
export function effectiveTheme(stored: unknown, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

/** The theme a toggle click switches to. */
export function toggledTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}
