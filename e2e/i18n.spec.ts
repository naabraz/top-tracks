import { expect, test, type Locator, type Page } from "@playwright/test";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { CATALOG, UNKNOWN_ARTIST } from "./support/artists";
import { mockArtistApi, mockArtistApiError } from "./support/mockArtistApi";
import { getErrorMessage, getResultFor } from "./support/homePage";

/**
 * The language journey from PRD i18n-language-selection: arriving in the
 * browser's language, switching without losing the answer, and being
 * remembered on the next visit. The Portuguese locators read straight from the
 * pt-BR dictionary, so copy edits never strand the suite.
 */

function getPortugueseSearchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: ptBR.search.inputLabel });
}

function getPortugueseResultFor(page: Page, artistName: string): Locator {
  return page.getByRole("region", {
    name: formatMessage(ptBR.results.regionLabel, { artist: artistName }),
  });
}

/** Runs a search the way a Portuguese reader does, through the localized form. */
async function searchInPortuguese(page: Page, artistName: string): Promise<void> {
  await getPortugueseSearchBox(page).fill(artistName);
  await page.getByRole("button", { name: ptBR.search.submit }).click();
}

test.describe("Arriving in the reader's language", () => {
  test("redirects / to /en and shows the English hero by default", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/");

    await expect(page).toHaveURL("/en");
    await expect(page.getByText(en.hero.headlineLead)).toBeVisible();
  });

  test.describe("with a Portuguese browser", () => {
    test.use({ locale: "pt-BR" });

    test("redirects / to /pt-BR and shows the Portuguese hero", async ({ page }) => {
      await mockArtistApi(page, { catalog: CATALOG });

      await page.goto("/");

      await expect(page).toHaveURL("/pt-BR");
      await expect(page.getByText(ptBR.hero.headlineLead)).toBeVisible();
    });
  });

  test("renders /pt-BR?q=Opeth in Portuguese regardless of browser language", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/pt-BR?q=Opeth");

    const result = getPortugueseResultFor(page, "Opeth");
    await expect(result).toBeVisible();
    await expect(result.getByText(ptBR.results.topTrackLabel)).toBeVisible();
    await expect(result.getByRole("link", { name: "Windowpane" })).toBeVisible();
  });

  test("renders the 404 page for an unsupported locale path", async ({ page }) => {
    await page.goto("/fr");

    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("Switching language", () => {
  test("re-renders the same answer in Portuguese and moves the URL to /pt-BR", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/en?q=Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();

    await page.getByRole("button", { name: "PT", exact: true }).click();

    await expect(page).toHaveURL("/pt-BR?q=Opeth");
    const result = getPortugueseResultFor(page, "Opeth");
    await expect(result).toBeVisible();
    await expect(result.getByText(ptBR.results.topTrackLabel)).toBeVisible();
  });

  test("marks the active language in the switcher", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/pt-BR");

    await expect(page.getByRole("button", { name: "PT", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "false");
  });

  test("remembers the choice: after switching to PT, / redirects to /pt-BR", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/en");
    await page.getByRole("button", { name: "PT", exact: true }).click();
    await expect(page).toHaveURL("/pt-BR");

    await page.goto("/");

    await expect(page).toHaveURL("/pt-BR");
  });

  test("matches <html lang> and the title to the active locale on both paths", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(en.metadata.title);

    await page.goto("/pt-BR");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page).toHaveTitle(ptBR.metadata.title);
  });
});

test.describe("Failing honestly, in Portuguese", () => {
  test("says no artist matches, in Portuguese", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/pt-BR");

    await searchInPortuguese(page, UNKNOWN_ARTIST);

    await expect(getErrorMessage(page)).toContainText(
      formatMessage(ptBR.errors["not-found"], { query: UNKNOWN_ARTIST }),
    );
  });

  test("reports an upstream failure in Portuguese", async ({ page }) => {
    await mockArtistApiError(page, { code: "upstream-error" });
    await page.goto("/pt-BR");

    await searchInPortuguese(page, "Opeth");

    await expect(getErrorMessage(page)).toContainText(ptBR.errors["upstream-error"]);
  });
});
