import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtistTags } from "./ArtistTags";

describe("ArtistTags", () => {
  it("renders one pill per tag", () => {
    render(<ArtistTags tags={["progressive metal", "death metal"]} />);

    expect(screen.getByText("progressive metal")).toBeInTheDocument();
    expect(screen.getByText("death metal")).toBeInTheDocument();
  });

  it("renders nothing when there are no tags", () => {
    const { container } = render(<ArtistTags tags={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
