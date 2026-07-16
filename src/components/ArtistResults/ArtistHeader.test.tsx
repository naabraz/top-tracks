import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ArtistSummary } from "@/lib/music/types";
import { ArtistHeader } from "./ArtistHeader";

const artist: ArtistSummary = {
  name: "Radiohead",
  listeners: 5_000_000,
  tags: ["rock", "alternative"],
  imageUrl: null,
  url: "https://last.fm/radiohead",
};

describe("ArtistHeader", () => {
  it("renders the name, grouped listener count, and tags", () => {
    render(<ArtistHeader artist={artist} />);

    expect(screen.getByRole("heading", { name: "Radiohead" })).toBeInTheDocument();
    expect(screen.getByText("5,000,000")).toBeInTheDocument();
    expect(screen.getByText("rock")).toBeInTheDocument();
  });

  it("hides the listeners line when there are none", () => {
    render(<ArtistHeader artist={{ ...artist, listeners: 0 }} />);

    expect(screen.queryByText(/listeners on last\.fm/i)).not.toBeInTheDocument();
  });
});
