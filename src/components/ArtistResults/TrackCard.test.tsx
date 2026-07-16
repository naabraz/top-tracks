import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { TrackSummary } from "@/lib/music/types";
import { TrackCard } from "./TrackCard";

const track: TrackSummary = {
  name: "Windowpane",
  artistName: "Opeth",
  playcount: 2_870_000,
  imageUrl: null,
  url: "https://last.fm/windowpane",
};

describe("TrackCard", () => {
  it("links the track title and shows its compact play total", () => {
    render(<TrackCard track={track} />);

    expect(screen.getByRole("link", { name: "Windowpane" })).toHaveAttribute(
      "href",
      "https://last.fm/windowpane",
    );
    expect(screen.getByText("2.9M")).toBeInTheDocument();
  });

  it("shows the track's own cover, which the API already returns", () => {
    render(<TrackCard track={{ ...track, imageUrl: "https://i.scdn.co/creep.jpg" }} />);

    expect(screen.getByRole("img", { name: "Windowpane" })).toBeInTheDocument();
  });

  it("carries a larger cover than the album card, because it is the answer", () => {
    const { container } = render(
      <TrackCard track={{ ...track, imageUrl: "https://i.scdn.co/creep.jpg" }} />,
    );

    expect(container.querySelector(".artwork")).toHaveStyle({ "--artwork-size": "190px" });
  });

  it("shows an honest placeholder when there is no track", () => {
    render(<TrackCard track={null} />);

    expect(screen.getByText(/no track available/i)).toBeInTheDocument();
  });
});
