export type Surface = 'web' | 'cv';

/** Keep only the items that should appear on the website or in the CV PDF. */
export function visibleOn<T extends { show_on_web: boolean; show_on_cv: boolean }>(
  items: readonly T[],
  surface: Surface,
): T[] {
  return items.filter((item) => (surface === 'web' ? item.show_on_web : item.show_on_cv));
}
