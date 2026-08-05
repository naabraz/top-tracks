import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SearchStatus } from "./SearchStatus";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

const result: ArtistLookupResult = {
  artist: { name: "Radiohead", listeners: 100, tags: [], imageUrl: null, url: "https://last.fm/r" },
  topTrack: null,
  topAlbum: null,
  similarArtists: [],
};

describe("SearchStatus", () => {
  it("prompts the visitor to search while idle", () => {
    renderWithLocale(
      <SearchStatus
        status="idle"
        errorCode={null}
        query=""
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
  });

  it("shows the loading skeleton when there is no earlier answer to keep", () => {
    renderWithLocale(
      <SearchStatus
        status="loading"
        errorCode={null}
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Loading results")).toBeInTheDocument();
  });

  it("keeps the earlier answer instead of the skeleton while the next one loads", () => {
    renderWithLocale(
      <SearchStatus
        status="loading"
        errorCode={null}
        query="muse"
        result={result}
        onSelectArtist={vi.fn()}
      />,
    );

    const outgoing = screen.getByLabelText("Results for Radiohead");
    expect(outgoing).toHaveAttribute("data-stale", "true");
    expect(outgoing).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByLabelText("Loading results")).not.toBeInTheDocument();
  });

  it("announces the search politely while it runs", () => {
    const { container } = renderWithLocale(
      <SearchStatus
        status="loading"
        errorCode={null}
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent("Searching…");
  });

  it("announces the search in Portuguese for pt-BR", () => {
    const { container } = renderWithLocale(
      <SearchStatus
        status="loading"
        errorCode={null}
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
      "pt-BR",
    );

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent("Buscando…");
  });

  it("leaves the results outside the live region, so focus alone announces them", () => {
    const { container } = renderWithLocale(
      <SearchStatus
        status="success"
        errorCode={null}
        query="radiohead"
        result={result}
        onSelectArtist={vi.fn()}
      />,
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeEmptyDOMElement();
    expect(liveRegion).not.toContainElement(screen.getByLabelText("Results for Radiohead"));
  });

  it("interpolates the query into the not-found alert", () => {
    renderWithLocale(
      <SearchStatus
        status="error"
        errorCode="not-found"
        query="nobody"
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent('No artist found matching "nobody".');
  });

  it("interpolates the query into the Portuguese not-found alert for pt-BR", () => {
    renderWithLocale(
      <SearchStatus
        status="error"
        errorCode="not-found"
        query="nobody"
        result={null}
        onSelectArtist={vi.fn()}
      />,
      "pt-BR",
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      'Nenhum artista encontrado para "nobody".',
    );
  });

  it("shows an alert with the upstream-error message on error", () => {
    renderWithLocale(
      <SearchStatus
        status="error"
        errorCode="upstream-error"
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The Last.fm API returned an error. Please try again later.",
    );
  });

  it("shows the Portuguese upstream-error message for pt-BR", () => {
    renderWithLocale(
      <SearchStatus
        status="error"
        errorCode="upstream-error"
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
      "pt-BR",
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A API do Last.fm retornou um erro. Tente novamente mais tarde.",
    );
  });

  it("shows an alert with the network-error message when the server is unreachable", () => {
    renderWithLocale(
      <SearchStatus
        status="error"
        errorCode="network-error"
        query="radiohead"
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not reach the server. Please check your connection.",
    );
  });

  it("renders the results on success", () => {
    renderWithLocale(
      <SearchStatus
        status="success"
        errorCode={null}
        query="radiohead"
        result={result}
        onSelectArtist={vi.fn()}
      />,
    );

    const section = screen.getByLabelText("Results for Radiohead");
    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
    expect(section).not.toHaveAttribute("data-stale");
  });
});
