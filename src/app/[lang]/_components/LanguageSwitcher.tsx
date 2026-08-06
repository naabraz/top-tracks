"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME, LOCALES } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** The visible option labels — deliberately short, and never translated. */
const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT",
};

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}`;
}

/**
 * Swaps the leading locale segment of the path. The query string is read from
 * the window at click time so an in-flight search (`?q=…`) survives the switch.
 */
function buildSwitchUrl(pathname: string, nextLocale: Locale): string {
  const localizedPath = pathname.replace(/^\/[^/]+/, `/${nextLocale}`);
  return `${localizedPath}${window.location.search}`;
}

/** PT/EN toggle: persists the choice for the proxy and re-renders in place. */
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale: activeLocale, dictionary } = useTranslation();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === activeLocale) {
      return;
    }
    persistLocale(nextLocale);
    // `replace`, not `push`: language is a rendering choice, and backing out
    // of it into the same page in the other language would read as a no-op.
    router.replace(buildSwitchUrl(pathname, nextLocale), { scroll: false });
  }

  return (
    <div className="lang-switch" role="group" aria-label={dictionary.header.languageSwitcherLabel}>
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={locale === activeLocale}
          onClick={() => switchLocale(locale)}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
