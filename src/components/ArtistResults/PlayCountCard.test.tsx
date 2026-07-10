import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { TrackSummary } from "@/lib/music/types";
import { PlayCountCard } from "./PlayCountCard";

const track: TrackSummary = {
  name: "Creep",
  artistName: "Radiohead",
  playcount: 1_200_000,
  imageUrl: null,
  url: "https://last.fm/creep",
};

describe("PlayCountCard", () => {
  it("renders the item with a formatted play-count meta line", () => {
    render(<PlayCountCard item={track} />);

    expect(screen.getByText("Creep")).toBeInTheDocument();
    expect(screen.getByText("1.2M plays")).toBeInTheDocument();
  });
});
