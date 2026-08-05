import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { TrackSummary } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { TrackCard } from "./TrackCard";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const track: TrackSummary = {
  name: "Windowpane",
  artistName: "Opeth",
  playcount: 2_870_000,
  imageUrl: null,
  albumName: null,
  albumReleaseYear: null,
  url: "https://last.fm/windowpane",
};

describe("TrackCard", () => {
  it("links the track title and shows its compact play total", () => {
    renderWithLocale(<TrackCard track={track} />);

    expect(screen.getByRole("link", { name: "Windowpane" })).toHaveAttribute(
      "href",
      "https://last.fm/windowpane",
    );
    expect(screen.getByText("2.9M")).toBeInTheDocument();
  });

  it("renders the Portuguese label and locale-compact playcount for pt-BR", () => {
    renderWithLocale(<TrackCard track={track} />, "pt-BR");

    expect(screen.getByText("Faixa mais tocada")).toBeInTheDocument();
    expect(screen.getByText("2,9 mi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Windowpane" })).toBeInTheDocument();
  });

  it("shows the track's own cover, which the API already returns", () => {
    renderWithLocale(<TrackCard track={{ ...track, imageUrl: "https://i.scdn.co/creep.jpg" }} />);

    expect(screen.getByRole("img", { name: "Windowpane" })).toBeInTheDocument();
  });

  it("carries a larger cover than the album card, because it is the answer", () => {
    const { container } = renderWithLocale(
      <TrackCard track={{ ...track, imageUrl: "https://i.scdn.co/creep.jpg" }} />,
    );

    expect(container.querySelector(".artwork")).toHaveStyle({ "--artwork-size": "190px" });
  });

  it("shows the album the track comes from and its release year", () => {
    renderWithLocale(
      <TrackCard track={{ ...track, albumName: "Blackwater Park", albumReleaseYear: 2001 }} />,
    );

    expect(screen.getByText(/from blackwater park/i)).toBeInTheDocument();
    expect(screen.getByText("2001")).toBeInTheDocument();
  });

  it("shows no album line when the album is unknown", () => {
    renderWithLocale(<TrackCard track={track} />);

    expect(screen.queryByText(/^from/i)).not.toBeInTheDocument();
  });

  it("shows an honest placeholder when there is no track", () => {
    renderWithLocale(<TrackCard track={null} />);

    expect(screen.getByText(/no track available/i)).toBeInTheDocument();
  });

  it("shows the Portuguese placeholder when there is no track for pt-BR", () => {
    renderWithLocale(<TrackCard track={null} />, "pt-BR");

    expect(screen.getByText(/nenhuma faixa disponível/i)).toBeInTheDocument();
  });
});
