import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("submits the trimmed query", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);

    await userEvent.type(screen.getByRole("searchbox"), "  Radiohead  ");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("Radiohead");
  });

  it("does not submit an empty query", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables input actions and shows a loading label while searching", () => {
    render(<SearchBar onSearch={vi.fn()} isLoading />);

    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });
});
