"use client";

import { createContext, type ReactNode } from "react";
import type { Dictionary, Locale } from "./types";

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

/**
 * Hands the active locale and its dictionary to client components via
 * `useTranslation()`. The `[lang]` layout renders one provider per request,
 * so the dictionary crosses the server/client boundary exactly once.
 */
export function LocaleProvider({ locale, dictionary, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>
  );
}
