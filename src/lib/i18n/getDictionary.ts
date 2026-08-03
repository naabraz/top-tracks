import "server-only";
import type { Dictionary, Locale } from "./types";

/**
 * Lazy per-locale imports keep each dictionary out of the server bundle until
 * its locale is actually rendered — and typing the map as `Dictionary` makes
 * a key missing from `pt-BR.json` a compile-time error.
 */
const DICTIONARY_LOADERS: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  "pt-BR": () => import("./dictionaries/pt-BR.json").then((module) => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return DICTIONARY_LOADERS[locale]();
}
