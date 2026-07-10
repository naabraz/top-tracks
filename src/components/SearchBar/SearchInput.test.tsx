import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("exposes an accessible search box labelled for artists", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox", { name: /artist or band name/i })).toBeInTheDocument();
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "a");

    expect(onChange).toHaveBeenCalled();
  });
});
