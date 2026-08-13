import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ArtistLookupResult } from "@/lib/music/types";
import type { ArtistSearchStatus } from "./useArtistSearch";

const STORAGE_KEY = "top-tracks-recent-searches";

interface LookupProps {
  status: ArtistSearchStatus;
  result: ArtistLookupResult | null;
}

function storeSearches(searches: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

function makeLookupResult(artistName: string): ArtistLookupResult {
  return {
    artist: {
      name: artistName,
      listeners: 100,
      tags: [],
      imageUrl: null,
      url: `https://www.last.fm/music/${artistName}`,
    },
    topTrack: null,
    topAlbum: null,
    similarArtists: [],
  };
}

/**
 * The store caches its snapshot at module scope, so each test loads a fresh
 * module instance. Every render's entries are recorded, which is what lets a
 * test tell "correct on the first render" apart from "corrected by an effect".
 */
async function renderRecentSearches(initialProps: LookupProps) {
  vi.resetModules();
  const { useRecentSearches } = await import("./useRecentSearches");
  const renderedEntries: (readonly string[])[] = [];

  const view = renderHook(
    ({ status, result }: LookupProps) => {
      const recentSearches = useRecentSearches(status, result);
      renderedEntries.push(recentSearches.entries);
      return recentSearches;
    },
    { initialProps },
  );

  return { view, renderedEntries };
}

const IDLE: LookupProps = { status: "idle", result: null };

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRecentSearches entries", () => {
  it("reflects the stored list on the very first render, with no effect tick needed", async () => {
    storeSearches(["Opeth", "Katatonia"]);

    const { renderedEntries } = await renderRecentSearches(IDLE);

    expect(renderedEntries[0]).toEqual(["Opeth", "Katatonia"]);
  });

  it("re-renders with the new order after openEntry", async () => {
    storeSearches(["Opeth", "Katatonia"]);
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.openEntry("Katatonia"));

    expect(view.result.current.entries).toEqual(["Katatonia", "Opeth"]);
  });

  it("renders an empty list, without throwing, when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage is blocked.");
    });

    const { view } = await renderRecentSearches(IDLE);

    expect(view.result.current.entries).toEqual([]);
  });
});

describe("recording a settled lookup", () => {
  it("records the canonical artist name, not the text that was typed", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    view.rerender({ status: "success", result: makeLookupResult("Radiohead") });

    expect(view.result.current.entries).toEqual(["Radiohead"]);
  });

  it("records nothing when the typed search settles as not found", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    view.rerender({ status: "error", result: null });

    expect(view.result.current.entries).toEqual([]);
  });

  it("records nothing for a lookup that was never marked as typed", async () => {
    const { view } = await renderRecentSearches(IDLE);

    view.rerender({ status: "success", result: makeLookupResult("Opeth") });

    expect(view.result.current.entries).toEqual([]);
  });

  it("consumes the typed mark once, so a second settle records nothing", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    view.rerender({ status: "success", result: makeLookupResult("Opeth") });
    view.rerender({ status: "success", result: makeLookupResult("Katatonia") });

    expect(view.result.current.entries).toEqual(["Opeth"]);
  });

  it("records nothing while the typed lookup is still loading", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    view.rerender({ status: "loading", result: null });

    expect(view.result.current.entries).toEqual([]);
  });

  it("records nothing when markTyped(false) disarms a mark set earlier", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    act(() => view.result.current.markTyped(false));
    view.rerender({ status: "success", result: makeLookupResult("Opeth") });

    expect(view.result.current.entries).toEqual([]);
  });
});

describe("operating on an entry", () => {
  it("promotes the opened artist to the front of the list", async () => {
    storeSearches(["Opeth", "Katatonia", "Enslaved"]);
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.openEntry("Enslaved"));

    expect(view.result.current.entries).toEqual(["Enslaved", "Opeth", "Katatonia"]);
  });

  it("clears the typed mark when an entry is opened, so a racing settle records nothing", async () => {
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.markTyped(true));
    act(() => view.result.current.openEntry("Katatonia"));
    view.rerender({ status: "success", result: makeLookupResult("Opeth") });

    expect(view.result.current.entries).toEqual(["Katatonia"]);
  });

  it("drops the removed artist from the list", async () => {
    storeSearches(["Opeth", "Katatonia"]);
    const { view } = await renderRecentSearches(IDLE);

    act(() => view.result.current.removeEntry("Opeth"));

    expect(view.result.current.entries).toEqual(["Katatonia"]);
  });
});
