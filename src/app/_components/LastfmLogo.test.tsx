import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LastfmLogo } from "./LastfmLogo";

describe("LastfmLogo", () => {
  it("renders a decorative svg glyph", () => {
    const { container } = render(<LastfmLogo />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
