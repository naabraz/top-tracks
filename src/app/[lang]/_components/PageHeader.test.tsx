import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the hero headline and lede", () => {
    render(<PageHeader />);

    expect(screen.getByRole("heading", { name: /type a band/i })).toBeInTheDocument();
    expect(screen.getByText(/most-played album and track/i)).toBeInTheDocument();
  });
});
