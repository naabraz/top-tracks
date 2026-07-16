import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeSearchFallback } from "./HomeSearchFallback";

describe("HomeSearchFallback", () => {
  it("renders the hero and the empty state, matching a query-less visit", () => {
    render(<HomeSearchFallback />);

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("disables the submit button, since the live search has not taken over yet", () => {
    render(<HomeSearchFallback />);

    expect(screen.getByRole("button", { name: /discover/i })).toBeDisabled();
  });
});
