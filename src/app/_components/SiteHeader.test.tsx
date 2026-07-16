import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the brand name and tagline", () => {
    render(<SiteHeader />);

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByText("band discovery")).toBeInTheDocument();
  });
});
