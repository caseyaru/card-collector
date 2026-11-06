/**
 * Склеивает условияные CSS-классы (Tailwind) в одну строку.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
