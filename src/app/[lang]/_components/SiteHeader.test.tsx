import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Locale } from "@/lib/i18n/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SiteHeader } from "./SiteHeader";

const DICTIONARIES = { en, "pt-BR": ptBR };

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/en",
}));

function renderSiteHeader(locale: Locale) {
  const dictionary = DICTIONARIES[locale];
  return render(
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <SiteHeader locale={locale} header={dictionary.header} />
    </LocaleProvider>,
  );
}

describe("SiteHeader", () => {
  it("renders the brand name and tagline", () => {
    renderSiteHeader("en");

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByText("band discovery")).toBeInTheDocument();
  });

  it("links the brand to the active locale's home", () => {
    renderSiteHeader("pt-BR");

    expect(screen.getByRole("link", { name: ptBR.header.homeLinkLabel })).toHaveAttribute(
      "href",
      "/pt-BR",
    );
  });

  it("keeps the tagline in English under pt-BR, as part of the wordmark", () => {
    renderSiteHeader("pt-BR");

    expect(screen.getByText("band discovery")).toBeInTheDocument();
  });

  it("hosts the language switcher", () => {
    renderSiteHeader("en");

    expect(screen.getByRole("group", { name: en.header.languageSwitcherLabel })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
  });
});
