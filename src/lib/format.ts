import type { Locale } from "@/lib/i18n/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * The locale defaults to English until the callers can read the active locale
 * from `useTranslation()` (Task 6 of the i18n feature) — pre-i18n call sites
 * keep rendering exactly what they rendered before.
 */

/**
 * Formats a count with the locale's grouping separators,
 * e.g. 1213400 -> "1,213,400" (en) / "1.213.400" (pt-BR).
 */
export function formatNumber(count: number, locale: Locale = DEFAULT_LOCALE): string {
  return count.toLocaleString(locale);
}

/**
 * Formats a large count compactly per the locale's conventions,
 * e.g. 1200000 -> "1.2M" (en) / "1,2 mi" (pt-BR).
 */
export function formatCount(count: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}
