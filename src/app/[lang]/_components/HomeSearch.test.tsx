import type { MouseEvent, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ArtistLookupResult } from "@/lib/music/types";
import en from "@/lib/i18n/dictionaries/en.json";

const STORAGE_KEY = "top-tracks-recent-searches";

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

/**
 * `next/link` needs an app-router context jsdom cannot give it, so it routes
 * through the same navigation stand-in — a recent-searches entry then really
 * moves the URL, exactly as it does in the app.
 */
vi.mock("next/link", () => ({
  default: function LinkStandIn(props: {
    href: string;
    children: ReactNode;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  }) {
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
      props.onClick?.(event);
      navigation.push(props.href);
    }

    return (
      <a href={props.href} onClick={handleClick}>
        {props.children}
      </a>
    );
  },
}));

/**
 * The recent-searches store caches its snapshot at module scope, so the screen
 * is re-imported per test — otherwise one test's trail would leak into the next.
 */
async function renderHomeSearch() {
  vi.resetModules();
  // The provider comes from the same fresh graph as the screen, so both sides
  // of the locale context are the one module instance.
  const [{ HomeSearch }, { LocaleProvider }] = await Promise.all([
    import("./HomeSearch"),
    import("@/lib/i18n/LocaleProvider"),
  ]);

  return render(
    <LocaleProvider locale="en" dictionary={en}>
      <HomeSearch />
    </LocaleProvider>,
  );
}

function seedRecentSearches(artistNames: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(artistNames));
}

function queryRecentSection() {
  return screen.queryByRole("region", { name: en.recent.heading });
}

function readRecentEntries() {
  const section = screen.getByRole("region", { name: en.recent.heading });
  return within(section)
    .getAllByRole("link")
    .map((entry) => entry.textContent);
}

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

/** Answers every lookup with one canonical spelling, whatever was typed. */
function stubArtistApiReturning(canonicalName: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => makeResult(canonicalName) })),
  );
}

function stubArtistApiNotFound() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => ({ code: "not-found" }) })),
  );
}

const scrollIntoView = vi.fn();

beforeEach(() => {
  navigation.push.mockClear();
  navigation.start("");
  window.localStorage.clear();
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
  it("shows the empty state and searches nothing without a query", async () => {
    const fetchMock = stubArtistApi();

    await renderHomeSearch();

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("puts the searched artist in the URL, keeping the locale prefix", async () => {
    stubArtistApi();
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(navigation.push).toHaveBeenCalledWith("/en?q=radiohead", { scroll: false });
  });

  it("runs the search from the URL, so a shared link resolves", async () => {
    stubArtistApi();
    navigation.start("q=Portishead");

    await renderHomeSearch();

    expect(await screen.findByRole("heading", { name: "Portishead" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Portishead");
  });

  it("follows a similar artist and shows the new answer", async () => {
    const fetchMock = stubArtistApi();
    navigation.start("q=radiohead");
    await renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    expect(await screen.findByRole("heading", { name: "Muse" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Muse");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/artist?q=Muse");
  });

  it("lands the reader on the new answer by scrolling and moving focus", async () => {
    stubArtistApi();
    await renderHomeSearch();

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
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("heading", { name: "radiohead" });

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("leaves the reader's scroll alone when they arrive on a shared link", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");

    await renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("keeps the outgoing answer on screen, dimmed, while the next one loads", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");
    await renderHomeSearch();
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
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    expect(await screen.findByLabelText("Loading results")).toBeInTheDocument();
  });
});

describe("HomeSearch recording recent searches", () => {
  it("shows no recent-searches section to a reader with no history", async () => {
    stubArtistApi();

    await renderHomeSearch();

    expect(queryRecentSection()).not.toBeInTheDocument();
  });

  it("records the canonical artist name after a typed search succeeds", async () => {
    stubArtistApiReturning("Radiohead");
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("heading", { name: "Radiohead" });

    expect(readRecentEntries()).toEqual(["Radiohead"]);
  });

  it("records nothing when a typed search comes back not found", async () => {
    stubArtistApiNotFound();
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "nobody at all");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("alert");

    expect(queryRecentSection()).not.toBeInTheDocument();
  });

  it("records nothing when a typed search fails with a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline.")));
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "radiohead");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("alert");

    expect(queryRecentSection()).not.toBeInTheDocument();
  });

  it("records nothing when the reader follows a similar artist", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");
    await renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    await userEvent.click(screen.getByRole("button", { name: /muse/i }));
    await screen.findByRole("heading", { name: "Muse" });

    expect(queryRecentSection()).not.toBeInTheDocument();
  });

  it("records nothing when the reader arrives on a shared link", async () => {
    stubArtistApi();
    navigation.start("q=radiohead");

    await renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });

    expect(queryRecentSection()).not.toBeInTheDocument();
  });

  it("records a re-typed search for the artist already on screen", async () => {
    stubArtistApi();
    navigation.start("q=Opeth");
    await renderHomeSearch();
    await screen.findByRole("heading", { name: "Opeth" });

    await userEvent.click(screen.getByRole("button", { name: /discover/i }));

    await waitFor(() => expect(readRecentEntries()).toEqual(["Opeth"]));
  });

  it("moves an artist already listed to the top instead of listing it twice", async () => {
    stubArtistApi();
    seedRecentSearches(["Katatonia", "Opeth"]);
    await renderHomeSearch();

    await userEvent.type(screen.getByRole("searchbox"), "Opeth");
    await userEvent.click(screen.getByRole("button", { name: /discover/i }));
    await screen.findByRole("heading", { name: "Opeth" });

    expect(readRecentEntries()).toEqual(["Opeth", "Katatonia"]);
  });

  it("renders the screen normally, with no section, when localStorage throws", async () => {
    stubArtistApi();
    seedRecentSearches(["Opeth"]);
    // Blocked storage, as in private browsing: the trail is simply unreadable,
    // and the screen falls back to the behavior it had before this feature.
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage is blocked.");
    });
    navigation.start("q=radiohead");

    await renderHomeSearch();

    expect(await screen.findByRole("heading", { name: "radiohead" })).toBeInTheDocument();
    expect(queryRecentSection()).not.toBeInTheDocument();
  });
});

describe("HomeSearch acting on a recent search", () => {
  it("re-runs the search, fills the input, and shows that artist's result", async () => {
    stubArtistApi();
    seedRecentSearches(["Katatonia"]);
    await renderHomeSearch();

    await userEvent.click(screen.getByRole("link", { name: "Katatonia" }));

    expect(navigation.push).toHaveBeenCalledWith("/en?q=Katatonia");
    expect(await screen.findByRole("heading", { name: "Katatonia" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Katatonia");
  });

  it("moves the activated entry to the top without adding a new one", async () => {
    stubArtistApi();
    seedRecentSearches(["Opeth", "Katatonia"]);
    await renderHomeSearch();

    await userEvent.click(screen.getByRole("link", { name: "Katatonia" }));
    await screen.findByRole("heading", { name: "Katatonia" });

    expect(readRecentEntries()).toEqual(["Katatonia", "Opeth"]);
  });

  it("lands the reader on the answer, scrolling to it and moving focus", async () => {
    stubArtistApi();
    seedRecentSearches(["Katatonia"]);
    await renderHomeSearch();

    await userEvent.click(screen.getByRole("link", { name: "Katatonia" }));
    await screen.findByRole("heading", { name: "Katatonia" });

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(screen.getByLabelText("Results for Katatonia")).toHaveFocus();
  });

  it("removes an entry without touching the answer on screen or the URL", async () => {
    stubArtistApi();
    seedRecentSearches(["Opeth", "Katatonia"]);
    navigation.start("q=radiohead");
    await renderHomeSearch();
    await screen.findByRole("heading", { name: "radiohead" });
    navigation.push.mockClear();

    await userEvent.click(screen.getByRole("button", { name: /^Remove Opeth/ }));

    expect(readRecentEntries()).toEqual(["Katatonia"]);
    expect(screen.getByRole("heading", { name: "radiohead" })).toBeInTheDocument();
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("drops the whole section once the last entry is removed", async () => {
    stubArtistApi();
    seedRecentSearches(["Opeth"]);
    await renderHomeSearch();

    await userEvent.click(screen.getByRole("button", { name: /^Remove Opeth/ }));

    expect(queryRecentSection()).not.toBeInTheDocument();
  });
});

describe("HomeSearch keeping the trail on every state", () => {
  it("keeps the section on screen in the idle state", async () => {
    stubArtistApi();
    seedRecentSearches(["Opeth"]);

    await renderHomeSearch();

    expect(queryRecentSection()).toBeInTheDocument();
  });

  it("keeps the section on screen while a search is loading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    seedRecentSearches(["Opeth"]);
    navigation.start("q=radiohead");

    await renderHomeSearch();

    expect(await screen.findByLabelText("Loading results")).toBeInTheDocument();
    expect(queryRecentSection()).toBeInTheDocument();
  });

  it("keeps the section on screen alongside a not-found answer", async () => {
    stubArtistApiNotFound();
    seedRecentSearches(["Opeth"]);
    navigation.start("q=nobody at all");

    await renderHomeSearch();
    await screen.findByRole("alert");

    expect(queryRecentSection()).toBeInTheDocument();
  });

  it("keeps the section on screen alongside a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline.")));
    seedRecentSearches(["Opeth"]);
    navigation.start("q=radiohead");

    await renderHomeSearch();
    await screen.findByRole("alert");

    expect(queryRecentSection()).toBeInTheDocument();
  });
});
