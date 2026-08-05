import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { PageHeader } from "./PageHeader";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("PageHeader", () => {
  it("renders the hero headline and lede", () => {
    renderWithLocale(<PageHeader />);

    expect(screen.getByRole("heading", { name: /type a band/i })).toBeInTheDocument();
    expect(screen.getByText(/most-played album and track/i)).toBeInTheDocument();
  });

  it("renders the Portuguese headline and lede for pt-BR", () => {
    renderWithLocale(<PageHeader />, "pt-BR");

    expect(screen.getByRole("heading", { name: /digite uma banda/i })).toBeInTheDocument();
    expect(screen.getByText(/o álbum e a faixa mais tocados/i)).toBeInTheDocument();
  });
});
