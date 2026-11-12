/** Joins truthy class names. Intentionally tiny; see README "Styling" for why no tailwind-merge. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
