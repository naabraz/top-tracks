// BAD EXAMPLES — each block violates an e2e-testing rule. Do NOT copy these.
// Each is annotated with the rule it breaks and how to fix it. This file is a
// catalogue of anti-patterns; it is intentionally not meant to run cleanly.

import { expect, test } from "@playwright/test";

// ❌ RULE 1 — Asserting on markup internals instead of what the user sees.
// Fix: assert on visible text and roles; a valid restyle must not break this.
test("renders the result card with the right class", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("div.result-card > div:nth-child(2) > span");
  await expect(card).toHaveClass(/text-emerald-400/);
});

// ❌ RULE 2 — CSS/testid locators that break when a class name changes.
// Fix: page.getByRole("searchbox", { name: "Artist or band name" }).
test("finds the search input by test id", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-testid="search-input"]').fill("Opeth");
  await page.locator("form button.submit-btn").click();
});

// ❌ RULE 3 — Sleeping instead of waiting for something observable.
// Fix: drop the waitForTimeout; expect(...).toBeVisible() already retries
// until the response renders.
test("waits three seconds for results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Artist or band name" }).fill("Opeth");
  await page.getByRole("button", { name: /discover/i }).click();
  await page.waitForTimeout(3000); // flaky when slow, wasteful when fast
  await expect(page.getByText("Windowpane")).toBeVisible();
});

// ❌ RULE 4 — Hitting the real API: online, non-deterministic, unownable.
// Fix: mock `/api/artist` with page.route and a fixture catalog. The real top
// track changes over time, so this test rots even if the product is fine.
test("shows Opeth's real current top track", async ({ page }) => {
  await page.goto("/"); // no page.route — this calls Last.fm for real
  await page.getByRole("searchbox", { name: "Artist or band name" }).fill("Opeth");
  await page.getByRole("button", { name: /discover/i }).click();
  await expect(page.getByText("Windowpane")).toBeVisible();
});

// ❌ RULE 5 — Tests coupled by shared state and forced ordering.
// Fix: each test mocks and navigates for itself; delete the .serial.
test.describe.serial("coupled flow", () => {
  test("searches for an artist", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Artist or band name" }).fill("Opeth");
    await page.getByRole("button", { name: /discover/i }).click();
  });

  test("then checks the result of the previous test", async ({ page }) => {
    // Depends on the previous test's navigation and state; fails alone and
    // can never run in parallel.
    await expect(page.getByRole("link", { name: "Windowpane" })).toBeVisible();
  });
});

// ❌ RULE 6 — Copy-pasted locators and inline ad-hoc fixture data.
// Fix: import getSearchBox/searchForArtist from e2e/support/homePage and the
// typed catalog from e2e/support/artists.
test("duplicates every locator inline", async ({ page }) => {
  await page.route(/\/api\/artist\?/, (route) =>
    route.fulfill({ json: { name: "Opeth", topTrack: { name: "Windowpane" } } })
  );
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Artist or band name" }).fill("Opeth");
  await page.getByRole("button", { name: /discover/i }).click();
});

// ❌ RULE 7 — Vague name that says nothing about the user-facing behavior.
// Fix: e.g. test("answers a search with the top track and similar artists").
test("search works", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/./);
});

// ❌ RULE 8 — Only the happy path; loading and failure states untested.
// Fix: add tests that mock a delayed response (skeleton visible) and a 502
// (alert visible with an honest message).
test("shows results on success (and nothing else, ever)", async ({ page }) => {
  await page.goto("/");
  // Missing: the skeleton test, the not-found test, the upstream-error test.
});

// ❌ RULE 9 — Branching and try/catch hide what the test actually verifies.
// Fix: split into two straight-line tests, one per deterministic scenario.
test("checks the result or the error, whichever happens", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Artist or band name" }).fill("Opeth");
  await page.getByRole("button", { name: /discover/i }).click();
  try {
    await expect(page.getByRole("link", { name: "Windowpane" })).toBeVisible();
  } catch {
    // Swallows real failures: the test "passes" whether the app works or not.
    await expect(page.getByRole("alert")).toBeVisible();
  }
});

// ❌ RULE 10 — Unit-sized case run through a full browser.
// Fix: playcount formatting is a pure function; cover its permutations in
// Vitest (see the unit-testing skill) and keep E2E for the critical flows.
test("formats 1200 plays as 1.2K", async ({ page }) => {
  await page.goto("/");
  // ...an entire browser session to check a number formatter.
});
