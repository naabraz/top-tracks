import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { AlbumSummary } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AlbumCard } from "./AlbumCard";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const album: AlbumSummary = {
  name: "Blackwater Park",
  artistName: "Opeth",
  playcount: 4_820_000,
  imageUrl: null,
  releaseYear: 2001,
  url: "https://last.fm/blackwater-park",
};

describe("AlbumCard", () => {
  it("links the album title and shows its compact play total", () => {
    renderWithLocale(<AlbumCard album={album} />);

    expect(screen.getByRole("link", { name: "Blackwater Park" })).toHaveAttribute(
      "href",
      "https://last.fm/blackwater-park",
    );
    expect(screen.getByText("4.8M")).toBeInTheDocument();
  });

  it("renders the Portuguese label and locale-compact playcount for pt-BR", () => {
    renderWithLocale(<AlbumCard album={album} />, "pt-BR");

    expect(screen.getByText("Álbum mais tocado")).toBeInTheDocument();
    expect(screen.getByText("4,8 mi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blackwater Park" })).toBeInTheDocument();
  });

  it("shows the release year of the album", () => {
    renderWithLocale(<AlbumCard album={album} />);

    expect(screen.getByText("2001")).toBeInTheDocument();
  });

  it("omits the release year when it is unknown", () => {
    renderWithLocale(<AlbumCard album={{ ...album, releaseYear: null }} />);

    expect(screen.queryByText(/released/i)).not.toBeInTheDocument();
  });

  it("shows an honest placeholder when there is no album", () => {
    renderWithLocale(<AlbumCard album={null} />);

    expect(screen.getByText(/no album available/i)).toBeInTheDocument();
  });

  it("shows the Portuguese placeholder when there is no album for pt-BR", () => {
    renderWithLocale(<AlbumCard album={null} />, "pt-BR");

    expect(screen.getByText(/nenhum álbum disponível/i)).toBeInTheDocument();
  });
});
