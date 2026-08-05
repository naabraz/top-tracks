import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SearchBar } from "./SearchBar";

const DICTIONARIES = { en, "pt-BR": ptBR };

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

function renderHarness(props: HarnessProps = {}, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      <Harness
        onSearch={props.onSearch}
        isLoading={props.isLoading}
        initialValue={props.initialValue}
      />
    </LocaleProvider>,
  );
}

describe("SearchBar", () => {
  it("submits the trimmed query", async () => {
    const onSearch = vi.fn();
    renderHarness({ onSearch });

    await userEvent.type(screen.getByRole("searchbox"), "  Radiohead  ");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(onSearch).toHaveBeenCalledWith("Radiohead");
  });

  it("disables the button when the query is empty", () => {
    renderHarness();

    expect(screen.getByRole("button", { name: /discover/i })).toBeDisabled();
  });

  it("shows a loading label and stays disabled while searching", () => {
    renderHarness({ isLoading: true, initialValue: "Radiohead" });

    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });

  it("reflects the value passed from the parent", () => {
    renderHarness({ initialValue: "Muse" });

    expect(screen.getByRole("searchbox")).toHaveValue("Muse");
  });

  it("labels the submit button in Portuguese for pt-BR", () => {
    renderHarness({ initialValue: "Muse" }, "pt-BR");

    expect(screen.getByRole("button", { name: "Descobrir" })).toBeInTheDocument();
  });
});
