import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { TrackAlbumMeta } from "./TrackAlbumMeta";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("TrackAlbumMeta", () => {
  it("names the album and its release year as a machine-readable date", () => {
    renderWithLocale(<TrackAlbumMeta albumName="Blackwater Park" releaseYear={2001} />);

    expect(screen.getByText(/from blackwater park/i)).toBeInTheDocument();
    const time = screen.getByText("2001");
    expect(time).toHaveAttribute("dateTime", "2001");
  });

  it("names the album in Portuguese for pt-BR", () => {
    renderWithLocale(<TrackAlbumMeta albumName="Blackwater Park" releaseYear={2001} />, "pt-BR");

    expect(screen.getByText(/do álbum blackwater park/i)).toBeInTheDocument();
  });

  it("names the album alone when the release year is unknown", () => {
    renderWithLocale(<TrackAlbumMeta albumName="Blackwater Park" releaseYear={null} />);

    expect(screen.getByText(/from blackwater park/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });

  it("renders nothing when the album is unknown", () => {
    const { container } = renderWithLocale(<TrackAlbumMeta albumName={null} releaseYear={2001} />);

    expect(container).toBeEmptyDOMElement();
  });
});
