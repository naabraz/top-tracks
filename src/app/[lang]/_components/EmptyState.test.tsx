import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { EmptyState } from "./EmptyState";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("EmptyState", () => {
  it("prompts the visitor to search with example bands", () => {
    renderWithLocale(<EmptyState />);

    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
    expect(screen.getByText(/opeth, tool or pink floyd/i)).toBeInTheDocument();
  });

  it("prompts in Portuguese for pt-BR", () => {
    renderWithLocale(<EmptyState />, "pt-BR");

    expect(screen.getByText(/busque uma banda para começar/i)).toBeInTheDocument();
    expect(screen.getByText(/tente opeth, tool ou pink floyd/i)).toBeInTheDocument();
  });
});
