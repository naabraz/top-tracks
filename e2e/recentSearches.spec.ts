import { expect, test } from "@playwright/test";
import {
  buildCatalog,
  CATALOG,
  OVERFLOWING_TRAIL_ARTISTS,
  UNKNOWN_ARTIST,
} from "./support/artists";
import { mockArtistApi } from "./support/mockArtistApi";
import {
  getErrorMessage,
  getRecentSearches,
  getRecentSearchLink,
  getRecentSearchLinks,
  getRemoveRecentSearchButton,
  getResultFor,
  getSearchBox,
  getSimilarArtistTile,
  searchForArtist,
  searchForArtists,
} from "./support/homePage";

/**
 * PRODUCT.md's returning reader: someone who looks up a handful of bands in one
 * sitting and comes back later. The trail is only worth anything if it is
 * theirs — what they typed, under the name the API answered with — and if it
 * survives the browser closing. Both are only honestly verifiable here, against
 * real `localStorage` in a real browser.
 */
test.describe("Building a trail of recent searches", () => {
  test("shows no recent-searches section on a first visit", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/");

    await expect(getRecentSearches(page)).toBeHidden();
  });

  test("lists a searched artist under the name the API answered with", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await searchForArtist(page, "opeth");

    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();
  });

  test("keeps the trail through a page reload", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, "Opeth");
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();

    await page.reload();

    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();
  });

  test("keeps the trail in a new session restored from the same storage", async ({
    page,
    browser,
    baseURL,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, "Opeth");
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();

    const storageState = await page.context().storageState();
    const restoredContext = await browser.newContext({ storageState, baseURL });
    const restoredPage = await restoredContext.newPage();
    await mockArtistApi(restoredPage, { catalog: CATALOG });
    await restoredPage.goto("/");

    await expect(getRecentSearchLink(restoredPage, "Opeth")).toBeVisible();
    await restoredContext.close();
  });

  test("leaves a followed similar artist out of the trail", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, "Opeth");
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();

    await getSimilarArtistTile(page, "Katatonia").click();

    await expect(getResultFor(page, "Katatonia")).toBeVisible();
    await expect(getRecentSearchLinks(page)).toHaveText(["Opeth"]);
  });

  test("stops the trail at ten entries, dropping the oldest", async ({ page }) => {
    await mockArtistApi(page, { catalog: buildCatalog(OVERFLOWING_TRAIL_ARTISTS) });
    const [firstSearched, ...laterSearches] = OVERFLOWING_TRAIL_ARTISTS;
    const newestFirst = [...laterSearches].reverse();
    await page.goto("/");

    await searchForArtists(page, OVERFLOWING_TRAIL_ARTISTS);

    await expect(getRecentSearchLinks(page)).toHaveText(newestFirst);
    await expect(getRecentSearchLink(page, firstSearched)).toBeHidden();
  });

  test("shows the trail beside a not-found answer, without the failed search in it", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, "Opeth");
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();

    await searchForArtist(page, UNKNOWN_ARTIST);

    await expect(getErrorMessage(page)).toBeVisible();
    await expect(getRecentSearchLinks(page)).toHaveText(["Opeth"]);
  });
});

test.describe("Returning to an artist from the trail", () => {
  test("re-runs the search, moving the URL and filling the field", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth", "Katatonia"]);

    await getRecentSearchLink(page, "Opeth").click();

    await expect(page).toHaveURL("/en?q=Opeth");
    await expect(getSearchBox(page)).toHaveValue("Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();
  });

  test("moves the reopened artist to the top without listing it twice", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth", "Katatonia"]);

    await getRecentSearchLink(page, "Opeth").click();

    await expect(getRecentSearchLinks(page)).toHaveText(["Opeth", "Katatonia"]);
  });

  test("lands the reader on the answer from the keyboard alone", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth", "Katatonia"]);

    await getRecentSearchLink(page, "Opeth").press("Enter");

    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getResultFor(page, "Opeth")).toBeFocused();
  });
});

test.describe("Clearing an artist from the trail", () => {
  test("drops one entry and leaves the answer on screen untouched", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth", "Katatonia"]);

    await getRemoveRecentSearchButton(page, "Opeth").click();

    await expect(getRecentSearchLinks(page)).toHaveText(["Katatonia"]);
    await expect(getResultFor(page, "Katatonia")).toBeVisible();
    await expect(page).toHaveURL("/en?q=Katatonia");
  });

  test("keeps a removed entry gone after a reload", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtists(page, ["Opeth", "Katatonia"]);
    await getRemoveRecentSearchButton(page, "Opeth").click();

    await page.reload();

    await expect(getRecentSearchLinks(page)).toHaveText(["Katatonia"]);
  });

  test("takes the whole section away with the last entry", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, "Opeth");
    await expect(getRecentSearchLink(page, "Opeth")).toBeVisible();

    await getRemoveRecentSearchButton(page, "Opeth").click();

    await expect(getRecentSearches(page)).toBeHidden();
  });
});
