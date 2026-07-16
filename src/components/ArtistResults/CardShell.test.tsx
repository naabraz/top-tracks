import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardShell } from "./CardShell";

describe("CardShell", () => {
  it("shows the label and the missing-data note", () => {
    render(<CardShell label="Top album" note="No album available." />);

    expect(screen.getByText("Top album")).toBeInTheDocument();
    expect(screen.getByText("No album available.")).toBeInTheDocument();
  });
});
