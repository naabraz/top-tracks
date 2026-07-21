import type { Locator, Page } from "@playwright/test";

/**
 * The home screen's test surface. Everything is addressed by role and
 * accessible name, so these locators break when the experience breaks — not
 * when a class name or the markup nesting changes.
 */

const SEARCH_LABEL = "Artist or band name";

export function getSearchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: SEARCH_LABEL });
}

export function getSubmitButton(page: Page): Locator {
  return page.getByRole("button", { name: /discover|searching/i });
}

export function getResultFor(page: Page, artistName: string): Locator {
  return page.getByRole("region", { name: `Results for ${artistName}` });
}

export function getLoadingResults(page: Page): Locator {
  return page.getByRole("region", { name: "Loading results" });
}

/**
 * The failure message. Scoped to `main` because Next's own route announcer is
 * an empty `role="alert"` living outside it, and would otherwise match too.
 */
export function getErrorMessage(page: Page): Locator {
  return page.getByRole("main").getByRole("alert");
}

/** One similar-artist tile — the doorway into the next search. */
export function getSimilarArtistTile(page: Page, artistName: string): Locator {
  return page.getByRole("button", { name: `Search ${artistName}` });
}

/** Runs a search the way a reader does: type the name, submit the form. */
export async function searchForArtist(page: Page, artistName: string): Promise<void> {
  await getSearchBox(page).fill(artistName);
  await getSubmitButton(page).click();
}
