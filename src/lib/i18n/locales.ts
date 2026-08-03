import type { Locale } from "./types";

export const LOCALES: readonly Locale[] = ["en", "pt-BR"];

export const DEFAULT_LOCALE: Locale = "en";

/** Narrows an arbitrary string (e.g. a URL segment) to a supported locale. */
export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the locale for a request without a locale prefix.
 *
 * Order: a valid `top-tracks-locale` cookie wins, then any `pt*` entry in
 * `Accept-Language` maps to `pt-BR`, otherwise the default (`en`).
 */
export function negotiateLocale(
  acceptLanguageHeader: string | null,
  cookieValue: string | null,
): Locale {
  if (cookieValue && hasLocale(cookieValue)) {
    return cookieValue;
  }
  if (prefersPortuguese(acceptLanguageHeader)) {
    return "pt-BR";
  }
  return DEFAULT_LOCALE;
}

function prefersPortuguese(acceptLanguageHeader: string | null): boolean {
  if (!acceptLanguageHeader) {
    return false;
  }
  return acceptLanguageHeader
    .split(",")
    .map(extractLanguageTag)
    .some(isPortugueseTag);
}

function extractLanguageTag(headerEntry: string): string {
  return headerEntry.split(";")[0].trim().toLowerCase();
}

function isPortugueseTag(languageTag: string): boolean {
  return languageTag === "pt" || languageTag.startsWith("pt-");
}
