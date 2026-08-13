import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Locale } from "@/lib/i18n/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { RecentSearches } from "./RecentSearches";

const DICTIONARIES = { en, "pt-BR": ptBR };

interface RenderOptions {
  entries?: string[];
  locale?: Locale;
  onSelect?: (artistName: string) => void;
  onRemove?: (artistName: string) => void;
}

function renderRecentSearches(options: RenderOptions = {}) {
  const {
    entries = ["Opeth", "Katatonia"],
    locale = "en",
    onSelect = vi.fn(),
    onRemove = vi.fn(),
  } = options;

  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      <RecentSearches
        entries={entries}
        pathname={`/${locale}`}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </LocaleProvider>,
  );
}

describe("RecentSearches", () => {
  it("renders one link per entry, in the order received", () => {
    renderRecentSearches({ entries: ["Katatonia", "Opeth", "Enslaved"] });

    const entryNames = screen.getAllByRole("link").map((link) => link.textContent);
    expect(entryNames).toEqual(["Katatonia", "Opeth", "Enslaved"]);
  });

  it("names the section region with the localized heading", () => {
    renderRecentSearches();

    expect(screen.getByRole("region", { name: "Recent searches" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent searches", level: 2 })).toBeInTheDocument();
  });

  it("renders the Portuguese heading under the pt-BR dictionary", () => {
    renderRecentSearches({ locale: "pt-BR" });

    expect(screen.getByRole("region", { name: "Buscas recentes" })).toBeInTheDocument();
  });

  it("renders nothing at all when there are no entries", () => {
    const { container } = renderRecentSearches({ entries: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it("links each entry to that artist's search, URL-encoding the name", () => {
    renderRecentSearches({ entries: ["Godspeed You! Black Emperor"] });

    expect(screen.getByRole("link", { name: "Godspeed You! Black Emperor" })).toHaveAttribute(
      "href",
      "/en?q=Godspeed%20You!%20Black%20Emperor",
    );
  });

  it("calls onSelect with the artist when an entry is clicked", async () => {
    const onSelect = vi.fn();
    renderRecentSearches({ onSelect });

    await userEvent.click(screen.getByRole("link", { name: "Katatonia" }));

    expect(onSelect).toHaveBeenCalledWith("Katatonia");
  });

  it("calls only onRemove when an entry's remove control is clicked", async () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    renderRecentSearches({ onSelect, onRemove });

    await userEvent.click(screen.getByRole("button", { name: /^Remove Katatonia/ }));

    expect(onRemove).toHaveBeenCalledWith("Katatonia");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("reaches every link and remove control by keyboard, in DOM order", async () => {
    renderRecentSearches({ entries: ["Opeth", "Katatonia"] });
    const focusOrder = [
      screen.getByRole("link", { name: "Opeth" }),
      screen.getByRole("button", { name: /^Remove Opeth/ }),
      screen.getByRole("link", { name: "Katatonia" }),
      screen.getByRole("button", { name: /^Remove Katatonia/ }),
    ];

    await userEvent.tab();
    expect(focusOrder[0]).toHaveFocus();
    await userEvent.tab();
    expect(focusOrder[1]).toHaveFocus();
    await userEvent.tab();
    expect(focusOrder[2]).toHaveFocus();
    await userEvent.tab();
    expect(focusOrder[3]).toHaveFocus();
  });
});
