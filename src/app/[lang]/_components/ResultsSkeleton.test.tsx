import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsSkeleton } from "./ResultsSkeleton";

describe("ResultsSkeleton", () => {
  it("exposes a busy region announced as loading", () => {
    render(<ResultsSkeleton />);

    const region = screen.getByLabelText("Loading results");
    expect(region).toHaveAttribute("aria-busy", "true");
  });

  it("announces loading to assistive technology", () => {
    render(<ResultsSkeleton />);

    expect(screen.getByText(/loading results/i)).toBeInTheDocument();
  });
});
