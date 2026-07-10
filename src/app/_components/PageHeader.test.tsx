import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the app title and tagline", () => {
    render(<PageHeader />);

    expect(screen.getByRole("heading", { name: /toptracks/i })).toBeInTheDocument();
    expect(screen.getByText(/most played track/i)).toBeInTheDocument();
  });
});
