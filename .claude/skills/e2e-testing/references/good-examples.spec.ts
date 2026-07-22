// GOOD EXAMPLES — E2E tests that follow the e2e-testing rules.
//
// Every test below:
//   - walks a real user journey through the UI (rule 1)
//   - locates elements by role and accessible name (rule 2)
//   - relies on auto-retrying web-first assertions, never sleeps (rule 3)
//   - mocks the network at our own API boundary (rule 4)
//   - does its own setup and passes alone, in any order (rule 5)
//   - reuses support helpers instead of copy-pasting locators (rule 6)
//   - is named as a sentence about what the user gets (rule 7)
// Loading and error states get first-class tests (rule 8), test bodies are
// straight lines with no branching (rule 9), and everything here is a critical
// flow — unit-sized cases stay in Vitest (rule 10).

import { expect, test, type Locator, type Page } from "@playwright/test";

// In real specs these live in `e2e/support/` (rule 6). They are inlined here
// only so this reference file is self-contained.

const CATALOG = {
  opeth: {
    name: "Opeth",
    topTrack: { name: "Windowpane", playcount: 2_900_000 },
    similar: ["Katatonia", "Porcupine Tree", "Anathema"],
  },
};

/** Rule 4: serve `/api/artist` from a fixture so the suite is offline. */
async function mockArtistApi(page: Page, { delayMs = 0 } = {}): Promise<void> {
  await page.route(/\/api\/artist\?/, async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") ?? "";
    const artist = CATALOG[query.trim().toLowerCase() as keyof typeof CATALOG];

    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (!artist) {
      await route.fulfill({ status: 404, json: { error: `No artist found matching "${query}".` } });
      return;
    }
    await route.fulfill({ json: artist });
  });
}

/** Rule 4: fail every lookup, so the error path is testable on demand. */
async function mockArtistApiError(page: Page, message: string): Promise<void> {
  await page.route(/\/api\/artist\?/, (route) =>
    route.fulfill({ status: 502, json: { error: message } })
  );
}

// Rule 2: every locator is role + accessible name. If one of these can't find
// its element, the component has an accessibility bug — fix it there.
function getSearchBox(page: Page): Locator {
  return page.getByRole("searchbox", { name: "Artist or band name" });
}

function getResultFor(page: Page, artistName: string): Locator {
  return page.getByRole("region", { name: `Results for ${artistName}` });
}

/** Rule 1: a multi-step action expressed the way a user performs it. */
async function searchForArtist(page: Page, artistName: string): Promise<void> {
  await getSearchBox(page).fill(artistName);
  await page.getByRole("button", { name: /discover/i }).click();
}

// Rule 7: the describe names the flow; each test reads as a sentence.
test.describe("Getting an answer", () => {
  // Rule 5: this test mocks and navigates for itself — it passes alone.
  test("answers a search with the top track and similar artists", async ({ page }) => {
    await mockArtistApi(page);
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    // Rule 3: these assertions auto-retry until the response renders; no
    // waitForTimeout, no manual polling.
    const result = getResultFor(page, "Opeth");
    await expect(result.getByRole("heading", { name: "Opeth", level: 2 })).toBeVisible();
    await expect(result.getByRole("link", { name: "Windowpane" })).toBeVisible();
    await expect(result.getByRole("button", { name: /^Search / })).toHaveCount(3);
  });

  // Rule 8: the loading state is a first-class test. The mock's delay makes
  // the skeleton reliably observable — no sleeps needed (rule 3).
  test("holds the reader's place with a skeleton while the answer loads", async ({ page }) => {
    await mockArtistApi(page, { delayMs: 1_000 });
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    await expect(page.getByRole("region", { name: "Loading results" })).toBeVisible();
    await expect(getResultFor(page, "Opeth")).toBeVisible();
    await expect(page.getByRole("region", { name: "Loading results" })).toBeHidden();
  });
});

test.describe("Failing honestly", () => {
  // Rule 8: the upstream-failure path, verified end to end. Rule 4 makes it
  // reproducible: the mock fails on demand, no need for Last.fm to be down.
  test("tells the reader plainly when the lookup fails", async ({ page }) => {
    await mockArtistApiError(page, "Something went wrong on our end.");
    await page.goto("/");

    await searchForArtist(page, "Opeth");

    // Scoped to `main` because Next's route announcer is also a role=alert.
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "Something went wrong on our end."
    );
  });
});
