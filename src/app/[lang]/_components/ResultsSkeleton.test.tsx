import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ResultsSkeleton } from "./ResultsSkeleton";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("ResultsSkeleton", () => {
  it("exposes a busy region announced as loading", () => {
    renderWithLocale(<ResultsSkeleton />);

    const region = screen.getByLabelText("Loading results");
    expect(region).toHaveAttribute("aria-busy", "true");
  });

  it("announces loading to assistive technology", () => {
    renderWithLocale(<ResultsSkeleton />);

    expect(screen.getByText(/loading results/i)).toBeInTheDocument();
  });

  it("labels and announces loading in Portuguese for pt-BR", () => {
    renderWithLocale(<ResultsSkeleton />, "pt-BR");

    expect(screen.getByLabelText("Carregando resultados")).toBeInTheDocument();
    expect(screen.getByText(/carregando resultados/i)).toBeInTheDocument();
  });
});
