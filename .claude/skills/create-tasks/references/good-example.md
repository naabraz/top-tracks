<!--
An exemplary task list for the fictional "recent searches" feature (see the
create-prd and create-tech-spec skills' good-example.md files for its PRD
and tech spec). Note what makes it good: the approved high-level list is
recorded verbatim, every task states a deliverable a reviewer can verify,
every test case from the tech spec's "Testing approach" is assigned to
exactly one task, each task ties its cases back to the business goal, and
the coverage check proves nothing was dropped.
-->

---
feature: recent-searches
prd: docs/prds/recent-searches.md
tech-spec: docs/tech-specs/recent-searches.md
status: draft
created: 2026-07-24
---

# Tasks: Recent searches

## Overview

The PRD asks for a "Recent searches" list on the home screen: the last five
searched artists, tappable to re-run a search, with a clear-all action,
persisted locally. The tech spec solves it with a `localStorage`-backed
`useRecentSearches` hook, a presentational `RecentSearches` component, and a
write into the list on successful searches. The four tasks below build
bottom-up — hook, component, home-screen wiring, E2E flow — so each one is
independently reviewable with its tests passing.

## Approved high-level tasks

1. `useRecentSearches` hook — persistence, dedupe, and cap, fully tested
2. `RecentSearches` component — presentational list with clear action
3. Home-screen integration — render the list and record successful searches
4. E2E coverage — the full discovery loop in Playwright

## Task breakdown

### Task 1: `useRecentSearches` hook

**Deliverable:** `src/hooks/useRecentSearches.ts` exposing
`{ entries, add, clear }` over a `localStorage`-backed list (key
`top-tracks:recent-searches`) that deduplicates case-insensitively, caps at
5 entries, and degrades to an empty list on any storage failure — with
`useRecentSearches.test.ts` passing.

**Depends on:** Nothing — can start immediately.

**Files:**

- `src/hooks/useRecentSearches.ts` — create
- `src/hooks/useRecentSearches.test.ts` — create

**Test cases:**

- `src/hooks/useRecentSearches.test.ts`
  - starts empty when `localStorage` has no entry for the key
  - initializes from a previously stored list, preserving order
  - `add` prepends a new artist to the front of the list
  - `add` persists the updated list to `localStorage` under
    `top-tracks:recent-searches`
  - `add` of an already-listed artist moves it to the front without
    duplicating it
  - `add` deduplicates case-insensitively ("radiohead" matches
    "Radiohead"), keeping the most recent casing
  - `add` beyond 5 entries drops the oldest, keeping exactly 5
  - `clear` empties the list and removes the persisted entry
  - malformed JSON in storage yields an empty list instead of throwing
  - a stored value that parses but is not an array of strings yields an
    empty list
  - `localStorage.getItem` throwing (private mode) yields an empty list
    instead of crashing
  - `localStorage.setItem` throwing still updates the in-memory list for
    the session

**Business goal:** The PRD criteria "last five searches, most recent first"
and "history survives a reload" — proven by the ordering, cap, dedupe, and
persistence cases; the storage-failure cases prove the PRD's "never worse
than today's blank home screen" risk mitigation.

### Task 2: `RecentSearches` component

**Deliverable:** `src/components/RecentSearches/RecentSearches.tsx`, a
presentational component receiving `entries`, `onSelect`, and `onClear`,
rendering nothing when empty and a keyboard-accessible list with a clear
action otherwise — with `RecentSearches.test.tsx` passing.

**Depends on:** Nothing — can start immediately (props-only, no hook usage).

**Files:**

- `src/components/RecentSearches/RecentSearches.tsx` — create
- `src/components/RecentSearches/RecentSearches.test.tsx` — create

**Test cases:**

- `src/components/RecentSearches/RecentSearches.test.tsx`
  - renders one item per entry, in the order received
  - renders a "Recent searches" heading when entries exist
  - renders nothing at all when `entries` is empty — no heading, no shell
  - clicking an entry calls `onSelect` with that artist's name
  - a "Clear" action is visible whenever entries exist
  - activating "Clear" calls `onClear` exactly once
  - entries and the clear action are reachable and activatable via keyboard

**Business goal:** The PRD criteria "tappable entries re-run the search" and
"a clear-all action" — proven by the `onSelect` and `onClear` cases; the
empty-render case proves the PRD's "no empty shell before the first search"
criterion, and the keyboard case the project's accessibility principle.

### Task 3: Home-screen integration

**Deliverable:** `src/app/page.tsx` rendering `RecentSearches` from the
hook's entries, recording an artist on every successful search (and never on
not-found), and wiring entry selection to the same handler as `SearchBar` —
with the updated `page.test.tsx` passing.

**Depends on:** Task 1 and Task 2.

**Files:**

- `src/app/page.tsx` — modify
- `src/app/page.test.tsx` — modify

**Test cases:**

- `src/app/page.test.tsx`
  - a first-time visitor (empty history) sees no "Recent searches" section
  - a successful search adds the artist to the visible list
  - a not-found search does not add an entry to the list
  - selecting a recent entry triggers the same search flow as typing it
  - clearing removes the section from the home screen immediately

**Business goal:** The PRD requirement "the home screen offers the last
searches as a starting point" — the successful/not-found pair proves only
real results are recorded, and the re-run case proves the discovery loop
("every answer is a doorway") works from history.

### Task 4: E2E coverage

**Deliverable:** `e2e/recent-searches.spec.ts` exercising the full
discovery loop in a real browser — search, persist, reload, re-run, clear —
passing against the integrated feature.

**Depends on:** Task 3.

**Files:**

- `e2e/recent-searches.spec.ts` — create

**Test cases:**

- `e2e/recent-searches.spec.ts`
  - searching for an artist and returning home shows it under "Recent
    searches"
  - the list survives a page reload
  - searching six artists shows only the five most recent, newest first
  - re-searching an existing artist moves it to the top without duplicating
  - tapping an entry navigates to that artist's results
  - "Clear" empties the list, and it stays empty after a reload

**Business goal:** End-to-end proof of every PRD acceptance criterion as a
user experiences it — persistence across reloads and the five-entry cap are
only truly verified in a real browser with real storage.

## Test coverage check

Every test case in the tech spec's "Testing approach" is assigned to
exactly one task; no task's functionality has cases it does not list.

| Tech spec test file | Task |
| ------------------- | ---- |
| `src/hooks/useRecentSearches.test.ts` | Task 1 |
| `src/components/RecentSearches/RecentSearches.test.tsx` | Task 2 |
| `src/app/page.test.tsx` | Task 3 |
| `e2e/recent-searches.spec.ts` | Task 4 |

## Open questions

- Should Task 4 land in the same PR as Task 3, or as a follow-up once the
  integrated feature is reviewed?
