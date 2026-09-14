/**
 * Join conditional class names.
 *
 * Use this instead of `` `base${cond ? ' active' : ''}` ``: prettier-plugin-tailwindcss
 * treats the inside of a className template literal as a class list and strips
 * the leading space, silently producing `baseactive`. Separate arguments can't
 * be collapsed that way.
 */
export function cx(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}
