import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

/**
 * End-to-end coverage for the critical flows in PRODUCT.md: getting an answer,
 * following the discovery loop, and failing honestly.
 *
 * Every spec stubs `/api/artist` at the network boundary, so the suite never
 * touches Last.fm or Spotify: it tests our flows, not their uptime, and a
 * changing top track can never turn a passing test red.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // Watching a run happen: `SLOW_MO=500` puts half a second between actions
    // so a person can follow along. Unset in normal runs, where speed is the
    // whole point.
    launchOptions: { slowMo: Number(process.env.SLOW_MO) || 0 },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // The users in PRODUCT.md are "frequently on a phone", so the answer and
    // the discovery loop have to hold up at 393px too.
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    // Next recommends testing the production build, and CI does exactly that.
    // Locally the dev server skips a full rebuild on every run, which is the
    // difference between a suite you run and one you avoid.
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
