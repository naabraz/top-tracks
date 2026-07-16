import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Artwork } from "./Artwork";

describe("Artwork", () => {
  it("renders the cover image when an image url is given", () => {
    render(<Artwork imageUrl="https://i.scdn.co/cover.jpg" hue={74} alt="Blackwater Park" />);

    expect(screen.getByRole("img", { name: "Blackwater Park" })).toBeInTheDocument();
  });

  it("renders no image for the CSS placeholder when there is no cover", () => {
    render(<Artwork imageUrl={null} hue={250} alt="Katatonia" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
