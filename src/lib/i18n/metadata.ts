import type { Metadata } from "next";
import type { Locale } from "./types";
import { getDictionary } from "./getDictionary";

/**
 * Builds the localized document metadata for a locale path. The
 * `alternates.languages` entries make each language independently indexable
 * (PRD R5); the title is part of the wordmark and stays identical in both.
 */
export async function buildMetadata(locale: Locale): Promise<Metadata> {
  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
    alternates: {
      languages: {
        en: "/en",
        "pt-BR": "/pt-BR",
      },
    },
  };
}
