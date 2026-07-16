import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtistCard } from "./SimilarArtistCard";

const artist: SimilarArtist = { name: "Katatonia", imageUrl: null, url: "https://last.fm/katatonia" };

describe("SimilarArtistCard", () => {
  it("renders a button showing the artist name and a monogram fallback", () => {
    render(<SimilarArtistCard artist={artist} onSelect={vi.fn()} />);

    const button = screen.getByRole("button", { name: /katatonia/i });
    expect(button).toHaveTextContent("K");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("calls onSelect with the artist name when clicked", async () => {
    const onSelect = vi.fn();
    render(<SimilarArtistCard artist={artist} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /katatonia/i }));

    expect(onSelect).toHaveBeenCalledWith("Katatonia");
  });
});
