/**
 * Joins truthy class names. Deliberately no tailwind-merge: `className` is for layout only and
 * visual changes go through variants, so conflicting classes shouldn't arise.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
