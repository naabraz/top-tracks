import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtists } from "./SimilarArtists";

const artists: SimilarArtist[] = [{ name: "Muse", imageUrl: null, url: "https://last.fm/muse" }];

describe("SimilarArtists", () => {
  it("renders the section heading and the count hint", () => {
    render(<SimilarArtists artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /like these too/i })).toBeInTheDocument();
    expect(screen.getByText("1 similar artists")).toBeInTheDocument();
  });

  it("heads the section at h3, a sibling of the cards rather than part of one", () => {
    render(<SimilarArtists artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /like these too/i, level: 3 })).toBeInTheDocument();
  });

  it("shows an empty note when there are no similar artists", () => {
    render(<SimilarArtists artists={[]} onSelect={vi.fn()} />);

    expect(screen.getByText(/no similar artists found/i)).toBeInTheDocument();
  });
});
