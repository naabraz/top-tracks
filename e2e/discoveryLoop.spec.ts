import { expect, test } from "@playwright/test";
import { CATALOG } from "./support/artists";
import { mockArtistApi } from "./support/mockArtistApi";
import {
  getLoadingResults,
  getResultFor,
  getSearchBox,
  getSimilarArtistTile,
} from "./support/homePage";

/**
 * The engine of the product: success is not one answer delivered, it is the
 * reader kept exploring. Each answer has to be a doorway to the next.
 */
test.describe("The discovery loop", () => {
  test("follows a similar artist into the next answer", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/?q=Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();

    await getSimilarArtistTile(page, "Katatonia").click();

    await expect(getResultFor(page, "Katatonia")).toBeVisible();
    await expect(getResultFor(page, "Katatonia").getByRole("link", { name: "My Twin" })).toBeVisible();
    await expect(getSearchBox(page)).toHaveValue("Katatonia");
  });

  test("puts each answer in the URL, so any step of the loop is shareable", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/?q=Opeth");

    await getSimilarArtistTile(page, "Katatonia").click();

    await expect(page).toHaveURL("/?q=Katatonia");
  });

  test("walks back out through the artists the reader came in via", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG });
    await page.goto("/?q=Opeth");
    await getSimilarArtistTile(page, "Katatonia").click();
    await expect(getResultFor(page, "Katatonia")).toBeVisible();

    await page.goBack();

    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(getSearchBox(page)).toHaveValue("Opeth");
  });

  test("keeps the outgoing answer on screen while the next one loads", async ({ page }) => {
    await mockArtistApi(page, { catalog: CATALOG, delayMs: 1_000 });
    await page.goto("/?q=Opeth");
    await expect(getResultFor(page, "Opeth")).toBeVisible();

    await getSimilarArtistTile(page, "Katatonia").click();

    // Mid-loop the page holds its height instead of collapsing under the
    // reader: the previous artist stays, marked busy, and no skeleton appears.
    await expect(getResultFor(page, "Opeth")).toHaveAttribute("aria-busy", "true");
    await expect(getLoadingResults(page)).toBeHidden();
    await expect(getResultFor(page, "Katatonia")).toBeVisible();
  });
});
