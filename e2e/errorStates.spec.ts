import { expect, test } from "@playwright/test";
import { CATALOG, UNKNOWN_ARTIST } from "./support/artists";
import { mockArtistApi, mockArtistApiError } from "./support/mockArtistApi";
import {
  getErrorMessage,
  getResultFor,
  getSearchBox,
  searchForArtist,
} from "./support/homePage";

const UPSTREAM_MESSAGE = "The Last.fm API returned an error. Please try again later.";

/**
 * A lookup that fails has to say so plainly and leave the reader able to try
 * again — a dead end is the one way this product loses someone.
 */
test.describe("When the lookup fails", () => {
  test("says plainly when no artist matches", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");

    await searchForArtist(page, UNKNOWN_ARTIST);

    await expect(getErrorMessage(page)).toContainText(
      `No artist found matching "${UNKNOWN_ARTIST}"`
    );
  });

  test("lets the reader search again after a miss", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/");
    await searchForArtist(page, UNKNOWN_ARTIST);
    await expect(getErrorMessage(page)).toBeVisible();

    await searchForArtist(page, "Opeth");

    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getErrorMessage(page)).toBeHidden();
  });

  test("reports an upstream failure without emptying the search field", async ({ page }) => {
    await mockArtistApiError(page, { message: UPSTREAM_MESSAGE });
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    await expect(getErrorMessage(page)).toContainText(UPSTREAM_MESSAGE);
    await expect(getSearchBox(page)).toHaveValue("Opeth");
  });
});
