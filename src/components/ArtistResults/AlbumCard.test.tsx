import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AlbumSummary } from "@/lib/music/types";
import { AlbumCard } from "./AlbumCard";

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
    render(<AlbumCard album={album} />);

    expect(screen.getByRole("link", { name: "Blackwater Park" })).toHaveAttribute(
      "href",
      "https://last.fm/blackwater-park",
    );
    expect(screen.getByText("4.8M")).toBeInTheDocument();
  });

  it("shows the release year of the album", () => {
    render(<AlbumCard album={album} />);

    expect(screen.getByText("2001")).toBeInTheDocument();
  });

  it("omits the release year when it is unknown", () => {
    render(<AlbumCard album={{ ...album, releaseYear: null }} />);

    expect(screen.queryByText(/released/i)).not.toBeInTheDocument();
  });

  it("shows an honest placeholder when there is no album", () => {
    render(<AlbumCard album={null} />);

    expect(screen.getByText(/no album available/i)).toBeInTheDocument();
  });
});
