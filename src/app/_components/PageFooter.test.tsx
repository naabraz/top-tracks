import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageFooter } from "./PageFooter";

describe("PageFooter", () => {
  it("credits Last.fm and Spotify with links", () => {
    render(<PageFooter />);

    expect(screen.getByRole("link", { name: "Last.fm" })).toHaveAttribute(
      "href",
      "https://www.last.fm",
    );
    expect(screen.getByRole("link", { name: "Spotify" })).toHaveAttribute(
      "href",
      "https://www.spotify.com",
    );
  });
});
