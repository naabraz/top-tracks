import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackAlbumMeta } from "./TrackAlbumMeta";

describe("TrackAlbumMeta", () => {
  it("names the album and its release year as a machine-readable date", () => {
    render(<TrackAlbumMeta albumName="Blackwater Park" releaseYear={2001} />);

    expect(screen.getByText(/from blackwater park/i)).toBeInTheDocument();
    const time = screen.getByText("2001");
    expect(time).toHaveAttribute("dateTime", "2001");
  });

  it("names the album alone when the release year is unknown", () => {
    render(<TrackAlbumMeta albumName="Blackwater Park" releaseYear={null} />);

    expect(screen.getByText(/from blackwater park/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });

  it("renders nothing when the album is unknown", () => {
    const { container } = render(<TrackAlbumMeta albumName={null} releaseYear={2001} />);

    expect(container).toBeEmptyDOMElement();
  });
});
