import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

const artists: SimilarArtist[] = [
  { name: "Muse", imageUrl: null, url: "https://last.fm/muse" },
  { name: "Coldplay", imageUrl: null, url: "https://last.fm/coldplay" },
];

describe("SimilarArtistsGrid", () => {
  it("renders one selectable button per similar artist", () => {
    render(<SimilarArtistsGrid artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /muse/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /coldplay/i })).toBeInTheDocument();
  });

  it("calls onSelect with the artist name when a card is clicked", async () => {
    const onSelect = vi.fn();
    render(<SimilarArtistsGrid artists={artists} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /coldplay/i }));

    expect(onSelect).toHaveBeenCalledWith("Coldplay");
  });
});
