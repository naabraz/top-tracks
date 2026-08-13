import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Locale } from "@/lib/i18n/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { RecentSearchItem } from "./RecentSearchItem";

const DICTIONARIES = { en, "pt-BR": ptBR };

interface RenderOptions {
  locale?: Locale;
  onSelect?: (artistName: string) => void;
  onRemove?: (artistName: string) => void;
}

function renderRecentSearchItem(options: RenderOptions = {}) {
  const { locale = "en", onSelect = vi.fn(), onRemove = vi.fn() } = options;

  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      <ul>
        <RecentSearchItem
          artistName="Opeth"
          href="/en?q=Opeth"
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </ul>
    </LocaleProvider>,
  );
}

describe("RecentSearchItem", () => {
  it("names the link after the artist and points it at that search", () => {
    renderRecentSearchItem();

    expect(screen.getByRole("link", { name: "Opeth" })).toHaveAttribute("href", "/en?q=Opeth");
  });

  it("labels the remove control with the artist it removes", () => {
    renderRecentSearchItem();

    expect(
      screen.getByRole("button", { name: "Remove Opeth from recent searches" }),
    ).toBeInTheDocument();
  });

  it("localizes the remove control's label under the pt-BR dictionary", () => {
    renderRecentSearchItem({ locale: "pt-BR" });

    expect(
      screen.getByRole("button", { name: "Remover Opeth das buscas recentes" }),
    ).toBeInTheDocument();
  });

  it("hides the remove glyph from assistive technology", () => {
    renderRecentSearchItem();

    expect(screen.getByText("×")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the link and the remove control as separately focusable siblings", async () => {
    renderRecentSearchItem();
    const link = screen.getByRole("link", { name: "Opeth" });
    const removeButton = screen.getByRole("button", { name: /^Remove Opeth/ });

    await userEvent.tab();
    expect(link).toHaveFocus();

    await userEvent.tab();
    expect(removeButton).toHaveFocus();
    expect(link).not.toContainElement(removeButton);
  });

  it("calls onRemove when the remove control is activated from the keyboard", async () => {
    const onRemove = vi.fn();
    renderRecentSearchItem({ onRemove });

    screen.getByRole("button", { name: /^Remove Opeth/ }).focus();
    await userEvent.keyboard("{Enter}");

    expect(onRemove).toHaveBeenCalledWith("Opeth");
  });
});
