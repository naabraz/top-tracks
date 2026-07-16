import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

/**
 * The page reads the URL only through `HomeSearch`, whose search flow is
 * covered in `HomeSearch.test.tsx`. A query-less stub is all the shell needs.
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home", () => {
  it("renders the brand, search box, and footer sources", () => {
    render(<Home />);

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Last.fm" })).toBeInTheDocument();
  });

  it("renders the shell around the search boundary", () => {
    render(<Home />);

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
  });
});
