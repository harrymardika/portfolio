/** Fill `{name}` placeholders in a UI string: fill('Showing {shown} of {total}', { shown: 3, total: 9 }). */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
