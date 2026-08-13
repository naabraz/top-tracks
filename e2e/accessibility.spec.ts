import { expect, test, type Locator, type Page } from "@playwright/test";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { CATALOG } from "./support/artists";
import { mockArtistApi } from "./support/mockArtistApi";
import {
  getRecentSearchLink,
  getRemoveRecentSearchButton,
  getResultFor,
  getSearchBox,
  getSimilarArtistTile,
  searchForArtists,
} from "./support/homePage";

/**
 * PRODUCT.md targets WCAG 2.1 AA with full keyboard navigability, and the
 * reveal — the scroll that lands the reader on each new answer — needs a calm
 * alternative. Focus is what carries that news without a mouse or a screen.
 */
test.describe("Reaching the answer without a mouse", () => {
  test("runs a search with Enter from the field alone", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await getSearchBox(page).fill("Opeth");
    await getSearchBox(page).press("Enter");

    await expect(getResultFor(page, "Opeth")).toBeVisible();
  });

  test("lands focus on the new answer, not back at the top of the page", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await getSearchBox(page).fill("Opeth");
    await getSearchBox(page).press("Enter");

    await expect(getResultFor(page, "Opeth")).toBeFocused();
  });

  test("follows the discovery loop from the keyboard", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/?q=Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();

    await getSimilarArtistTile(page, "Katatonia").press("Enter");

    await expect(getResultFor(page, "Katatonia")).toBeVisible();
    await expect(getResultFor(page, "Katatonia")).toBeFocused();
  });

  test("leaves a shared link's scroll position alone", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/?q=Opeth");

    // Arriving on a link is not a search the reader just asked for, so nothing
    // should grab their focus or move them down the page.
    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getResultFor(page, "Opeth")).not.toBeFocused();
  });
});

test.describe("Reaching the answer without a mouse, in Portuguese", () => {
  // The locale must not cost the keyboard journey: the localized labels are
  // the accessible names everything above is located by, so the home and
  // results states have to hold up under the pt-BR dictionary too.
  test("runs a search from the field and lands focus on the answer on /pt-BR", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/pt-BR");
    const searchBox = page.getByRole("searchbox", { name: ptBR.search.inputLabel });

    await searchBox.fill("Opeth");
    await searchBox.press("Enter");

    const result = page.getByRole("region", {
      name: formatMessage(ptBR.results.regionLabel, { artist: "Opeth" }),
    });
    await expect(result).toBeVisible();
    await expect(result).toBeFocused();
  });

  test("keeps the language switcher operable from the keyboard on /pt-BR", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/pt-BR");

    await page.getByRole("button", { name: "EN", exact: true }).focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/en");
  });
});

/**
 * The trail is ten links and ten remove controls sitting under the answer —
 * the densest cluster of controls on the screen, and the one most easily left
 * behind by a reader working from the keyboard.
 */
function getPortugueseRecentSearchLink(page: Page, artistName: string): Locator {
  return page
    .getByRole("region", { name: ptBR.recent.heading })
    .getByRole("link", { name: artistName, exact: true });
}

function getPortugueseRemoveButton(page: Page, artistName: string): Locator {
  return page.getByRole("region", { name: ptBR.recent.heading }).getByRole("button", {
    name: formatMessage(ptBR.recent.removeLabel, { artist: artistName }),
  });
}

test.describe("Reaching the recent searches without a mouse", () => {
  test("puts each entry's remove control right after it in the tab order", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth"]);

    await getRecentSearchLink(page, "Opeth").focus();
    await page.keyboard.press("Tab");

    // Siblings, never nested: each carries its own accessible name and its own
    // stop in the tab order.
    await expect(getRemoveRecentSearchButton(page, "Opeth")).toBeFocused();
  });

  test("removes an entry with the keyboard alone", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth"]);

    await getRemoveRecentSearchButton(page, "Opeth").press("Enter");

    await expect(page.getByRole("region", { name: "Recent searches" })).toBeHidden();
  });

  test("keeps both controls reachable under the pt-BR dictionary", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/pt-BR");
    const searchBox = page.getByRole("searchbox", { name: ptBR.search.inputLabel });
    await searchBox.fill("Opeth");
    await searchBox.press("Enter");

    await getPortugueseRecentSearchLink(page, "Opeth").focus();
    await page.keyboard.press("Tab");

    await expect(getPortugueseRemoveButton(page, "Opeth")).toBeFocused();
  });
});

test.describe("With reduced motion", () => {
  test("still carries the reader to each new answer", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/?q=Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();

    await getSimilarArtistTile(page, "Katatonia").click();

    await expect(getResultFor(page, "Katatonia")).toBeVisible();
    await expect(getResultFor(page, "Katatonia")).toBeFocused();
  });
});
