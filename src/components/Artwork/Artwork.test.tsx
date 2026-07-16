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

  it("sizes the box and the image hint from one number", () => {
    const { container } = render(
      <Artwork imageUrl="https://i.scdn.co/cover.jpg" hue={74} alt="Creep" size={190} />,
    );

    expect(container.querySelector(".artwork")).toHaveStyle({ "--artwork-size": "190px" });
    // Phones grow every cover to 170, so the hint has to say so or they under-fetch.
    expect(screen.getByRole("img", { name: "Creep" })).toHaveAttribute(
      "sizes",
      "(max-width: 560px) 170px, 190px",
    );
  });

  it("falls back to the album-card size", () => {
    const { container } = render(<Artwork imageUrl={null} hue={74} alt="OK Computer" />);

    expect(container.querySelector(".artwork")).toHaveStyle({ "--artwork-size": "150px" });
  });
});
