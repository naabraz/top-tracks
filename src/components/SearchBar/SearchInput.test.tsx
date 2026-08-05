import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import type { Locale } from "@/lib/i18n/types";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SearchInput } from "./SearchInput";

const DICTIONARIES = { en, "pt-BR": ptBR };

function renderWithLocale(ui: ReactElement, locale: Locale = "en") {
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      {ui}
    </LocaleProvider>,
  );
}

describe("SearchInput", () => {
  it("exposes an accessible search box labelled for artists", () => {
    renderWithLocale(<SearchInput value="" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox", { name: /artist or band name/i })).toBeInTheDocument();
  });

  it("labels the search box in Portuguese for pt-BR", () => {
    renderWithLocale(<SearchInput value="" onChange={vi.fn()} />, "pt-BR");

    expect(
      screen.getByRole("searchbox", { name: /nome do artista ou banda/i }),
    ).toBeInTheDocument();
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    renderWithLocale(<SearchInput value="" onChange={onChange} />);

    await userEvent.type(screen.getByRole("searchbox"), "a");

    expect(onChange).toHaveBeenCalled();
  });
});
