// GOOD EXAMPLES — tests that follow the unit-testing rules.
//
// Every test below:
//   - asserts on observable behavior, not internals (rule 1)
//   - has a descriptive name (rule 2)
//   - follows Arrange–Act–Assert (rule 3)
//   - checks one behavior (rule 4)
//   - resets mocks so order never matters (rule 5)
//   - mocks external dependencies for determinism (rule 6)
//   - covers edge/error cases (rule 7)
// Component tests query by role/accessible name (rule 8).

import { afterEach, describe, expect, it, vi } from "vitest";

// A small unit under test, inlined here so the file is self-contained.
function formatCount(count: number): string {
  if (count >= 1_000_000) return `${Math.round(count / 100_000) / 10}M`;
  if (count >= 1_000) return `${Math.round(count / 100) / 10}K`;
  return String(count);
}

async function fetchArtistName(query: string): Promise<string | null> {
  const response = await fetch(`/api/artist?q=${query}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.name;
}

afterEach(() => {
  // Rule 5: isolate tests — no mock leaks across cases.
  vi.restoreAllMocks();
});

// Rule 2/4: one clearly named behavior per test.
describe("formatCount", () => {
  it("formats millions with an M suffix", () => {
    expect(formatCount(2_500_000)).toBe("2.5M");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatCount(1_200)).toBe("1.2K");
  });

  // Rule 7: cover the small-number edge case, not just large ones.
  it("leaves counts under a thousand unchanged", () => {
    expect(formatCount(42)).toBe("42");
  });
});

describe("fetchArtistName", () => {
  // Rule 3/6: Arrange (mock fetch), Act (call once), Assert.
  it("returns the artist name on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: "Radiohead" }),
      }),
    );

    const name = await fetchArtistName("radiohead");

    expect(name).toBe("Radiohead");
  });

  // Rule 7: the error path is a first-class test.
  it("returns null when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const name = await fetchArtistName("nobody");

    expect(name).toBeNull();
  });
});
