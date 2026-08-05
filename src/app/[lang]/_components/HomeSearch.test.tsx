import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ArtistLookupResult } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { HomeSearch } from "./HomeSearch";

function renderHomeSearch() {
  return render(
    <LocaleProvider locale="en" dictionary={en}>
      <HomeSearch />
    </LocaleProvider>,
  );
}

/**
 * A `next/navigation` stand-in that really navigates: `push` rewrites the
 * query string and notifies subscribers, so components re-render the way they
 * would in the app.
 */
const navigation = vi.hoisted(() => {
  let search = "";
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  return {
    push: vi.fn((url: string) => {
      const start = url.indexOf("?");
      search = start === -1 ? "" : url.slice(start + 1);
      emit();
    }),
    start: (initialSearch: string) => {
      search = initialSearch;
      emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read: () => search,
  };
});

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useRouter: () => ({ push: navigation.push }),
    usePathname: () => "/en",
    useSearchParams: () =>
      new URLSearchParams(
        useSyncExternalStore(navigation.subscribe, navigation.read, navigation.read),
      ),
  };
});

function makeResult(name: string): ArtistLookupResult {
  return {
    artist: { name, listeners: 100, tags: [], imageUrl: null, url: `https://last.fm/${name}` },
    topTrack: null,
    topAlbum: null,
    similarArtists: [{ name: "Muse", imageUrl: null, url: "https://last.fm/muse" }],
  };
}

/** Resolves an artist result whose name echoes the `q` query parameter. */
function stubArtistApi() {
  const fetchMock = vi.fn(async (url: string) => {
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return { ok: true, json: async () => makeResult(query) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const scrollIntoView = vi.fn();

beforeEach(() => {
  navigation.push.mockClear();
  navigation.start("");
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HomeSearch", () => {
  it("shows the empty state and searches nothing without a query", () => {
    const fetchMock = stubArtistApi();

    renderHomeSearch();

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("puts the searched artist in the URL, keeping the locale prefix", async () => {
    stubArtistApi();
    renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(navigation.push).toHaveBeenCalledWith("/en?q=radiohead", { scroll: false });
  });

  it("runs the search from the URL, so a shared link resolves", async () => {
    stubArtistApi();
    navigation.start("q=Portishead");

    renderHomeSearch();

    expect(await screen.findByRole("heading", { name: "Portishead" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Portishead");
  });

  it("follows a similar artist and shows the new answer", async () => {
    const fetchMock = stubArtistApi();
    navigation.start("q=radiohead");
    renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    expect(await screen.findByRole("heading", { name: "Muse" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Muse");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/artist?q=Muse");
  });

  it("lands the reader on the new answer by scrolling and moving focus", async () => {
    stubArtistApi();
    renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("heading", { name: "radiohead" });

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(screen.getByLabelText("Results for radiohead")).toHaveFocus();
  });

  it("jumps without animating when the reader prefers reduced motion", async () => {
    stubArtistApi();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
    renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("heading", { name: "radiohead" });

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("leaves the reader's scroll alone when they arrive on a shared link", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");

    renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("keeps the outgoing answer on screen, dimmed, while the next one loads", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");
    renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    // The next lookup never settles, so the loading state stays observable.
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    const outgoing = await screen.findByLabelText("Results for radiohead");
    expect(outgoing).toHaveAttribute("data-stale", "true");
    expect(outgoing).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByLabelText("Loading results")).not.toBeInTheDocument();
  });

  it("shows the skeleton only for the first search, when there is nothing to hold", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(await screen.findByLabelText("Loading results")).toBeInTheDocument();
  });
});
