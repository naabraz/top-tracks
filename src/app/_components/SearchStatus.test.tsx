import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ArtistLookupResult } from "@/lib/music/types";
import { SearchStatus } from "./SearchStatus";

const result: ArtistLookupResult = {
  artist: { name: "Radiohead", listeners: 100, tags: [], imageUrl: null, url: "https://last.fm/r" },
  topTrack: null,
  topAlbum: null,
  similarArtists: [],
};

describe("SearchStatus", () => {
  it("prompts the visitor to search while idle", () => {
    render(
      <SearchStatus status="idle" errorMessage={null} result={null} onSelectArtist={vi.fn()} />,
    );

    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
  });

  it("shows the loading skeleton while loading", () => {
    render(
      <SearchStatus status="loading" errorMessage={null} result={null} onSelectArtist={vi.fn()} />,
    );

    expect(screen.getByText(/loading results/i)).toBeInTheDocument();
  });

  it("shows an alert with the error message on error", () => {
    render(
      <SearchStatus
        status="error"
        errorMessage="Not found."
        result={null}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Not found.");
  });

  it("renders the results on success", () => {
    render(
      <SearchStatus status="success" errorMessage={null} result={result} onSelectArtist={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
  });
});
