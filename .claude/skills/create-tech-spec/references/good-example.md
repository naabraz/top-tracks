<!--
An exemplary tech spec for the fictional "recent searches" feature (see the
create-prd skill's good-example.md for its PRD). Note what makes it good:
every section from TEMPLATE.md is present in order, "Current state" cites
real paths from exploration, third-party behavior was verified rather than
assumed, the testing approach enumerates cases a developer can type out
directly, and unresolved points live in "Open questions".
-->

---
feature: recent-searches
prd: docs/prds/recent-searches.md
status: draft
created: 2026-07-22
---

# Tech spec: Recent searches

## Overview

The PRD asks for a "Recent searches" list on the home screen: the last five
searched artists, most recent first, tappable to re-run the search, with a
clear-all action, persisted locally. The solution is a `useRecentSearches`
hook that owns a `localStorage`-backed list, a presentational
`RecentSearches` component rendered by the home screen, and a write into the
list at the moment a search succeeds. No API, route, or schema changes.

## Current state

- `src/app/page.tsx` renders the home screen: a `SearchBar` and, after a
  search, the results. There is no content before the first search.
- `src/components/SearchBar/SearchBar.tsx` owns the input and calls
  `onSearch(artist)` upward; it does not know about persistence.
- Search execution lives in `src/hooks/useArtistSearch.ts`, which exposes
  `{ search, result, status }`. Its `status` already distinguishes
  `success` from `not-found` — the natural place to record history.
- There is no existing storage utility; this is the first `localStorage`
  usage in the project.

## Proposed solution

**State ownership.** A new hook `src/hooks/useRecentSearches.ts` owns the
list. It exposes `{ entries, add, clear }`, reads `localStorage` once on
mount (key `top-tracks:recent-searches`, a JSON array of strings), and writes
on every mutation. `add` deduplicates case-insensitively by moving the artist
to the front, then truncates to 5 entries.

**Rendering.** `src/components/RecentSearches/RecentSearches.tsx` is
presentational: it receives `entries`, `onSelect`, and `onClear`. When
`entries` is empty it returns `null` — the PRD forbids an empty shell. The
home screen wires `onSelect` to the same handler `SearchBar` uses, so a tap
re-runs a search identically to typing it.

**Recording.** `src/app/page.tsx` calls `add(artist)` when
`useArtistSearch` reports `success`. Not-found searches are not recorded
(interview decision, 2026-07-22).

**Error handling.** All `localStorage` access goes through `try/catch`
inside the hook: on read failure the list starts empty; on write failure the
in-memory list still updates for the session. Malformed stored JSON is
treated as an empty list. The feature degrades to today's blank home screen,
never to an error, matching the PRD's risk section.

## Affected files

| File | Change | Purpose |
| ---- | ------ | ------- |
| `src/hooks/useRecentSearches.ts` | create | Owns the list, persistence, dedupe, cap |
| `src/hooks/useRecentSearches.test.ts` | create | Unit tests for the hook |
| `src/components/RecentSearches/RecentSearches.tsx` | create | Presentational list + clear action |
| `src/components/RecentSearches/RecentSearches.test.tsx` | create | Unit tests for the component |
| `src/app/page.tsx` | modify | Render the list; record successful searches |
| `src/app/page.test.tsx` | modify | Cover the new home-screen behavior |
| `e2e/recent-searches.spec.ts` | create | E2E flow for the discovery loop |

## Third-party libraries

None beyond the existing stack. Verified via Context7 that React 19's
`useSyncExternalStore` is not needed here: the list is only read and written
by this hook on one page, so plain `useState` initialized from
`localStorage` is sufficient and avoids cross-tab sync scope creep (a PRD
non-goal).

## Testing approach

### Unit tests (Vitest + Testing Library)

#### `src/hooks/useRecentSearches.test.ts`

- starts empty when `localStorage` has no entry for the key
- initializes from a previously stored list, preserving order
- `add` prepends a new artist to the front of the list
- `add` persists the updated list to `localStorage` under
  `top-tracks:recent-searches`
- `add` of an already-listed artist moves it to the front without
  duplicating it
- `add` deduplicates case-insensitively ("radiohead" matches "Radiohead"),
  keeping the most recent casing
- `add` beyond 5 entries drops the oldest, keeping exactly 5
- `clear` empties the list and removes the persisted entry
- malformed JSON in storage yields an empty list instead of throwing
- a stored value that parses but is not an array of strings yields an empty
  list
- `localStorage.getItem` throwing (private mode) yields an empty list
  instead of crashing
- `localStorage.setItem` throwing still updates the in-memory list for the
  session

#### `src/components/RecentSearches/RecentSearches.test.tsx`

- renders one item per entry, in the order received
- renders a "Recent searches" heading when entries exist
- renders nothing at all when `entries` is empty — no heading, no shell
- clicking an entry calls `onSelect` with that artist's name
- a "Clear" action is visible whenever entries exist
- activating "Clear" calls `onClear` exactly once
- entries and the clear action are reachable and activatable via keyboard

#### `src/app/page.test.tsx`

- a first-time visitor (empty history) sees no "Recent searches" section
- a successful search adds the artist to the visible list
- a not-found search does not add an entry to the list
- selecting a recent entry triggers the same search flow as typing it
- clearing removes the section from the home screen immediately

### E2E tests (Playwright)

#### `e2e/recent-searches.spec.ts`

- searching for an artist and returning home shows it under "Recent
  searches"
- the list survives a page reload
- searching six artists shows only the five most recent, newest first
- re-searching an existing artist moves it to the top without duplicating
- tapping an entry navigates to that artist's results
- "Clear" empties the list, and it stays empty after a reload

### Coverage expectation

The hook and component are new and fully exercised above, including every
error branch (three storage-failure cases), so they should reach ~100%. The
`page.tsx` changes are covered by the five home-screen cases. Overall
project coverage stays above 80%; no code in this feature is intentionally
uncovered.

## Rollout & risks

Single PR, no flag: the feature is additive and invisible until the first
search. Riskiest branch is `localStorage` unavailability, covered by three
unit cases. No migration; the storage key is new. Cleanup on removal would
be deleting the key — noted in the PR description.

## Open questions

- Should the clear action ask for confirmation, or is instant clearing
  acceptable given the low stakes?
