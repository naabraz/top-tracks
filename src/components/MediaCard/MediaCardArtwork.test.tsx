import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCardArtwork } from "./MediaCardArtwork";

describe("MediaCardArtwork", () => {
  it("renders the image with its alt text when an image URL is given", () => {
    render(<MediaCardArtwork imageUrl="https://img/cover.jpg" alt="Creep" rounded={false} />);

    expect(screen.getByRole("img", { name: "Creep" })).toBeInTheDocument();
  });

  it("renders the placeholder instead of an image when no URL is given", () => {
    render(<MediaCardArtwork imageUrl={null} alt="Creep" rounded={false} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("♪")).toBeInTheDocument();
  });
});
