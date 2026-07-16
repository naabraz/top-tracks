import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

interface HarnessProps {
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

/** Wraps SearchBar with local state so the controlled input behaves as in the app. */
function Harness({ onSearch = vi.fn(), isLoading = false, initialValue = "" }: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchBar value={value} onChange={setValue} onSearch={onSearch} isLoading={isLoading} />
  );
}

describe("SearchBar", () => {
  it("submits the trimmed query", async () => {
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("searchbox"), "  Radiohead  ");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(onSearch).toHaveBeenCalledWith("Radiohead");
  });

  it("disables the button when the query is empty", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: /discover/i })).toBeDisabled();
  });

  it("shows a loading label and stays disabled while searching", () => {
    render(<Harness isLoading initialValue="Radiohead" />);

    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });

  it("reflects the value passed from the parent", () => {
    render(<Harness initialValue="Muse" />);

    expect(screen.getByRole("searchbox")).toHaveValue("Muse");
  });
});
