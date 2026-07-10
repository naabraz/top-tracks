import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtistAvatar } from "./ArtistAvatar";

describe("ArtistAvatar", () => {
  it("renders the portrait with the artist name as alt text", () => {
    render(<ArtistAvatar imageUrl="https://img/artist.jpg" name="Radiohead" />);

    expect(screen.getByRole("img", { name: "Radiohead" })).toBeInTheDocument();
  });

  it("shows the placeholder when there is no image", () => {
    render(<ArtistAvatar imageUrl={null} name="Radiohead" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("♪")).toBeInTheDocument();
  });
});
