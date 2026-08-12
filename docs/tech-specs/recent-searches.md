---
feature: recent-searches
prd: docs/prds/recent-searches.md
status: approved
created: 2026-08-12
---

# Tech spec: Recent searches

## Overview

The PRD asks for a persistent, user-controlled trail of the artists a reader
looked up: at most ten entries, most recent first, visible under the results on
every state of the search screen, each one a link back to that artist and each
one removable. Only searches the reader typed and that resolved are recorded,
under the canonical name the API returned, never duplicated.

The solution is three pieces and no new dependency. A module-level store
(`recentSearchesStore.ts`) owns the list and its `localStorage` mirror, exposing
the `subscribe`/`getSnapshot`/`getServerSnapshot` triple that
`useSyncExternalStore` wants — which is what lets the list be correct in its
very first client paint without a hydration mismatch. A single hook,
`useRecentSearches(status, result)`, binds that store to the search screen and
carries the "the reader typed this" intent from submit through to the settled
answer, so recording happens on the result (where the canonical name lives) but
only for typed searches. Two presentational components render the section, and
`HomeSearch` wires them into the existing `?q=` navigation it already owns. No
API, route, or schema changes; nothing leaves the device.

## Current state

- `src/app/[lang]/page.tsx` is a server component: `SiteHeader`, a
  `Suspense`-wrapped client `HomeSearch` (fallback `HomeSearchFallback`), and
  `PageFooter`. The `[lang]` layout declares `generateStaticParams()` for both
  locales, so the route is prerendered.
- `src/app/[lang]/_components/HomeSearch.tsx` is the client screen. It treats
  `?q=` as the source of truth, mirrors it into the input during render, and
  navigates with `router.push(`${pathname}?q=…`, { scroll: false })`. It has
  exactly **one** navigation handler today, `goToArtist`, shared by the typed
  submit (`HeroSection.onSearch`) and the similar-artist hop
  (`SearchStatus.onSelectArtist`) — so nothing currently distinguishes the two.
- The same component already solves the shape of the recording problem for a
  different purpose: `revealPendingRef` is a ref armed at navigation time and
  consumed by an effect when the lookup settles, so that only a search the
  reader asked for scrolls and moves focus. The recording flag is a sibling of
  that ref, deliberately.
- `src/app/[lang]/_hooks/useArtistSearch.ts` exposes
  `{ status, result, errorCode }` with `status` in `idle | loading | success |
  error`. `result.artist.name` is the canonical Last.fm name — the value the
  PRD wants displayed. Not-found arrives as `status: "error"` with
  `errorCode: "not-found"`, so "found" and "not found" are already
  distinguishable.
- `src/app/[lang]/_components/SearchStatus.tsx` routes idle/loading/error/
  results inside `<main className="wrap">`. The recent list is a sibling of it,
  not one of its branches: the PRD requires the list on *every* one of those
  states.
- `src/components/ArtistResults/SimilarArtistCard.tsx` is a `<button>` calling
  `onSelect(name)` — the discovery hop. Recent entries are `<a>` instead (PRD
  R2 wants a real URL), which also keeps the two apart in role-based locators.
- i18n: `useTranslation()` returns `{ dictionary, locale }`; the `Dictionary`
  type is `typeof en`, so a key added to `en.json` and missing from
  `pt-BR.json` is a compile-time error. `formatMessage(template, values)`
  interpolates `{placeholder}`.
- Styling is plain CSS in `src/app/globals.css` with semantic class names
  (`.sec-head`, `.tag`, `.sim`, `.sr-only`) over the dark token set (`--surface`,
  `--border`, `--muted`, `--faint`, `--accent`). A global `:focus-visible`
  outline already covers the accessibility baseline for new controls.
- There is no `localStorage` usage anywhere in the project today, and no
  storage utility. The only persisted client state is the `top-tracks-locale`
  cookie, written by `LanguageSwitcher` and read by `src/proxy.ts`.
- Tests: `HomeSearch.test.tsx` already ships a `next/navigation` stand-in whose
  `push` really rewrites the query string and notifies subscribers via
  `useSyncExternalStore` — the recent-searches cases reuse it as-is. E2E specs
  mock `/api/artist` through `e2e/support/mockArtistApi.ts` and locate by role
  through `e2e/support/homePage.ts`.

## Proposed solution

### The store

`src/app/[lang]/_hooks/recentSearchesStore.ts` is a module-level store — not a
hook, but co-located with the hook that owns it, since nothing else in the
project reads it (`folder-structure` rule 5).

```ts
const STORAGE_KEY = "top-tracks-recent-searches"; // matches the top-tracks-locale cookie's naming
const MAX_ENTRIES = 10;

export function subscribe(listener: () => void): () => void;
export function getSnapshot(): readonly string[];
export function getServerSnapshot(): readonly string[];
export function addSearch(artistName: string): void;
export function removeSearch(artistName: string): void;
```

**Snapshot identity.** `getSnapshot` returns a cached array, read from storage
lazily on first call and replaced only by a mutation. Returning a fresh array
per call would loop `useSyncExternalStore` forever, so this is load-bearing, not
an optimization. `getServerSnapshot` returns one shared frozen empty array: on
the server there is no device to read.

**Validation on read.** Stored data is user-controlled input (PRD technical
considerations), so `readStoredSearches()` trusts nothing: a value that is
absent, unparsable, or not an array yields `[]`; inside an array, non-string and
blank members are dropped, survivors are trimmed, deduplicated
case-insensitively keeping the first occurrence, and truncated to `MAX_ENTRIES`.
A hand-edited key can therefore shorten the list but never break the screen.

**Storage failures.** Every `localStorage` call sits in `try/catch`. A throwing
`getItem` (blocked storage in private browsing) reads as an empty list, so the
section simply never appears — today's behavior. A throwing `setItem` (quota)
still updates the in-memory snapshot and notifies, so the list behaves normally
for the rest of the session and is simply not there next time. Neither surfaces
an error to the reader.

**Mutations.** `addSearch(name)` builds
`[name, ...current.filter(notSameArtist)]` truncated to `MAX_ENTRIES`, where
`notSameArtist` compares `trim().toLowerCase()` — so `radiohead`, `Radiohead `
and `Radiohead` are one entry (PRD R3), and re-searching an existing artist
reorders instead of appending. It doubles as the promote operation: activating
an entry calls the same function. If the resulting order is identical to the
current one (re-adding what is already first), the store neither writes nor
notifies, so no render is wasted. `removeSearch(name)` filters by the same
comparison.

**No cross-tab sync** (interview decision, 2026-08-12): `subscribe` notifies on
this tab's own mutations only. Wiring the `window` `storage` event is nearly
free with this shape, but the PRD asks for no sync, and a list reordering itself
because of a search in another tab is a surprise, not a feature.

### The hook

`src/app/[lang]/_hooks/useRecentSearches.ts` binds the store to one search
screen and owns the typed-intent problem the PRD flagged:

```ts
export function useRecentSearches(
  status: ArtistSearchStatus,
  result: ArtistLookupResult | null,
): RecentSearches; // { entries, markTyped, openEntry, removeEntry }
```

- `entries` comes from
  `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`.
- `markTyped(isTyped: boolean)` writes a ref. `HomeSearch` calls it `true` on a
  typed submit and `false` on every other navigation.
- An effect on `[status, result]` reads that ref once the lookup settles: it
  returns early while `status === "loading"`, otherwise clears the ref and, on
  `status === "success"` with a result, calls `addSearch(result.artist.name)`.
  This is why a not-found, an API error, a network error, a similar-artist hop,
  a shared URL, and a back/forward step all record nothing (PRD R3) — the flag
  is only ever armed by the search form, and it is consumed whatever the
  outcome.
- `openEntry(name)` promotes the entry immediately via `addSearch` and clears
  the typed mark (a click landing mid-flight of a typed search must not steal
  its recording). Promotion on activation rather than on settle is an interview
  decision (2026-08-12): the reorder is instant, and a stale entry that no
  longer resolves is accepted by the PRD's risk section.
- `removeEntry(name)` delegates to `removeSearch`.

The store functions are module-level and stable, so nothing needs `useCallback`.

### First paint and hydration

The list is client-only state, and the PRD asks the spec to say how the first
paint avoids a mismatch or a flash. Two facts settle it:

1. In production the whole `HomeSearch` subtree is client-rendered. The route is
   prerendered, and `useSearchParams` in a prerendered route bails the client
   tree up to the nearest `Suspense` boundary out of the server render — the
   HTML ships `HomeSearchFallback` instead. So the server never emits recent
   searches markup, and `useSyncExternalStore` returns the real client snapshot
   on the very first render: the list paints in the same frame as the rest of
   the search UI, with no pop-in of its own.
2. In development (and in any dynamically rendered request) `HomeSearch` does
   render on the server. There `getServerSnapshot` returns the empty array,
   React hydrates against that identical empty render, and then re-renders once
   with the client snapshot. That is the documented, warning-free path — no
   hydration error, and the correction happens before the reader can act.

A `useEffect`-based read was rejected for always costing a pop-in tick, and the
inline-script technique from Next's *preventing flash before hydration* guide
for being pointless against a subtree that is already client-rendered
(interview decision, 2026-08-12).

### Rendering

`src/app/[lang]/_components/RecentSearches.tsx` (client, presentational):
props `entries`, `pathname`, `onSelect`, `onRemove`. It returns `null` when
`entries` is empty — no shell, no placeholder (PRD R1/R4). Otherwise it renders
`<section className="recent" aria-labelledby={headingId}>` with a `useId`-backed
`<h2>` carrying `dictionary.recent.heading`, wrapping a `<ul>` of items. `<h2>`
is the right rank: `<h1>` is the hero, and the result's own headings live inside
the results region above.

`src/app/[lang]/_components/RecentSearchItem.tsx` (client, presentational):
props `artistName`, `href`, `onSelect`, `onRemove`. It renders two sibling
controls — never nested, which would be an invalid and unusable accessible
name:

- a `next/link` whose text is the artist name and whose `href` is
  `${pathname}?q=${encodeURIComponent(artistName)}`, with `scroll={false}` (the
  screen manages the reveal itself) and `prefetch={false}` (the answer is
  fetched client-side from `/api/artist`, so prefetching the route payload buys
  nothing for ten links);
- a `<button type="button">` labelled
  `formatMessage(dictionary.recent.removeLabel, { artist: artistName })` —
  "Remove Radiohead from recent searches" — with its glyph `aria-hidden`.

Both are ordinary focusable elements picking up the global `:focus-visible`
outline (PRD R2/R4 keyboard criteria).

### Wiring in `HomeSearch`

`goToArtist` gains an origin so the two existing callers stop being
indistinguishable, and the section is rendered inside `<main>` below
`SearchStatus` (interview decision, 2026-08-12) — part of the main content,
after the answer in both reading and tab order:

```tsx
const { entries, markTyped, openEntry, removeEntry } = useRecentSearches(status, result);

function goToArtist(name: string, origin: SearchOrigin = "followed") {
  markTyped(origin === "typed");
  revealPendingRef.current = true;
  router.push(`${pathname}?q=${encodeURIComponent(name)}`, { scroll: false });
}

function searchArtist(name: string) { goToArtist(name, "typed"); }   // HeroSection.onSearch
function followArtist(name: string) { goToArtist(name, "followed"); } // SearchStatus.onSelectArtist

function openRecentSearch(name: string) {
  openEntry(name);                  // promote; the Link performs the navigation
  revealPendingRef.current = true;  // land the reader on the answer, as a typed search does
}

<main className="wrap">
  <SearchStatus … />
  <RecentSearches
    entries={entries}
    pathname={pathname}
    onSelect={openRecentSearch}
    onRemove={removeEntry}
  />
</main>
```

Activating an entry therefore behaves exactly like typing the name: the URL
moves (shareable, and back still walks the discovery path), the input follows
the URL through the existing render-time sync, and the existing reveal effect
scrolls and focuses the result, honoring `prefers-reduced-motion` (interview
decision, 2026-08-12). Removing an entry calls no navigation at all, so the
answer on screen is untouched (PRD R4).

**One edge the ref alone cannot catch.** Re-typing the artist already on screen
pushes the identical URL: nothing re-renders, so the settle effect never runs
and the search would go unrecorded, against PRD R3. `searchArtist` handles it
explicitly — when the current `status` is `success` and the submitted name
matches the live `query` case-insensitively, it records
`result.artist.name` on the spot instead of arming the ref.

### i18n

Two keys in both dictionaries, under a new `recent` group:

| Key | `en` | `pt-BR` |
| --- | ---- | ------- |
| `recent.heading` | `Recent searches` | `Buscas recentes` |
| `recent.removeLabel` | `Remove {artist} from recent searches` | `Remover {artist} das buscas recentes` |

The artist names themselves are API data and stay untranslated, as everywhere
else in the app.

### Styling

New rules in `src/app/globals.css`, on the existing tokens: `.recent` (top
margin matching `.similar`, a `--border` hairline above it), reusing the
`.sec-head` heading treatment; `.recent-list` as a wrapping flex row of
`.recent-item` chips built from `--surface` / `--border` like `.sim`, at the
smaller, `--muted` scale of `.tag` so the section reads as secondary and never
competes with the top track (PRD R1 and the "answer first" principle);
`.recent-item button` as a small `--faint` glyph that gains `--fg` on hover and
focus. No new animation, so `prefers-reduced-motion` needs no new handling.

## Affected files

| File | Change | Purpose |
| ---- | ------ | ------- |
| `src/app/[lang]/_hooks/recentSearchesStore.ts` | create | List + `localStorage` mirror, validation, dedupe, cap, subscriptions |
| `src/app/[lang]/_hooks/recentSearchesStore.test.ts` | create | Unit tests for the store, including every storage-failure branch |
| `src/app/[lang]/_hooks/useRecentSearches.ts` | create | Binds the store to the screen; typed-intent recording on settle |
| `src/app/[lang]/_hooks/useRecentSearches.test.ts` | create | Unit tests for the hook |
| `src/app/[lang]/_components/RecentSearches.tsx` | create | The section: heading + list, `null` when empty |
| `src/app/[lang]/_components/RecentSearches.test.tsx` | create | Unit tests for the section |
| `src/app/[lang]/_components/RecentSearchItem.tsx` | create | One entry: link + remove control |
| `src/app/[lang]/_components/RecentSearchItem.test.tsx` | create | Unit tests for the entry |
| `src/app/[lang]/_components/HomeSearch.tsx` | modify | Origin-aware navigation, renders the section, promotes + reveals on activation |
| `src/app/[lang]/_components/HomeSearch.test.tsx` | modify | Recording rules and the entry round trip on the real screen |
| `src/lib/i18n/dictionaries/en.json` | modify | `recent.heading`, `recent.removeLabel` |
| `src/lib/i18n/dictionaries/pt-BR.json` | modify | Portuguese counterparts |
| `src/app/globals.css` | modify | `.recent`, `.recent-list`, `.recent-item` styles |
| `e2e/recentSearches.spec.ts` | create | The returning-reader journey |
| `e2e/support/homePage.ts` | modify | `getRecentSearches`, `getRecentSearchLink`, `getRemoveRecentSearchButton` locators |

`vitest.setup.ts` needs no change: jsdom provides a working `localStorage`, and
the failure branches are exercised by stubbing its methods per test.

## Third-party libraries

None beyond the existing stack. The Context7 MCP tools are not available in this
environment, so every Next.js and React API below was verified against the
bundled docs in `node_modules/next/dist/docs/` (Next 16.2.10, React 19.2.4):

- **`useSearchParams` prerendering** — "If a route is prerendered, calling
  `useSearchParams` will cause the Client Component tree up to the closest
  `Suspense` boundary to be client-side rendered"
  (`01-app/03-api-reference/04-functions/use-search-params.md`). This is the
  fact the first-paint argument rests on; the existing `HomeSearchFallback` is
  what the prerender ships instead.
- **`next/link`** — `scroll={false}` stops Next managing scroll on navigation,
  and `prefetch={false}` opts a link out of viewport prefetching
  (`01-app/03-api-reference/02-components/link.md`).
- **Client-only state before hydration** — Next's own guide
  (`01-app/02-guides/preventing-flash-before-hydration.md`) frames the three
  options (hydration error, `useEffect` flash, inline script) and confirms
  `useEffect` "runs after hydration and paint", which is why the store-based
  read was preferred here.
- **`useSyncExternalStore`** — React 19's subscription primitive; the
  `getServerSnapshot` argument is what keeps server and hydration renders
  agreeing. The project already depends on its cached-snapshot contract: the
  `next/navigation` test double in `HomeSearch.test.tsx` uses the same hook.

## Testing approach

### Unit tests (Vitest + Testing Library)

#### `src/app/[lang]/_hooks/recentSearchesStore.test.ts`

- `getSnapshot` returns an empty list when storage holds nothing for the key
- `getSnapshot` returns a previously stored list in its stored order
- `getSnapshot` returns the same array reference across calls when nothing
  changed (the identity `useSyncExternalStore` depends on)
- `addSearch` puts a new artist first and persists the list under
  `top-tracks-recent-searches`
- `addSearch` notifies every subscriber, and an unsubscribed listener stops
  being called
- `addSearch` of an artist already listed moves it first without duplicating it
- `addSearch` matches artists case-insensitively and ignoring surrounding
  whitespace (`"radiohead"`, `"Radiohead "` and `"Radiohead"` are one entry)
- `addSearch` keeps the most recently recorded spelling of a repeated artist
- `addSearch` of the artist already first neither writes to storage nor
  notifies subscribers
- an eleventh `addSearch` drops the oldest entry, leaving exactly ten
- `removeSearch` drops only the named entry and preserves the order of the rest
- `removeSearch` matches case-insensitively
- `removeSearch` of an absent artist leaves the list and storage untouched
- `removeSearch` of the last entry persists an empty list, so it stays removed
- malformed JSON in storage reads as an empty list instead of throwing
- a stored value that parses but is not an array reads as an empty list
- a stored array containing non-strings and blanks keeps only the usable names
- a stored array holding duplicates collapses them to one entry
- a stored array longer than ten entries is truncated to ten on read
- a throwing `localStorage.getItem` (blocked storage) reads as an empty list
- a throwing `localStorage.setItem` (quota) still updates the snapshot and
  notifies subscribers
- `getServerSnapshot` returns an empty list and the same reference every call

#### `src/app/[lang]/_hooks/useRecentSearches.test.ts`

- `entries` reflects the stored list on first render, with no effect tick needed
- `entries` re-renders with the new order after `openEntry`
- a settled `success` after `markTyped(true)` records the result's canonical
  artist name, not the text that was typed
- a settled `error` (not-found) after `markTyped(true)` records nothing
- a settled `success` without `markTyped(true)` records nothing
- the typed mark is consumed once: a second settle without re-marking records
  nothing
- a `loading` status after `markTyped(true)` records nothing yet
- `markTyped(false)` disarms a mark set earlier in the same navigation
- `openEntry` promotes the artist to the front of the list
- `openEntry` clears the typed mark, so a settle it races does not record
- `removeEntry` drops the artist from the list
- the hook renders an empty list, without throwing, when storage is unavailable

#### `src/app/[lang]/_components/RecentSearches.test.tsx`

- renders one link per entry, in the order received
- renders the localized "Recent searches" heading, naming the section region
- renders nothing at all when `entries` is empty — no heading, no list, no shell
- each entry links to `${pathname}?q=<artist>`, URL-encoding names with spaces
  and punctuation
- renders the Portuguese heading under the `pt-BR` dictionary
- clicking an entry calls `onSelect` with that artist's name
- clicking an entry's remove control calls `onRemove` with that artist's name
  and does not call `onSelect`
- every entry link and remove control is reachable by keyboard in DOM order

#### `src/app/[lang]/_components/RecentSearchItem.test.tsx`

- renders the artist name as the link's accessible name
- the remove control is a button labelled "Remove {artist} from recent
  searches", localized in both dictionaries
- the remove control's glyph is hidden from assistive technology, so the label
  is the whole accessible name
- the link and the button are siblings, both individually focusable — neither
  nests inside the other
- activating the remove control with the keyboard calls `onRemove`

#### `src/app/[lang]/_components/HomeSearch.test.tsx` (added cases)

- a reader with no history sees no recent-searches section
- a typed search that succeeds adds the canonical artist name to the section
- a typed search that returns not-found adds nothing
- a typed search that fails with a network error adds nothing
- following a similar-artist tile adds nothing, though it resolves
- arriving on a shared `?q=` URL adds nothing
- re-typing the artist already on screen still records it (the identical-URL
  edge)
- searching an artist already listed moves it to the top without a second entry
- activating an entry navigates to `${pathname}?q=<artist>`, puts the name in
  the input, and shows that artist's result
- activating an entry moves it to the top and adds no new entry
- activating an entry lands the reader on the answer: the results region scrolls
  into view and takes focus
- removing an entry drops it from the section and leaves the current result and
  the URL untouched
- removing the last entry makes the whole section disappear
- the section stays on screen through the idle, loading, not-found, and error
  states
- the screen renders normally, with no section, when `localStorage` throws

### E2E tests (Playwright)

#### `e2e/recentSearches.spec.ts`

- a first visit shows no recent-searches section
- searching an artist lists it under "Recent searches", under the canonical
  name the API returned even when typed in lowercase
- the trail survives a reload, and survives a new browser context restoring the
  same storage state (the across-sessions promise)
- following a similar artist does not add it to the trail, though its result is
  on screen
- activating an entry re-runs the search, updates the URL, fills the input, and
  shows that artist's result
- activating an entry moves it to the top of the trail without duplicating it
- searching eleven artists leaves exactly ten entries, newest first, the first
  one gone
- removing an entry leaves the rest in order and leaves the result on screen
  unchanged, and it is still gone after a reload
- removing the last entry removes the whole section
- the trail is visible alongside a not-found answer, and that failed search is
  not in it
- the trail is reachable and operable from the keyboard alone: tab to an entry,
  Enter re-runs the search, and the answer takes focus

#### `e2e/accessibility.spec.ts` (added case)

- with a populated trail, the entry links and remove controls are reachable by
  keyboard with a visible focus state, on both locale paths

### Coverage expectation

`recentSearchesStore.ts` is the branchiest new module — validation, dedupe, cap,
and three storage-failure paths — and every one of those branches has a case
above, so it lands at ~100%. `useRecentSearches.ts` is fully covered by its
twelve cases, including each arm of the settle effect. `RecentSearches.tsx` and
`RecentSearchItem.tsx` are small and presentational, with their empty branch,
both locales, and both handlers exercised. The `HomeSearch.tsx` additions —
origin-aware navigation, the identical-URL edge, promotion, removal — are
covered by the fifteen added screen cases on top of the existing suite. Nothing
in this feature is intentionally uncovered; the new CSS and dictionary JSON
carry no runtime. Overall project coverage stays above 80%.

## Rollout & risks

Single PR, no flag. The feature is additive and invisible until the reader's
first successful search, and it changes no server behavior, no API contract, and
no URL scheme — every entry navigates to a `?q=` URL the app already serves.

Risks and how they are handled:

- **Storage unavailable or full.** The most likely production failure and the
  one furthest from a developer's machine. Contained in the store's `try/catch`
  boundaries and pinned by three unit cases plus a screen case; the worst
  outcome is that the section never appears.
- **Recording the wrong things.** The intent ref is the load-bearing piece of R3
  — arm it in the wrong place and shared links or back-navigation start writing
  history. It is armed in exactly one handler, disarmed in every other, consumed
  on any settle, and covered from both sides (five screen cases asserting
  nothing is recorded).
- **Hydration.** If the route ever stops being prerendered, the dev-mode path
  described above becomes the production path: `getServerSnapshot` keeps that
  correct, at the cost of one extra render. Nothing to change if it happens.
- **Screen real estate.** The PRD's own risk. Mitigated by placement and
  styling, and reviewable in the results state — not only the empty one — since
  the section renders on every status.
- **Privacy on shared devices.** Per-entry removal is the only exit; clear-all
  stays a follow-up per the PRD.

No migration and no cleanup: the `top-tracks-recent-searches` key is new, and
removing the feature would mean deleting it — worth a line in the PR
description.

## Open questions

None. The five decisions the PRD left open were settled in the interview on
2026-08-12: a pending ref in `HomeSearch` carries typed intent to the settled
result; `useSyncExternalStore` with an empty server snapshot handles the first
paint; the section sits inside `<main>` below the results; activating an entry
performs the same scroll-and-focus reveal as a typed search; and an entry is
promoted the moment it is activated, not when its lookup succeeds. Cross-tab
sync is deliberately out of scope.
