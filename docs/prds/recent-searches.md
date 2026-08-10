---
feature: recent-searches
status: approved
created: 2026-08-10
---

# PRD: Recent searches

## Problem & context

Search is the only entry point into top-tracks, and every visit starts from an
empty input. The product's core motion is a discovery loop — look up an artist,
hop to a similar one, hop again — but the trail is lost the moment the tab
closes. A user who wants to return to an artist they compared ten minutes ago
has to remember the name and retype it, and browser back only helps while the
session lasts. The searches a user already made are the cheapest possible
doorways back into the product, and today they are thrown away.

## Goals

- Let a user re-run any of their recent searches in one tap, without retyping.
- Keep that trail available across sessions, not just within one tab's history.
- Strengthen the discovery loop by making past artists a permanent, visible
  doorway back in.
- Keep the trail under the user's control: entries they don't want are
  removable.

## Target users

Everyone who has searched at least once. No personas needed: the feature has a
single behavior for all users.

## Non-goals

- No account system and no cross-device sync — the history is local to the
  browser and never leaves the device.
- No server-side storage, and no analytics, trending, or recommendation surface
  built on this data.
- No editing or renaming of entries; an entry can only be re-run or removed.
- No search-as-you-type suggestions or autocomplete inside the input.
- No history of anything other than artist searches (no viewed tracks, albums,
  or similar-artist impressions as a separate concept).

## Requirements

### R1 — See recent searches on every screen

As a returning user, I want my recent searches to stay visible while I browse,
so that I can jump back to an earlier artist at any point in the loop.

**Acceptance criteria:**

- The list is present on the idle home screen and remains present while results,
  loading, not-found, and error states are on screen.
- The list sits below the results area, styled as a secondary surface: it never
  outranks the top track visually, and it appears only after the answer the user
  came for.
- Entries are ordered most recent first.
- The list holds at most 10 entries; when an eleventh search is recorded, the
  oldest entry drops off.
- The history survives a page reload and a browser restart.
- A user who has never completed a successful search sees no recent-searches
  section at all — no empty shell and no placeholder text.
- All text the feature authors (section title, remove control's accessible
  label) is translated in both supported locales, per the project's i18n rules.

### R2 — Re-run a search from the list

As a user, I want each entry to take me straight back to that artist's results,
so that returning costs one tap instead of a retype.

**Acceptance criteria:**

- Each entry is a link; activating it runs the search for that artist and
  renders the same result the original search produced.
- Activating an entry updates the URL query the same way a typed search does, so
  the result is shareable and browser back still walks the discovery path.
- Activating an entry puts that artist's name in the search input.
- Following an entry does not create a new history record; it only reorders the
  existing one.
- Activating an entry moves it to the top of the list.
- Entries are reachable by keyboard with a visible focus state, per the
  project's accessibility baseline.

### R3 — Record only the user's own successful searches, without duplicates

As a user, I want the list to show only the artists I actually looked up and
found, so that every entry is a working doorway rather than a record of my typos
or of everything I browsed past.

**Acceptance criteria:**

- A search the user typed and submitted, which returns a result, is recorded in
  the history.
- A search that returns not-found, or that fails with an API or network error,
  is not recorded.
- A lookup the user did not type — following a similar-artist link, opening a
  shared URL, or moving through browser history — is not recorded, however it
  resolves.
- The entry displays the canonical artist name the API returned, not the raw
  text typed: searching `radiohead` records and displays `Radiohead`.
- Searching for an artist already in the history moves that entry to the top
  instead of adding a second entry; the list never shows the same artist twice.
- Two queries that resolve to the same canonical artist are the same entry, so
  `radiohead` and `Radiohead ` do not both appear.

### R4 — Remove an entry

As a user, I want to remove individual entries, so that a one-off lookup or a
search I'd rather not keep doesn't stay on my screen.

**Acceptance criteria:**

- Every entry exposes a remove control, reachable by keyboard and labelled for
  screen readers with the artist it removes.
- Activating it removes only that entry; the rest of the list keeps its order.
- Removing the last remaining entry makes the whole section disappear, matching
  the never-searched state in R1.
- Removed entries stay removed after a reload.
- Removing an entry does not navigate or change the results currently on screen.

## Technical considerations

- The history persists in browser-local storage on the device. No API changes,
  no server-side schema, and nothing sent to Last.fm or Spotify.
- Storage may be unavailable or full (private browsing, quota, blocked
  third-party storage). The feature must degrade to today's behavior — no
  section, no error — rather than break the search screen.
- Stored data is user-controlled input read back from the device: it can be
  absent, malformed, or hand-edited, and must be validated on read instead of
  trusted.
- The app renders locale-prefixed routes with the query in the URL
  (`/{lang}?q=...`), so an entry is a link to that URL and re-uses the existing
  search path rather than a parallel one.
- The list renders from local data with no network call, so it must not show a
  loading skeleton. It is client-only state, which means server-rendered markup
  cannot include it — the tech spec needs to say how the first paint avoids a
  hydration mismatch or a visible flash.
- Recording depends on two things the current code keeps apart: whether the
  lookup succeeded (known only when the result settles) and whether the user
  typed the query (known only at submit time). The URL alone cannot tell a typed
  search from a similar-artist hop or a shared link, so the tech spec needs a way
  to carry that intent through to the settled result.
- The canonical name comes from the lookup response, which is another reason
  recording happens on the result rather than on submit.

## Success metrics

- Share of searches started from the recent-searches list rather than typed
  (needs a client event; the project has no analytics today — dependency
  flagged).
- Qualitative: a returning user can resume a previous discovery loop without
  retyping any artist name.

## Risks

- **Screen real estate:** an always-visible list competes with the result for
  attention, and the product's first design principle is "answer first".
  Mitigation: R1 places the list below the results as a secondary surface, so
  the headline track is always read first; the results screen — not only the
  empty one — is what the placement gets reviewed against.
- **Privacy on shared devices:** history persists across sessions with no
  clear-all, so per-entry removal is the only exit. Mitigation: if this proves
  too coarse in review, add clear-all as a follow-up requirement.
- **Stale entries:** an artist recorded successfully may later fail to resolve
  (upstream data changes). The entry then leads to a not-found screen.
  Mitigation: accept for now; the not-found state already explains itself.

## Open questions

None — the interview questions were answered: only searches the user typed are
recorded (R3), entries display the canonical name the API returned (R3), and the
list sits below the results as a secondary surface (R1).
