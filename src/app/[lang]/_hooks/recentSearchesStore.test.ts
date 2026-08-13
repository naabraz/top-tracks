import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "top-tracks-recent-searches";

/**
 * The store caches its snapshot at module scope, so every test gets a fresh
 * module instance — otherwise one test's list would leak into the next.
 */
async function loadStore() {
  vi.resetModules();
  return import("./recentSearchesStore");
}

function storeSearches(searches: unknown): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

function readPersistedSearches(): unknown {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
}

function buildArtistNames(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `Artist ${index + 1}`);
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getSnapshot", () => {
  it("returns an empty list when storage holds nothing for the key", async () => {
    const store = await loadStore();

    expect(store.getSnapshot()).toEqual([]);
  });

  it("returns a previously stored list in its stored order", async () => {
    storeSearches(["Opeth", "Katatonia"]);

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual(["Opeth", "Katatonia"]);
  });

  it("returns the same array reference across calls when nothing changed", async () => {
    storeSearches(["Opeth"]);
    const store = await loadStore();

    const firstRead = store.getSnapshot();

    expect(store.getSnapshot()).toBe(firstRead);
  });
});

describe("addSearch", () => {
  it("puts a new artist first and persists the list", async () => {
    storeSearches(["Katatonia"]);
    const store = await loadStore();

    store.addSearch("Opeth");

    expect(store.getSnapshot()).toEqual(["Opeth", "Katatonia"]);
    expect(readPersistedSearches()).toEqual(["Opeth", "Katatonia"]);
  });

  it("notifies every subscriber", async () => {
    const store = await loadStore();
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    store.subscribe(firstListener);
    store.subscribe(secondListener);

    store.addSearch("Opeth");

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);
  });

  it("stops calling a listener that unsubscribed", async () => {
    const store = await loadStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.addSearch("Opeth");

    expect(listener).not.toHaveBeenCalled();
  });

  it("moves an artist already listed to the front without duplicating it", async () => {
    storeSearches(["Katatonia", "Opeth", "Enslaved"]);
    const store = await loadStore();

    store.addSearch("Opeth");

    expect(store.getSnapshot()).toEqual(["Opeth", "Katatonia", "Enslaved"]);
  });

  it("treats names differing only in case and surrounding space as one entry", async () => {
    const store = await loadStore();

    store.addSearch("radiohead");
    store.addSearch("Radiohead ");
    store.addSearch("Radiohead");

    expect(store.getSnapshot()).toEqual(["Radiohead"]);
  });

  it("keeps the most recently recorded spelling of a repeated artist", async () => {
    storeSearches(["radiohead", "Opeth"]);
    const store = await loadStore();

    store.addSearch("RADIOHEAD");

    expect(store.getSnapshot()).toEqual(["RADIOHEAD", "Opeth"]);
  });

  it("neither writes to storage nor notifies when the artist is already first", async () => {
    storeSearches(["Opeth", "Katatonia"]);
    const store = await loadStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    store.addSearch("Opeth");

    expect(setItem).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it("drops the oldest entry once an eleventh artist is recorded", async () => {
    storeSearches(buildArtistNames(10));
    const store = await loadStore();

    store.addSearch("Opeth");

    expect(store.getSnapshot()).toHaveLength(10);
    expect(store.getSnapshot()[0]).toBe("Opeth");
    expect(store.getSnapshot()).not.toContain("Artist 10");
  });

  it("ignores a blank artist name", async () => {
    const store = await loadStore();

    store.addSearch("   ");

    expect(store.getSnapshot()).toEqual([]);
  });
});

describe("removeSearch", () => {
  it("drops only the named entry and preserves the order of the rest", async () => {
    storeSearches(["Opeth", "Katatonia", "Enslaved"]);
    const store = await loadStore();

    store.removeSearch("Katatonia");

    expect(store.getSnapshot()).toEqual(["Opeth", "Enslaved"]);
  });

  it("matches the named entry case-insensitively", async () => {
    storeSearches(["Opeth", "Katatonia"]);
    const store = await loadStore();

    store.removeSearch("kAtAtOnIa");

    expect(store.getSnapshot()).toEqual(["Opeth"]);
  });

  it("leaves the list and storage untouched when the artist is absent", async () => {
    storeSearches(["Opeth"]);
    const store = await loadStore();
    const listBefore = store.getSnapshot();
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    store.removeSearch("Nobody At All");

    expect(store.getSnapshot()).toBe(listBefore);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("persists an empty list when the last entry goes, so it stays removed", async () => {
    storeSearches(["Opeth"]);
    const store = await loadStore();

    store.removeSearch("Opeth");

    expect(readPersistedSearches()).toEqual([]);
  });
});

describe("reading a tampered or unusable stored value", () => {
  it("reads malformed JSON as an empty list instead of throwing", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual([]);
  });

  it("reads a stored value that is not an array as an empty list", async () => {
    storeSearches({ artist: "Opeth" });

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual([]);
  });

  it("keeps only the usable names from an array holding non-strings and blanks", async () => {
    storeSearches(["Opeth", 42, null, "   ", "Katatonia"]);

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual(["Opeth", "Katatonia"]);
  });

  it("reads an array holding nothing usable as an empty list", async () => {
    storeSearches([42, "", "   ", null]);

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual([]);
  });

  it("collapses duplicates held in the stored array to one entry", async () => {
    storeSearches(["Opeth", "opeth", "Katatonia"]);

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual(["Opeth", "Katatonia"]);
  });

  it("truncates a stored array longer than ten entries", async () => {
    storeSearches(buildArtistNames(14));

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual(buildArtistNames(10));
  });

  it("reads an empty list when storage is blocked and getItem throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage is blocked.");
    });

    const store = await loadStore();

    expect(store.getSnapshot()).toEqual([]);
  });

  it("still updates the snapshot and notifies when setItem throws on quota", async () => {
    const store = await loadStore();
    const listener = vi.fn();
    store.subscribe(listener);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded.");
    });

    store.addSearch("Opeth");

    expect(store.getSnapshot()).toEqual(["Opeth"]);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("getServerSnapshot", () => {
  it("returns an empty list even when the device holds a trail", async () => {
    storeSearches(["Opeth"]);
    const store = await loadStore();

    expect(store.getServerSnapshot()).toEqual([]);
  });

  it("returns the same reference on every call", async () => {
    const store = await loadStore();

    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
  });
});
