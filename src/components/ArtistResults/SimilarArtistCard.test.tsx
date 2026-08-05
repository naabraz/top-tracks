import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import type { SimilarArtist } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SimilarArtistCard } from "./SimilarArtistCard";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const artist: SimilarArtist = { name: "Katatonia", imageUrl: null, url: "https://last.fm/katatonia" };

describe("SimilarArtistCard", () => {
  it("renders a button showing the artist name and a monogram fallback", () => {
    renderWithLocale(<SimilarArtistCard artist={artist} onSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: /katatonia/i });
    expect(button).toHaveTextContent("K");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("names the button for what it does, not for what it looks like", () => {
    renderWithLocale(<SimilarArtistCard artist={artist} onSelect={vi.fn()} />);

    // Without this the name reads "K Katatonia similar artist".
    expect(screen.getByRole("button", { name: "Search Katatonia" })).toBeInTheDocument();
  });

  it("names the button and captions the tile in Portuguese for pt-BR", () => {
    renderWithLocale(<SimilarArtistCard artist={artist} onSelect={vi.fn()} />, "pt-BR");

    expect(screen.getByRole("button", { name: "Buscar Katatonia" })).toBeInTheDocument();
    expect(screen.getByText("artista parecido")).toBeInTheDocument();
  });

  it("calls onSelect with the artist name when clicked", async () => {
    const onSelect = vi.fn();
    renderWithLocale(<SimilarArtistCard artist={artist} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /katatonia/i }));

    expect(onSelect).toHaveBeenCalledWith("Katatonia");
  });
});
