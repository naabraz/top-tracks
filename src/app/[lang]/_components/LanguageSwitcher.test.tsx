import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Locale } from "@/lib/i18n/types";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

const DICTIONARIES = { en, "pt-BR": ptBR };

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: "/en",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => navigation.pathname,
}));

function renderSwitcher(locale: Locale = "en") {
  navigation.pathname = `/${locale}`;
  return render(
    <LocaleProvider locale={locale} dictionary={DICTIONARIES[locale]}>
      <LanguageSwitcher />
    </LocaleProvider>,
  );
}

beforeEach(() => {
  window.history.replaceState(null, "", "/en");
});

afterEach(() => {
  navigation.replace.mockClear();
  document.cookie = "top-tracks-locale=; path=/; max-age=0";
  vi.restoreAllMocks();
});

describe("LanguageSwitcher", () => {
  it("renders the PT and EN options", () => {
    renderSwitcher("en");

    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PT" })).toBeInTheDocument();
  });

  it("marks the active locale as pressed and the other as not", () => {
    renderSwitcher("pt-BR");

    expect(screen.getByRole("button", { name: "PT" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "false");
  });

  it("localizes the group label", () => {
    renderSwitcher("pt-BR");

    expect(screen.getByRole("group", { name: "Idioma" })).toBeInTheDocument();
  });

  it("navigates to the same path with the locale segment swapped", async () => {
    renderSwitcher("en");

    await userEvent.click(screen.getByRole("button", { name: "PT" }));

    expect(navigation.replace).toHaveBeenCalledWith("/pt-BR", { scroll: false });
  });

  it("preserves the current query string when switching", async () => {
    window.history.replaceState(null, "", "/en?q=Opeth");
    renderSwitcher("en");

    await userEvent.click(screen.getByRole("button", { name: "PT" }));

    expect(navigation.replace).toHaveBeenCalledWith("/pt-BR?q=Opeth", { scroll: false });
  });

  it("persists the chosen locale in the top-tracks-locale cookie", async () => {
    renderSwitcher("en");

    await userEvent.click(screen.getByRole("button", { name: "PT" }));

    expect(document.cookie).toContain("top-tracks-locale=pt-BR");
  });

  it("does not navigate when the active locale is activated again", async () => {
    renderSwitcher("en");

    await userEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("is operable with the keyboard alone", async () => {
    renderSwitcher("en");

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "PT" })).toHaveFocus();

    await userEvent.keyboard("{Enter}");

    expect(navigation.replace).toHaveBeenCalledWith("/pt-BR", { scroll: false });
  });
});
