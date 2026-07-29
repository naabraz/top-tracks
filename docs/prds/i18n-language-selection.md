---
feature: i18n-language-selection
status: approved
created: 2026-07-29
---

# PRD: i18n language selection

## Problem & context

top-tracks is written entirely in English, but its audience includes Brazilian
users who would be more comfortable browsing in Portuguese. Today a
Portuguese-speaking user has to parse English headings, empty states, and
error messages to use the product; there is no way to change the language.
The product should speak the user's language for everything it authors, while
being honest that catalog data (artist names, tags, bios) comes from external
APIs and stays as-is.

## Goals

- A user can switch the interface between Brazilian Portuguese (PT-BR) and
  English (EN) at any time, from anywhere in the app.
- First-time visitors see the app in their browser's preferred language, with
  no manual step.
- A returning user keeps the language they chose.
- Shared links open in the language they were shared in, and each language is
  independently indexable.

## Target users

Everyone, with Brazilian Portuguese speakers as the immediate beneficiaries.
No personas needed: the feature has a single behavior for all users.

## Non-goals

- No locales beyond PT-BR and EN in this iteration.
- No online translation service — all translations ship with the app, offline.
- No translation of API-sourced content: artist names, track and album titles,
  tags, and listener counts' underlying data remain as Last.fm/Spotify return
  them.
- No regional variants (e.g. en-US vs en-GB, pt-PT); exactly two locales.
- No translation of the user's search query or search results matching.

## Requirements

### R1 — All interface text renders in the active language

As a user, I want every piece of text the app authors to appear in my
language, so that I can use the product without parsing a foreign language.

**Acceptance criteria:**

- With PT-BR active, all UI strings — headings, buttons, placeholders,
  loading/empty/error states, footer — appear in Portuguese; with EN active,
  in English.
- No string is left in the other language on any screen state (idle, loading,
  results, not-found, error).
- API-sourced content (artist names, track/album titles, tags) is displayed
  unchanged in both languages.

### R2 — Language switcher

As a user, I want a visible control to switch between PT-BR and EN, so that I
can read the app in the language I prefer.

**Acceptance criteria:**

- A language switcher lives in the site header, visible on every page
  without scrolling.
- The switcher labels the languages with short codes: "PT" and "EN".
- Activating the other language re-renders the current screen in that
  language without losing the current search/results context.
- The active language is visually distinguishable in the switcher.
- The switcher is keyboard-accessible with a visible focus state, per the
  project's accessibility baseline.

### R3 — First visit follows the browser language

As a first-time visitor, I want the app to open in my browser's preferred
language, so that I don't have to find a setting before reading anything.

**Acceptance criteria:**

- A browser preferring Portuguese (any `pt` variant) gets PT-BR on first
  visit; any other preference gets EN.
- The fallback for unsupported or absent language preferences is EN.

### R4 — The chosen language persists

As a returning user, I want the app to remember my language choice, so that I
don't re-select it on every visit.

**Acceptance criteria:**

- After switching languages, closing and reopening the browser lands on the
  chosen language, overriding browser-preference detection.
- The preference is local to the browser; no account or server-side profile
  is involved.

### R5 — Language lives in the URL, including SEO metadata

As a user sharing a link, I want the URL to carry the language, so that the
recipient sees the page as I saw it.

**Acceptance criteria:**

- Each language has a distinct URL path (e.g. `/en/...`, `/pt-BR/...`).
- Opening a language-prefixed URL renders that language regardless of
  browser preference or stored choice.
- Visiting a URL without a language prefix redirects to the appropriate
  language (stored choice first, then browser detection, then EN).
- The document `<title>`, meta description, and `<html lang>` attribute match
  the active language.

### R6 — Locale-aware number formatting

As a user, I want counts formatted by my locale's conventions, so that large
numbers read naturally.

**Acceptance criteria:**

- Listener/playcount-style numbers format per active locale (e.g.
  `1.234.567` in PT-BR, `1,234,567` in EN).
- Any date the UI displays follows the active locale's conventions.

## Technical considerations

- The app is Next.js App Router; the recommended pattern is locale-segmented
  routes (`app/[lang]/`) with a proxy/middleware redirect for unprefixed
  URLs, and per-locale dictionaries loaded server-side. Details belong to the
  tech spec.
- Translations are static files shipped with the app (offline requirement);
  adding a locale must not require code changes beyond a new dictionary.
- The existing single route (`/`) will move under a locale segment; existing
  bookmarks to `/` must keep working via redirect.
- The `/api/artist` route is language-agnostic and should not be affected.
- Number formatting can rely on the platform `Intl` APIs; no library needed.

## Success metrics

- Qualitative: a Portuguese-speaking user completes a search-to-discovery
  loop entirely in PT-BR with no English UI strings.
- Share of sessions using PT-BR (needs a client event; the project has no
  analytics today — dependency flagged).

## Risks

- **String drift:** new components can reintroduce hardcoded English strings.
  Mitigation: the tech spec should define a single translation entry point so
  untranslated strings are visible in review, plus test coverage per screen
  state.
- **Translation quality:** PT-BR strings written by the team may read
  stilted. Mitigation: a native speaker (the project owner) reviews the
  dictionary before release.
- **URL migration:** moving `/` under `/{lang}` risks breaking deep links if
  the redirect is wrong. Mitigation: acceptance criteria in R5 cover the
  redirect explicitly; E2E tests should assert it.

## Open questions

None — the interview questions (switcher labels and placement) were answered:
short codes ("PT" / "EN"), placed in the site header.
