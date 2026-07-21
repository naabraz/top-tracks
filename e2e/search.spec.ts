import { expect, test } from "@playwright/test";
import { CATALOG } from "./support/artists";
import { mockArtistApi } from "./support/mockArtistApi";
import { getLoadingResults, getResultFor, getSearchBox, searchForArtist } from "./support/homePage";

/**
 * The product's one job: given an artist, deliver the top track, the top album,
 * and three similar artists — fast and unambiguously.
 */
test.describe("Getting an answer", () => {
  test("prompts for a band before any search has run", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/");

    await expect(page.getByText("Search a band to begin")).toBeVisible();
    await expect(getResultFor(page, "Opeth")).toBeHidden();
  });

  test("answers a search with the top track, its album, and similar artists", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    const result = getResultFor(page, "Opeth");
    await expect(result.getByRole("heading", { name: "Opeth", level: 2 })).toBeVisible();
    await expect(result.getByRole("link", { name: "Windowpane" })).toBeVisible();
    await expect(result).toContainText("2.9M");
    await expect(result).toContainText("From Damnation (2003)");
    await expect(result.getByRole("link", { name: "Blackwater Park" })).toBeVisible();
    await expect(result).toContainText("Released 2001");
    await expect(result.getByRole("button", { name: /^Search / })).toHaveCount(3);
  });

  test("puts the top track ahead of the album, because the track is the answer", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    // Reading order is the hierarchy: it is what a screen reader announces and
    // what a phone shows once the two cards stack.
    const labels = getResultFor(page, "Opeth").getByText(/^Top (track|album)$/);
    await expect(labels).toHaveText(["Top track", "Top album"]);
  });

  test("holds the reader's place with a skeleton on the very first search", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG, delayMs: 1_000 });
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    await expect(getLoadingResults(page)).toBeVisible();
    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getLoadingResults(page)).toBeHidden();
  });

  test("opens a shared link straight on the answer, artist already in the field", async ({
    page,
  }) => {
    await mockArtistApi(page, { catalog: CATALOG });

    await page.goto("/?q=Opeth");

    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getSearchBox(page)).toHaveValue("Opeth");
  });
});
