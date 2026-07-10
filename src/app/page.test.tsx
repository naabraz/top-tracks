import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ArtistLookupResult } from "@/lib/music/types";
import Home from "./page";

function makeResult(name: string): ArtistLookupResult {
  return {
    artist: { name, listeners: 100, tags: [], imageUrl: null, url: `https://last.fm/${name}` },
    topTrack: null,
    topAlbum: null,
    similarArtists: [{ name: "Muse", imageUrl: null, url: "https://last.fm/muse" }],
  };
}

/** Resolves an artist result whose name matches the `q` query parameter. */
function stubArtistApi() {
  const fetchMock = vi.fn(async (url: string) => {
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return { ok: true, json: async () => makeResult(query) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home", () => {
  it("renders the header, search box, and footer", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /toptracks/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Last.fm" })).toBeInTheDocument();
  });

  it("shows results after a successful search", async () => {
    stubArtistApi();
    render(<Home />);

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByRole("heading", { name: "radiohead" })).toBeInTheDocument();
  });

  it("fills the search box and re-runs the search when a similar artist is clicked", async () => {
    const fetchMock = stubArtistApi();
    render(<Home />);

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /^search$/i }));
    await screen.findByRole("heading", { name: "radiohead" });

    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    expect(await screen.findByRole("heading", { name: "Muse" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Muse");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/artist?q=Muse");
  });
});
