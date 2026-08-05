import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { SimilarArtist } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SimilarArtists } from "./SimilarArtists";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const artists: SimilarArtist[] = [{ name: "Muse", imageUrl: null, url: "https://last.fm/muse" }];

describe("SimilarArtists", () => {
  it("renders the section heading and the count hint", () => {
    renderWithLocale(<SimilarArtists artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /like these too/i })).toBeInTheDocument();
    expect(screen.getByText("1 similar artists")).toBeInTheDocument();
  });

  it("renders the Portuguese heading and count hint for pt-BR", () => {
    renderWithLocale(<SimilarArtists artists={artists} onSelect={vi.fn()} />, "pt-BR");

    expect(
      screen.getByRole("heading", { name: /vai gostar destes também/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 artistas parecidos")).toBeInTheDocument();
  });

  it("heads the section at h3, a sibling of the cards rather than part of one", () => {
    renderWithLocale(<SimilarArtists artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /like these too/i, level: 3 })).toBeInTheDocument();
  });

  it("shows an empty note when there are no similar artists", () => {
    renderWithLocale(<SimilarArtists artists={[]} onSelect={vi.fn()} />);

    expect(screen.getByText(/no similar artists found/i)).toBeInTheDocument();
  });

  it("shows the Portuguese empty note for pt-BR", () => {
    renderWithLocale(<SimilarArtists artists={[]} onSelect={vi.fn()} />, "pt-BR");

    expect(screen.getByText(/nenhum artista parecido encontrado/i)).toBeInTheDocument();
  });
});
