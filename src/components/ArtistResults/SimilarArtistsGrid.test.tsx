import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

const artists: SimilarArtist[] = [
  { name: "Muse", imageUrl: null, url: "https://last.fm/muse" },
  { name: "Coldplay", imageUrl: null, url: "https://last.fm/coldplay" },
];

describe("SimilarArtistsGrid", () => {
  it("renders one link per similar artist", () => {
    render(<SimilarArtistsGrid artists={artists} />);

    expect(screen.getByRole("link", { name: /muse/i })).toHaveAttribute(
      "href",
      "https://last.fm/muse",
    );
    expect(screen.getByRole("link", { name: /coldplay/i })).toBeInTheDocument();
  });
});
