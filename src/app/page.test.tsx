import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

const result = {
  artist: { name: "Radiohead", listeners: 100, tags: [], imageUrl: null, url: "https://last.fm/r" },
  topTrack: null,
  topAlbum: null,
  similarArtists: [],
};

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
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => result }));
    render(<Home />);

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(await screen.findByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
  });
});
