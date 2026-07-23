<!--
An exemplary PRD for a fictional top-tracks feature. Note what makes it good:
every section from TEMPLATE.md is present in order, acceptance criteria are
observable outcomes, non-goals draw a real boundary, depth is proportional to
a small feature, and unresolved points live in "Open questions" instead of
being silently assumed.
-->

---
feature: recent-searches
status: draft
created: 2026-07-22
---

# PRD: Recent searches

## Problem & context

Searching is the only entry point into top-tracks, but every visit starts from
a blank input. Users who return to compare artists they looked up earlier have
to retype each name from memory, which adds friction to the discovery loop —
the product's core motion of hopping from one artist to a similar one.

## Goals

- Let a returning user re-run a previous search in one tap.
- Make the empty home screen useful instead of blank.
- Strengthen the discovery loop: past searches become doorways back in.

## Target users

Everyone who has searched at least once. No personas needed: the feature has a
single behavior for all users.

## Non-goals

- No account system or cross-device sync — history is local to the browser.
- No search analytics or trending-artists surface built on this data.
- No editing of individual history entries; only clear-all.

## Requirements

### R1 — Show recent searches on the home screen

As a returning user, I want to see my recent searches when I land on the home
screen, so that I can jump back to an artist without retyping.

**Acceptance criteria:**

- After searching for an artist, returning to the home screen shows that
  artist in a "Recent searches" list, most recent first.
- The list shows at most 5 entries; older entries drop off.
- Tapping an entry runs the search for that artist immediately.
- A user who has never searched sees no "Recent searches" section at all —
  no empty shell, no placeholder text.

### R2 — Clear the history

As a user on a shared computer, I want to clear my recent searches, so that my
listening habits are not visible to the next person.

**Acceptance criteria:**

- A "Clear" action is visible whenever the list is visible.
- Activating it removes the list immediately and the section disappears.
- The list stays empty after a page reload.

## Technical considerations

- History persists in `localStorage`; no API or schema changes.
- Deduplicate by artist: re-searching an artist moves it to the top instead of
  creating a duplicate entry.
- The list renders from local data only — no loading state exists, so the
  component must not flash a skeleton.

## Success metrics

- Share of searches initiated from the recent-searches list (needs a client
  event; the project has no analytics today — dependency flagged).
- Qualitative: the home screen is no longer a dead end for returning users.

## Risks

- `localStorage` is unavailable in some private-browsing modes — the feature
  must degrade to the current blank home screen, never to an error.

## Open questions

- Should a search that returns "artist not found" be recorded in the history?
