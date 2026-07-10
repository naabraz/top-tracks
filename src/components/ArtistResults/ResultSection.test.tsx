import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultSection } from "./ResultSection";

describe("ResultSection", () => {
  it("renders its children under the heading when present", () => {
    render(
      <ResultSection heading="Most played track" emptyText="No tracks available.">
        <p>Creep</p>
      </ResultSection>,
    );

    expect(screen.getByRole("heading", { name: "Most played track" })).toBeInTheDocument();
    expect(screen.getByText("Creep")).toBeInTheDocument();
    expect(screen.queryByText("No tracks available.")).not.toBeInTheDocument();
  });

  it("renders the empty message when there are no children", () => {
    render(
      <ResultSection heading="Most played track" emptyText="No tracks available.">
        {false}
      </ResultSection>,
    );

    expect(screen.getByText("No tracks available.")).toBeInTheDocument();
  });
});
