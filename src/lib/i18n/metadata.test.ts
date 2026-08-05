import { describe, expect, it, vi } from "vitest";

// The server-only marker throws outside a React Server environment; stub it so
// the loader behind buildMetadata stays importable under Vitest.
vi.mock("server-only", () => ({}));

import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("returns the English description for en", async () => {
    const metadata = await buildMetadata("en");

    expect(metadata.description).toMatch(/type a band and feel its essence/i);
  });

  it("returns the Portuguese description for pt-BR", async () => {
    const metadata = await buildMetadata("pt-BR");

    expect(metadata.description).toMatch(/digite uma banda e sinta sua essência/i);
  });

  it("keeps the untranslated wordmark title identical in both locales", async () => {
    const english = await buildMetadata("en");
    const portuguese = await buildMetadata("pt-BR");

    expect(english.title).toBe("TopTracks — band discovery");
    expect(portuguese.title).toBe(english.title);
  });

  it("lists alternate language entries for both locale paths", async () => {
    const metadata = await buildMetadata("en");

    expect(metadata.alternates?.languages).toEqual({
      en: "/en",
      "pt-BR": "/pt-BR",
    });
  });
});
