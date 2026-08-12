---
feature: recent-searches
prd: docs/prds/recent-searches.md
tech-spec: docs/tech-specs/recent-searches.md
status: approved
created: 2026-08-12
---

# Tasks: Recent searches

## Overview

The PRD asks for a persistent, user-controlled trail of the artists a reader
looked up: at most ten entries, most recent first, visible under the results on
every state of the search screen, each one a link back to that artist and each
one removable — recorded only for searches the reader typed and that resolved,
under the canonical name the API returned. The tech spec solves it with a
module-level `localStorage`-backed store read through `useSyncExternalStore`, a
`useRecentSearches` hook that carries typed intent from submit to the settled
result, two presentational components, and origin-aware navigation in
`HomeSearch`. The six tasks below build bottom-up — store, hook, entry, section,
screen wiring, E2E — so each one is independently reviewable with its tests
passing.

## Approved high-level tasks

- [ ] **Task 1:** `recentSearchesStore` module — the `localStorage`-backed
  list with validation, dedupe, cap, and subscriptions
- [ ] **Task 2:** `useRecentSearches` hook — binds the store to the screen and
  records typed searches on settle
- [ ] **Task 3:** `RecentSearchItem` + i18n keys — one entry as sibling link
  and remove control
- [ ] **Task 4:** `RecentSearches` section + styles — heading and list,
  nothing when empty
- [ ] **Task 5:** `HomeSearch` wiring — origin-aware navigation, the section
  below the results, promotion and reveal on activation
- [ ] **Task 6:** E2E coverage — the returning-reader journey in Playwright

## Task breakdown

### Task 1: `recentSearchesStore` module

**Deliverable:** `src/app/[lang]/_hooks/recentSearchesStore.ts` exposing
`subscribe`, `getSnapshot`, `getServerSnapshot`, `addSearch`, and
`removeSearch` over a `localStorage`-backed list (key
`top-tracks-recent-searches`) that validates everything it reads, deduplicates
case-insensitively and whitespace-insensitively, caps at 10 entries, returns a
cached array reference between mutations, and swallows every storage failure —
with `recentSearchesStore.test.ts` passing.

**Depends on:** Nothing — can start immediately.

**Files:**

- `src/app/[lang]/_hooks/recentSearchesStore.ts` — create
- `src/app/[lang]/_hooks/recentSearchesStore.test.ts` — create

**Test cases:**

- `src/app/[lang]/_hooks/recentSearchesStore.test.ts`
  - `getSnapshot` returns an empty list when storage holds nothing for the key
  - `getSnapshot` returns a previously stored list in its stored order
  - `getSnapshot` returns the same array reference across calls when nothing
    changed (the identity `useSyncExternalStore` depends on)
  - `addSearch` puts a new artist first and persists the list under
    `top-tracks-recent-searches`
  - `addSearch` notifies every subscriber, and an unsubscribed listener stops
    being called
  - `addSearch` of an artist already listed moves it first without duplicating
    it
  - `addSearch` matches artists case-insensitively and ignoring surrounding
    whitespace (`"radiohead"`, `"Radiohead "` and `"Radiohead"` are one entry)
  - `addSearch` keeps the most recently recorded spelling of a repeated artist
  - `addSearch` of the artist already first neither writes to storage nor
    notifies subscribers
  - an eleventh `addSearch` drops the oldest entry, leaving exactly ten
  - `removeSearch` drops only the named entry and preserves the order of the
    rest
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

**Business goal:** PRD R1's "at most 10 entries, most recent first, surviving a
reload and a browser restart" and R3's "never the same artist twice" — proven by
the ordering, cap, persistence, and dedupe cases. `removeSearch` persisting an
empty list proves R4's "removed entries stay removed after a reload", and the
three storage-failure cases prove the PRD's technical requirement to degrade to
today's behavior rather than break the search screen.

### Task 2: `useRecentSearches` hook

**Deliverable:** `src/app/[lang]/_hooks/useRecentSearches.ts` exposing
`{ entries, markTyped, openEntry, removeEntry }`, reading the store through
`useSyncExternalStore` so the list is correct in the first client paint, and
recording `result.artist.name` on a settled `success` only when the typed mark
was armed — consuming that mark on any settle — with `useRecentSearches.test.ts`
passing.

**Depends on:** Task 1.

**Files:**

- `src/app/[lang]/_hooks/useRecentSearches.ts` — create
- `src/app/[lang]/_hooks/useRecentSearches.test.ts` — create

**Test cases:**

- `src/app/[lang]/_hooks/useRecentSearches.test.ts`
  - `entries` reflects the stored list on first render, with no effect tick
    needed
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
  - the hook renders an empty list, without throwing, when storage is
    unavailable

**Business goal:** PRD R3 in full — only searches the reader typed and that
resolved are recorded, under the canonical name the API returned. The
success/not-found/unmarked/consumed-once cases prove each half of that rule, and
the first-render case proves the PRD's "no loading skeleton, no flash" technical
requirement by showing the list needs no effect tick to be correct.

### Task 3: `RecentSearchItem` + i18n keys

**Deliverable:** `src/app/[lang]/_components/RecentSearchItem.tsx` rendering one
entry as two sibling controls — a `next/link` to
`${pathname}?q=<artist>` whose text is the artist name, and a `<button>`
labelled "Remove {artist} from recent searches" with its glyph `aria-hidden` —
plus `recent.heading` and `recent.removeLabel` in both dictionaries, with
`RecentSearchItem.test.tsx` passing.

**Depends on:** Nothing — can start immediately (props-only, no store or hook
usage).

**Files:**

- `src/app/[lang]/_components/RecentSearchItem.tsx` — create
- `src/app/[lang]/_components/RecentSearchItem.test.tsx` — create
- `src/lib/i18n/dictionaries/en.json` — modify
- `src/lib/i18n/dictionaries/pt-BR.json` — modify

**Test cases:**

- `src/app/[lang]/_components/RecentSearchItem.test.tsx`
  - renders the artist name as the link's accessible name
  - the remove control is a button labelled "Remove {artist} from recent
    searches", localized in both dictionaries
  - the remove control's glyph is hidden from assistive technology, so the label
    is the whole accessible name
  - the link and the button are siblings, both individually focusable — neither
    nests inside the other
  - activating the remove control with the keyboard calls `onRemove`

**Business goal:** PRD R4's "every entry exposes a remove control, reachable by
keyboard and labelled for screen readers with the artist it removes" — proven by
the label, `aria-hidden`, sibling, and keyboard cases. The localized-label case
covers R1's requirement that all text the feature authors is translated in both
supported locales.

### Task 4: `RecentSearches` section + styles

**Deliverable:** `src/app/[lang]/_components/RecentSearches.tsx` rendering
`null` when `entries` is empty and otherwise a
`<section aria-labelledby>` with a localized `<h2>` over a `<ul>` of
`RecentSearchItem`s in the order received, styled in `globals.css` as a
secondary surface (`.recent`, `.recent-list`, `.recent-item`) on the existing
tokens — with `RecentSearches.test.tsx` passing.

**Depends on:** Task 3.

**Files:**

- `src/app/[lang]/_components/RecentSearches.tsx` — create
- `src/app/[lang]/_components/RecentSearches.test.tsx` — create
- `src/app/globals.css` — modify

**Test cases:**

- `src/app/[lang]/_components/RecentSearches.test.tsx`
  - renders one link per entry, in the order received
  - renders the localized "Recent searches" heading, naming the section region
  - renders nothing at all when `entries` is empty — no heading, no list, no
    shell
  - each entry links to `${pathname}?q=<artist>`, URL-encoding names with spaces
    and punctuation
  - renders the Portuguese heading under the `pt-BR` dictionary
  - clicking an entry calls `onSelect` with that artist's name
  - clicking an entry's remove control calls `onRemove` with that artist's name
    and does not call `onSelect`
  - every entry link and remove control is reachable by keyboard in DOM order

**Business goal:** PRD R1's "a user who has never completed a successful search
sees no recent-searches section at all — no empty shell and no placeholder text"
and R4's "removing the last remaining entry makes the whole section disappear",
both proven by the empty-render case; the ordering and href cases prove R1's
"most recent first" and R2's "each entry is a link" ahead of the screen wiring.
The styling is what keeps the section from outranking the top track visually
(R1, "answer first").

### Task 5: `HomeSearch` wiring

**Deliverable:** `src/app/[lang]/_components/HomeSearch.tsx` calling
`useRecentSearches(status, result)`, splitting `goToArtist` into a typed and a
followed origin, rendering `RecentSearches` inside `<main>` below
`SearchStatus`, promoting and revealing on activation, and recording the
identical-URL edge (re-typing the artist already on screen) explicitly — with
the added cases in `HomeSearch.test.tsx` passing.

**Depends on:** Task 2 and Task 4.

**Files:**

- `src/app/[lang]/_components/HomeSearch.tsx` — modify
- `src/app/[lang]/_components/HomeSearch.test.tsx` — modify

**Test cases:**

- `src/app/[lang]/_components/HomeSearch.test.tsx`
  - a reader with no history sees no recent-searches section
  - a typed search that succeeds adds the canonical artist name to the section
  - a typed search that returns not-found adds nothing
  - a typed search that fails with a network error adds nothing
  - following a similar-artist tile adds nothing, though it resolves
  - arriving on a shared `?q=` URL adds nothing
  - re-typing the artist already on screen still records it (the identical-URL
    edge)
  - searching an artist already listed moves it to the top without a second
    entry
  - activating an entry navigates to `${pathname}?q=<artist>`, puts the name in
    the input, and shows that artist's result
  - activating an entry moves it to the top and adds no new entry
  - activating an entry lands the reader on the answer: the results region
    scrolls into view and takes focus
  - removing an entry drops it from the section and leaves the current result
    and the URL untouched
  - removing the last entry makes the whole section disappear
  - the section stays on screen through the idle, loading, not-found, and error
    states
  - the screen renders normally, with no section, when `localStorage` throws

**Business goal:** The integration each PRD requirement ultimately rests on. R3's
"a lookup the user did not type is not recorded" is proven by the similar-artist
and shared-URL cases together with the identical-URL edge; R2's "activating an
entry updates the URL, fills the input, and renders the same result" by the
round-trip and promotion cases; R1's "the list remains present while results,
loading, not-found, and error states are on screen" by the every-status case;
and R4's "removing does not navigate or change the results currently on screen"
by the removal case.

### Task 6: E2E coverage

**Deliverable:** `e2e/recentSearches.spec.ts` exercising the returning-reader
journey in a real browser — record, persist across a restored session, re-run,
promote, cap, remove — plus the role-based locators it needs in
`e2e/support/homePage.ts` and the populated-trail case in
`e2e/accessibility.spec.ts`, all passing against the integrated feature.

**Depends on:** Task 5.

**Files:**

- `e2e/recentSearches.spec.ts` — create
- `e2e/support/homePage.ts` — modify
- `e2e/accessibility.spec.ts` — modify

**Test cases:**

- `e2e/recentSearches.spec.ts`
  - a first visit shows no recent-searches section
  - searching an artist lists it under "Recent searches", under the canonical
    name the API returned even when typed in lowercase
  - the trail survives a reload, and survives a new browser context restoring
    the same storage state (the across-sessions promise)
  - following a similar artist does not add it to the trail, though its result
    is on screen
  - activating an entry re-runs the search, updates the URL, fills the input,
    and shows that artist's result
  - activating an entry moves it to the top of the trail without duplicating it
  - searching eleven artists leaves exactly ten entries, newest first, the first
    one gone
  - removing an entry leaves the rest in order and leaves the result on screen
    unchanged, and it is still gone after a reload
  - removing the last entry removes the whole section
  - the trail is visible alongside a not-found answer, and that failed search is
    not in it
  - the trail is reachable and operable from the keyboard alone: tab to an
    entry, Enter re-runs the search, and the answer takes focus
- `e2e/accessibility.spec.ts`
  - with a populated trail, the entry links and remove controls are reachable by
    keyboard with a visible focus state, on both locale paths

**Business goal:** End-to-end proof of every PRD acceptance criterion as a reader
experiences it. R1's "the history survives a page reload and a browser restart"
is only truly verified in a real browser with real storage, and the cap,
promotion, removal, and keyboard cases close R1–R4 against the running app.

## Test coverage check

Every test case in the tech spec's "Testing approach" is assigned to exactly one
task; no task's functionality has cases it does not list. The store's 22 cases,
the hook's 12, the entry's 5, the section's 8, the screen's 15 added cases, the
E2E spec's 11, and the accessibility spec's added case are all carried over
verbatim.

| Tech spec test file | Task |
| ------------------- | ---- |
| `src/app/[lang]/_hooks/recentSearchesStore.test.ts` | Task 1 |
| `src/app/[lang]/_hooks/useRecentSearches.test.ts` | Task 2 |
| `src/app/[lang]/_components/RecentSearchItem.test.tsx` | Task 3 |
| `src/app/[lang]/_components/RecentSearches.test.tsx` | Task 4 |
| `src/app/[lang]/_components/HomeSearch.test.tsx` | Task 5 |
| `e2e/recentSearches.spec.ts` | Task 6 |
| `e2e/accessibility.spec.ts` | Task 6 |

## Open questions

None — both were answered on 2026-08-12. The `e2e/accessibility.spec.ts` case
stays assigned to Task 6, even though the tech spec's "Affected files" table
omits that file; the table is the document to correct, not the case to drop. And
all six tasks ship in a single pull request, matching the tech spec's "single PR,
no flag" rollout — so the feature is only reviewable once Task 6's E2E coverage
passes over the integrated screen.
