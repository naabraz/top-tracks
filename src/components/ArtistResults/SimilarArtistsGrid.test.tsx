import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import type { SimilarArtist } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

function renderWithProvider(ui: ReactElement) {
  return render(
    <LocaleProvider locale="en" dictionary={en}>
      {ui}
    </LocaleProvider>,
  );
}

const artists: SimilarArtist[] = [
  { name: "Muse", imageUrl: null, url: "https://last.fm/muse" },
  { name: "Coldplay", imageUrl: null, url: "https://last.fm/coldplay" },
];

describe("SimilarArtistsGrid", () => {
  it("renders one selectable button per similar artist", () => {
    renderWithProvider(<SimilarArtistsGrid artists={artists} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /muse/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /coldplay/i })).toBeInTheDocument();
  });

  it("calls onSelect with the artist name when a card is clicked", async () => {
    const onSelect = vi.fn();
    renderWithProvider(<SimilarArtistsGrid artists={artists} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /coldplay/i }));

    expect(onSelect).toHaveBeenCalledWith("Coldplay");
  });
});
