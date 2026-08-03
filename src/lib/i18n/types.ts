import type englishDictionary from "./dictionaries/en.json";

export type Locale = "en" | "pt-BR";

/**
 * Derived from the English dictionary so a key missing from another locale's
 * JSON fails to compile — the structural half of the string-drift mitigation.
 */
export type Dictionary = typeof englishDictionary;

export type MessageValues = Record<string, string | number>;
