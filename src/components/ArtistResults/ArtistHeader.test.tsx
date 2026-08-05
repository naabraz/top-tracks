import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { ArtistSummary } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ArtistHeader } from "./ArtistHeader";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const artist: ArtistSummary = {
  name: "Radiohead",
  listeners: 5_000_000,
  tags: ["rock", "alternative"],
  imageUrl: null,
  url: "https://last.fm/radiohead",
};

describe("ArtistHeader", () => {
  it("renders the name, grouped listener count, and tags", () => {
    renderWithLocale(<ArtistHeader artist={artist} />);

    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
    expect(screen.getByText("5,000,000")).toBeInTheDocument();
    expect(screen.getByText("rock")).toBeInTheDocument();
  });

  it("renders the Portuguese kicker and locale-grouped digits for pt-BR", () => {
    renderWithLocale(<ArtistHeader artist={artist} />, "pt-BR");

    expect(screen.getByText("Banda")).toBeInTheDocument();
    expect(screen.getByText("5.000.000")).toBeInTheDocument();
    expect(screen.getByText(/ouvintes no last\.fm/i)).toBeInTheDocument();
  });

  it("keeps the API-sourced name and tags unchanged under pt-BR", () => {
    renderWithLocale(<ArtistHeader artist={artist} />, "pt-BR");

    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
    expect(screen.getByText("rock")).toBeInTheDocument();
  });

  it("hides the listeners line when there are none", () => {
    renderWithLocale(<ArtistHeader artist={{ ...artist, listeners: 0 }} />);

    expect(screen.queryByText(/listeners on last\.fm/i)).not.toBeInTheDocument();
  });
});
