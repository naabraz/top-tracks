import { describe, expect, it, vi } from "vitest";

// The server-only marker throws outside a React Server environment; stub it so
// the loader itself stays importable under Vitest.
vi.mock("server-only", () => ({}));

import { getDictionary } from "./getDictionary";

/** Walks a dictionary and returns every leaf key path, e.g. "empty.prompt". */
function collectKeyPaths(node: object, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return collectKeyPaths(value, path);
    }
    return [path];
  });
}

describe("getDictionary", () => {
  it("returns the English strings for en", async () => {
    const dictionary = await getDictionary("en");

    expect(dictionary.empty.prompt).toBe("Search a band to begin");
  });

  it("returns the Portuguese strings for pt-BR", async () => {
    const dictionary = await getDictionary("pt-BR");

    expect(dictionary.empty.prompt).toBe("Busque uma banda para começar");
  });

  it("exposes the exact same key paths in both dictionaries", async () => {
    const englishDictionary = await getDictionary("en");
    const portugueseDictionary = await getDictionary("pt-BR");

    const englishKeyPaths = collectKeyPaths(englishDictionary).sort();
    const portugueseKeyPaths = collectKeyPaths(portugueseDictionary).sort();

    expect(portugueseKeyPaths).toEqual(englishKeyPaths);
  });
});
