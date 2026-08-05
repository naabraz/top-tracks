"use client";

import { useContext } from "react";
import { LocaleContext } from "./LocaleProvider";

/**
 * Reads the active locale and dictionary provided by the `[lang]` layout.
 * Throws outside a `LocaleProvider` so a missing provider fails loudly at
 * render time instead of silently rendering empty strings.
 */
export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useTranslation must be used inside a LocaleProvider.");
  }
  return context;
}
