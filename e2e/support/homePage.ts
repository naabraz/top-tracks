import type { Locator, Page } from "@playwright/test";

/**
 * The home screen's test surface. Everything is addressed by role and
 * accessible name, so these locators break when the experience breaks — not
 * when a class name or the markup nesting changes.
 */

const SEARCH_LABEL = "Artist or band name";

const RECENT_SEARCHES_HEADING = "Recent searches";

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

/**
 * The trail of past searches, under the answer. A reader who has never
 * completed a search has no such region at all, so this is also how the suite
 * asserts the section's absence.
 */
export function getRecentSearches(page: Page): Locator {
  return page.getByRole("region", { name: RECENT_SEARCHES_HEADING });
}

/** One entry in the trail — a real link back to that artist's answer. */
export function getRecentSearchLink(page: Page, artistName: string): Locator {
  return getRecentSearches(page).getByRole("link", { name: artistName, exact: true });
}

/** Every entry in the trail, in the order the reader reads them. */
export function getRecentSearchLinks(page: Page): Locator {
  return getRecentSearches(page).getByRole("link");
}

/** The control that drops one artist from the trail. */
export function getRemoveRecentSearchButton(page: Page, artistName: string): Locator {
  return getRecentSearches(page).getByRole("button", {
    name: `Remove ${artistName} from recent searches`,
  });
}

/** Runs a search the way a reader does: type the name, submit the form. */
export async function searchForArtist(page: Page, artistName: string): Promise<void> {
  await getSearchBox(page).fill(artistName);
  await getSubmitButton(page).click();
}

/**
 * Runs several searches in a row, letting each answer arrive before typing the
 * next — the trail is written when a lookup settles, so a search still in
 * flight has not been recorded yet. Names must be spelled as the catalog
 * returns them, since each answer is awaited by its canonical region label.
 */
export async function searchForArtists(page: Page, artistNames: string[]): Promise<void> {
  for (const artistName of artistNames) {
    await searchForArtist(page, artistName);
    await getResultFor(page, artistName).waitFor();
  }
}
