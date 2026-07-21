import type { Page } from "@playwright/test";
import type { ArtistCatalog, MockArtistApiErrorOptions, MockArtistApiOptions } from "./types";

/** Every client lookup, whatever the artist name and however it is encoded. */
const ARTIST_API_ROUTE = /\/api\/artist\?/;

const UPSTREAM_ERROR_STATUS = 502;

function findArtist(catalog: ArtistCatalog, query: string) {
  return catalog[query.trim().toLowerCase()] ?? null;
}

function readQuery(url: string): string {
  return new URL(url).searchParams.get("q") ?? "";
}

/**
 * Serves `/api/artist` from a fixture catalog so the suite stays offline and
 * deterministic — a changing top track can never turn a passing test red.
 * Misses answer with the same 404 body the real route returns.
 */
export async function mockArtistApi(page: Page, options: MockArtistApiOptions): Promise<void> {
  const { catalog, delayMs = 0 } = options;

  await page.route(ARTIST_API_ROUTE, async (route) => {
    const query = readQuery(route.request().url());
    const artist = findArtist(catalog, query);

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    if (!artist) {
      await route.fulfill({
        status: 404,
        json: { error: `No artist found matching "${query}".` },
      });
      return;
    }

    await route.fulfill({ json: artist });
  });
}

/** Fails every lookup, for the paths where Last.fm or our server is the problem. */
export async function mockArtistApiError(
  page: Page,
  options: MockArtistApiErrorOptions
): Promise<void> {
  const { message, status = UPSTREAM_ERROR_STATUS } = options;

  await page.route(ARTIST_API_ROUTE, async (route) => {
    await route.fulfill({ status, json: { error: message } });
  });
}
