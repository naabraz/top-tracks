import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SpotifyLogo } from "./SpotifyLogo";

describe("SpotifyLogo", () => {
  it("renders a decorative svg glyph", () => {
    const { container } = render(<SpotifyLogo />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
