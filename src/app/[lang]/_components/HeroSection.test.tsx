import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroSection } from "./HeroSection";

/** Wraps HeroSection with local state so the search input is controlled. */
function Harness({ onSearch = vi.fn() }: { onSearch?: (query: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <HeroSection value={value} onChange={setValue} onSearch={onSearch} isLoading={false} />
  );
}

describe("HeroSection", () => {
  it("renders the headline together with the search box", () => {
    render(<Harness />);

    expect(screen.getByRole("heading", { name: /type a band/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("runs a search when the user submits the pill", async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("searchbox"), "Opeth");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(onSearch).toHaveBeenCalledWith("Opeth");
  });
});
