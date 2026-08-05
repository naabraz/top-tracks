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
    render(
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
    render(
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
    const { container } = render(
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

  it("leaves the results outside the live region, so focus alone announces them", () => {
    const { container } = render(
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
    render(
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

  it("shows an alert with the upstream-error message on error", () => {
    render(
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

  it("shows an alert with the network-error message when the server is unreachable", () => {
    render(
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
    render(
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
