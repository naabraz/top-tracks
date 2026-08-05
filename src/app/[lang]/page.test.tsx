import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("server-only", () => ({}));

/**
 * The page reads the URL only through `HomeSearch`, whose search flow is
 * covered in `HomeSearch.test.tsx`. A query-less stub is all the shell needs.
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(""),
}));

import type { Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import Home from "./page";

/** Renders the async server page the way the locale layout does: within a provider. */
async function renderHome(locale: Locale) {
  const page = await Home({
    params: Promise.resolve({ lang: locale }),
    searchParams: Promise.resolve({}),
  });
  const dictionary = await getDictionary(locale);
  render(
    <LocaleProvider locale={locale} dictionary={dictionary}>
      {page}
    </LocaleProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Home", () => {
  it("renders the brand, search box, and footer sources", async () => {
    await renderHome("en");

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Last.fm" })).toBeInTheDocument();
  });

  it("renders the shell around the search boundary", async () => {
    await renderHome("en");

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByText(/search a band to begin/i)).toBeInTheDocument();
  });

  it("renders the Portuguese shell for pt-BR", async () => {
    await renderHome("pt-BR");

    expect(screen.getByText(/busque uma banda para começar/i)).toBeInTheDocument();
    expect(screen.getByText("De onde vêm os dados")).toBeInTheDocument();
  });
});
