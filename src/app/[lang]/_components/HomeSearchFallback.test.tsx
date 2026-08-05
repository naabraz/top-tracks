import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { HomeSearchFallback } from "./HomeSearchFallback";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("HomeSearchFallback", () => {
  it("renders the hero and the empty state, matching a query-less visit", () => {
    renderWithLocale(<HomeSearchFallback />);

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("disables the submit button, since the live search has not taken over yet", () => {
    renderWithLocale(<HomeSearchFallback />);

    expect(screen.getByRole("button", { name: /discover/i })).toBeDisabled();
  });

  it("renders the Portuguese hero and prompt for pt-BR", () => {
    renderWithLocale(<HomeSearchFallback />, "pt-BR");

    expect(screen.getByRole("button", { name: /descobrir/i })).toBeInTheDocument();
    expect(screen.getByText(/busque uma banda para começar/i)).toBeInTheDocument();
  });
});
