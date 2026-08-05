import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("prompts the visitor to search with example bands", () => {
    render(<EmptyState />);

    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
    expect(screen.getByText(/opeth, tool or pink floyd/i)).toBeInTheDocument();
  });
});
