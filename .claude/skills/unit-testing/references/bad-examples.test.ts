// BAD EXAMPLES — each block violates a unit-testing rule. Do NOT copy these.
// Each is annotated with the rule it breaks and how to fix it. This file is a
// catalogue of anti-patterns; it is intentionally not meant to run cleanly.

import { describe, expect, it, vi } from "vitest";

// ❌ RULE 1 — Testing implementation details instead of behavior.
// Fix: assert on the returned value, not on which internal helper was called.
describe("buildLabel", () => {
  it("calls the internal formatter", () => {
    const formatSpy = vi.fn();
    // Spying on a private helper couples the test to the implementation; any
    // refactor that stops using it breaks the test even if output is correct.
    expect(formatSpy).toHaveBeenCalled();
  });
});

// ❌ RULE 2 — Vague, meaningless test name.
// Fix: name the expected behavior, e.g. "returns null for an empty query".
describe("search", () => {
  it("works", () => {
    expect(true).toBe(true);
  });
});

// ❌ RULE 3 & 4 — No AAA structure and many unrelated behaviors in one test.
// Fix: split into separate, focused it blocks each with arrange/act/assert.
describe("artist flow", () => {
  it("does everything", () => {
    expect(1 + 1).toBe(2);
    expect("a".toUpperCase()).toBe("A");
    expect([1, 2].length).toBe(2);
    expect(Boolean("")).toBe(false);
  });
});

// ❌ RULE 5 — Shared mutable state leaking across tests, no reset.
// Fix: build fresh state per test and restore mocks in afterEach.
let cache: string[] = [];
describe("leaky cache", () => {
  it("adds one item", () => {
    cache.push("a");
    expect(cache).toHaveLength(1);
  });
  it("expects an empty cache (fails if the previous test ran first)", () => {
    // Order-dependent: this only passes in isolation.
    expect(cache).toHaveLength(1);
  });
});

// ❌ RULE 6 — Hitting the real network / real clock (non-deterministic).
// Fix: mock fetch with vi.stubGlobal and fake timers with vi.useFakeTimers.
describe("live fetch", () => {
  it("fetches the real API", async () => {
    const response = await fetch("https://api.example.com/artist");
    expect(response.ok).toBe(true); // flaky: depends on the network
  });
});

// ❌ RULE 7 — Only the happy path is tested.
// Fix: also cover not-found, empty input, and thrown-error cases.
function divide(numerator: number, denominator: number): number {
  if (denominator === 0) throw new Error("Cannot divide by zero");
  return numerator / denominator;
}
describe("divide", () => {
  it("divides two numbers", () => {
    expect(divide(10, 2)).toBe(5);
    // Missing: the denominator === 0 error case.
  });
});

// ❌ RULE 8 — Querying by test id / DOM structure instead of role.
// Fix: use getByRole("button", { name: "Search" }) or getByLabelText.
declare const container: HTMLElement;
describe("SearchBar", () => {
  it("finds the button by test id", () => {
    const button = container.querySelector('[data-testid="search-btn"]');
    expect(button).not.toBeNull();
  });
});
