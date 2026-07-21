import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistResults } from "./ArtistResults";

const baseResult: ArtistLookupResult = {
  artist: {
    name: "Radiohead",
    listeners: 5_000_000,
    tags: ["rock"],
    imageUrl: null,
    url: "https://last.fm/radiohead",
  },
  topTrack: {
    name: "Creep",
    artistName: "Radiohead",
    playcount: 1_200_000,
    imageUrl: null,
    albumName: null,
    albumReleaseYear: null,
    url: "https://last.fm/creep",
  },
  topAlbum: {
    name: "OK Computer",
    artistName: "Radiohead",
    playcount: 900_000,
    imageUrl: null,
    releaseYear: 1997,
    url: "https://last.fm/okc",
  },
  similarArtists: [{ name: "Muse", imageUrl: null, url: "https://last.fm/muse" }],
};

describe("ArtistResults", () => {
  it("renders the artist, its top track, top album, and similar artists", () => {
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Creep" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "OK Computer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /muse/i })).toBeInTheDocument();
  });

  it("puts the top track ahead of the album, because the track is the answer", () => {
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} />);

    const labels = screen.getAllByText(/^Top (track|album)$/).map((node) => node.textContent);
    expect(labels).toEqual(["Top track", "Top album"]);
  });

  it("calls onSelectArtist with the name when a similar artist is clicked", async () => {
    const onSelectArtist = vi.fn();
    render(<ArtistResults result={baseResult} onSelectArtist={onSelectArtist} />);

    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    expect(onSelectArtist).toHaveBeenCalledWith("Muse");
  });

  it("shows honest placeholders when a section is empty", () => {
    render(
      <ArtistResults
        result={{ ...baseResult, topTrack: null, topAlbum: null, similarArtists: [] }}
        onSelectArtist={vi.fn()}
      />,
    );

    expect(screen.getByText(/no track available/i)).toBeInTheDocument();
    expect(screen.getByText(/no album available/i)).toBeInTheDocument();
    expect(screen.getByText(/no similar artists found/i)).toBeInTheDocument();
  });

  it("is focusable so a new answer can be landed on, without joining the tab order", () => {
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} />);

    expect(screen.getByLabelText("Results for Radiohead")).toHaveAttribute("tabindex", "-1");
  });

  it("exposes the section through sectionRef as the scroll and focus target", () => {
    const sectionRef = createRef<HTMLElement>();
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} sectionRef={sectionRef} />);

    expect(sectionRef.current).toBe(screen.getByLabelText("Results for Radiohead"));
  });

  it("marks itself stale and busy while the next artist loads", () => {
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} isStale />);

    const section = screen.getByLabelText("Results for Radiohead");
    expect(section).toHaveAttribute("data-stale", "true");
    expect(section).toHaveAttribute("aria-busy", "true");
  });

  it("carries no stale or busy marker at rest", () => {
    render(<ArtistResults result={baseResult} onSelectArtist={vi.fn()} />);

    const section = screen.getByLabelText("Results for Radiohead");
    expect(section).not.toHaveAttribute("data-stale");
    expect(section).not.toHaveAttribute("aria-busy");
  });
});
