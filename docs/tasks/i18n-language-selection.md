---
feature: i18n-language-selection
prd: docs/prds/i18n-language-selection.md
tech-spec: docs/tech-specs/i18n-language-selection.md
status: approved
created: 2026-07-30
---

# Tasks: i18n language selection

## Overview

The PRD asks for a PT-BR/EN interface: every authored string in the active
language, a PT/EN switcher in the header, browser-language detection on
first visit, a persisted choice, locale-prefixed URLs with localized SEO
metadata, and locale-aware number formatting. The tech spec solves it with
locale-segmented routes under `src/app/[lang]/`, a `src/proxy.ts` redirect
for unprefixed URLs, per-locale JSON dictionaries delivered through a
`LocaleProvider` context, stable error codes from `/api/artist`, and
`Intl`-based formatting. The eight tasks below build bottom-up — i18n core,
proxy, error codes, formatting, route migration, component localization,
switcher, E2E — so each increment is independently reviewable with its
tests passing.

## Approved high-level tasks

- [x] **Task 1:** i18n core module — locale model, dictionaries, loader,
  and `formatMessage`, fully tested
- [x] **Task 2:** Locale redirect proxy — `src/proxy.ts` negotiating and
  307-redirecting unprefixed URLs
- [x] **Task 3:** API error codes — `/api/artist` returns `{ code }` and
  `useArtistSearch` exposes `errorCode`
- [x] **Task 4:** Locale-aware formatting — `formatNumber`/`formatCount`
  rewritten on `Intl` with locale parameters
- [ ] **Task 5:** Locale-segmented routing — routes under `src/app/[lang]/`
  with locale-aware layout, metadata, and provider infrastructure
- [ ] **Task 6:** Component localization — every component reads its copy
  and counts from the dictionary
- [ ] **Task 7:** Language switcher — PT/EN toggle in the header with
  cookie persistence
- [ ] **Task 8:** E2E coverage — the i18n journey plus existing specs
  updated for locale-prefixed URLs

## Task breakdown

### Task 1: i18n core module

**Deliverable:** `src/lib/i18n/` owning the locale vocabulary:
`locales.ts` (`LOCALES`, `DEFAULT_LOCALE`, `hasLocale`,
`negotiateLocale` with cookie → header → default order), `types.ts`
(`Locale`, `Dictionary` derived from the English file), both dictionaries
(`en.json`, `pt-BR.json`, grouped by surface, with the "band discovery"
tagline untranslated in both), the server-only `getDictionary` lazy
loader, and the `formatMessage` `{placeholder}` interpolation helper —
with all four test files passing.

**Depends on:** Nothing — can start immediately.

**Files:**

- `src/lib/i18n/types.ts` — create
- `src/lib/i18n/locales.ts` — create
- `src/lib/i18n/locales.test.ts` — create
- `src/lib/i18n/getDictionary.ts` — create
- `src/lib/i18n/getDictionary.test.ts` — create
- `src/lib/i18n/dictionaries/en.json` — create
- `src/lib/i18n/dictionaries/pt-BR.json` — create
- `src/lib/i18n/formatMessage.ts` — create
- `src/lib/i18n/formatMessage.test.ts` — create

**Test cases:**

- `src/lib/i18n/locales.test.ts`
  - `hasLocale` accepts `"en"` and `"pt-BR"`, rejects `"fr"`, `"pt"`, `""`
  - `negotiateLocale` returns the cookie locale when the cookie holds a
    supported value, regardless of the header
  - ignores an unsupported cookie value and falls through to the header
  - returns `pt-BR` for headers preferring `pt`, `pt-BR`, or `pt-PT`
  - returns `en` for an English, unsupported, malformed, or absent header
- `src/lib/i18n/getDictionary.test.ts`
  - returns the English strings for `"en"` and Portuguese for `"pt-BR"`
  - both dictionaries expose the exact same key paths (parity walk — the
    runtime backstop behind the compile-time `Dictionary` type)
- `src/lib/i18n/formatMessage.test.ts`
  - replaces a single `{placeholder}` with its value
  - replaces multiple distinct placeholders in one template
  - leaves a placeholder literal when no value is provided
  - returns a template with no placeholders unchanged

**Business goal:** The negotiation cases prove PRD R3 (any `pt*` browser
preference → PT-BR, everything else → EN) and the cookie-first order
behind R4; the parity walk is the runtime half of the PRD's "string
drift" mitigation, guaranteeing no key exists in one language only.

### Task 2: Locale redirect proxy

**Deliverable:** `src/proxy.ts` exporting `proxy(request)`: passes
locale-prefixed paths through, otherwise 307-redirects to
`/{negotiateLocale(...)}{pathname}` preserving search params, reading the
`top-tracks-locale` cookie and `Accept-Language` header, with a `matcher`
excluding `api`, `_next/static`, `_next/image`, and files with
extensions — with `src/proxy.test.ts` passing.

**Depends on:** Task 1.

**Files:**

- `src/proxy.ts` — create
- `src/proxy.test.ts` — create

**Test cases:**

- `src/proxy.test.ts`
  - redirects `/` to `/en` with no cookie and no language preference
  - redirects `/` to `/pt-BR` when `Accept-Language` prefers Portuguese
  - redirects `/` to the cookie's locale, overriding the header
  - preserves the query string: `/?q=Opeth` redirects to `/en?q=Opeth`
  - passes through `/en` and `/pt-BR?q=Opeth` without redirecting
  - redirects with a 307 status so bookmarks are not permanently rewritten

**Business goal:** PRD R5's unprefixed-URL criterion — existing `/` and
`/?q=…` bookmarks keep working via redirect (stored choice first, then
browser detection, then EN) — and PRD R3/R4 as the user experiences them
on arrival; the 307 case proves the rollout risk mitigation against
browsers caching a locale permanently.

### Task 3: API error codes

**Deliverable:** `/api/artist` responding with
`{ code: ArtistLookupErrorCode }` instead of `{ error: string }` across
all four failure branches (type added to `src/lib/music/types.ts`), its
first-ever test file covering every response branch, and
`useArtistSearch` (still at `src/app/_hooks/` until the Task 5 move)
exposing `errorCode` instead of `errorMessage`, adding `"network-error"`
for fetch failures and `"unexpected-error"` for malformed bodies — with
both test files passing.

**Depends on:** Nothing — can start immediately.

**Files:**

- `src/app/api/artist/route.ts` — modify
- `src/app/api/artist/route.test.ts` — create
- `src/lib/music/types.ts` — modify
- `src/app/_hooks/useArtistSearch.ts` — modify (moves to
  `src/app/[lang]/_hooks/` in Task 5)
- `src/app/_hooks/useArtistSearch.test.ts` — modify

**Test cases:**

- `src/app/api/artist/route.test.ts`
  - missing `q` responds 400 with `{ code: "missing-query" }`
  - an unmatched artist responds 404 with `{ code: "not-found" }`
  - a missing API key responds 502 with `{ code: "missing-api-key" }`
  - a Last.fm failure responds 502 with `{ code: "upstream-error" }`
  - an unexpected error responds 500 with `{ code: "unexpected-error" }`
  - a successful lookup responds 200 with the lookup result unchanged
- `src/app/[lang]/_hooks/useArtistSearch.test.ts` (modified cases)
  - a non-ok response surfaces the body's `code` as `errorCode`
  - a non-ok response without a parsable code yields `"unexpected-error"`
  - a fetch rejection yields `"network-error"`
  - success and loading states expose a null `errorCode`

**Business goal:** The prerequisite for PRD R1's error-state criterion: a
language-agnostic API (interview decision, 2026-07-29) whose stable codes
the client can map to localized messages in Task 6, keeping `/api/artist`
untouched by locale routing as the PRD's technical considerations require.

### Task 4: Locale-aware formatting

**Deliverable:** `src/lib/format.ts` with `formatNumber(count, locale)`
delegating to `toLocaleString(locale)` and `formatCount(count, locale)`
rewritten on `Intl.NumberFormat` compact notation (`maximumFractionDigits:
1`) — with `format.test.ts` covering both locales and passing.

**Depends on:** Task 1 (the `Locale` type).

**Files:**

- `src/lib/format.ts` — modify
- `src/lib/format.test.ts` — modify

**Test cases:**

- `src/lib/format.test.ts`
  - `formatNumber` groups as `1,213,400` for `en` and `1.213.400` for
    `pt-BR`
  - `formatCount` keeps values under 1,000 unformatted in both locales
  - `formatCount` renders `12.3K` / `1.2M` for `en`
  - `formatCount` renders `12,3 mil` / `1,2 mi` for `pt-BR`
  - `formatCount` drops the trailing zero (`1M`, not `1.0M`)

**Business goal:** PRD R6 — listener/playcount numbers format per the
active locale's conventions (`1.234.567` in PT-BR, `1,234,567` in EN),
with the compact rendering matching the interview decision ("9.1M" EN,
"9,1 mi" PT-BR).

### Task 5: Locale-segmented routing

**Deliverable:** The route tree moved under `src/app/[lang]/`
(`favicon.ico` and `globals.css` stay in `src/app/`): the layout
validates the locale (`notFound()` for `/fr`), declares
`generateStaticParams()` for both locales, sets `<html lang={lang}>`,
builds metadata via the new `buildMetadata(locale)`, and wraps `children`
in the new `LocaleProvider`; `useTranslation` reads the context and
throws outside it; the vitest coverage exclusion points at the moved
layout — app builds and serves both locale paths, with the three new
test files passing.

**Depends on:** Task 1.

**Files:**

- `src/app/[lang]/layout.tsx` — move + modify (from `src/app/layout.tsx`)
- `src/app/[lang]/page.tsx` — move (from `src/app/page.tsx`; dictionary
  slices wired in Task 6)
- `src/app/[lang]/_components/*` and `src/app/[lang]/_hooks/*` (with
  their tests) — move (localization modifications land in Task 6)
- `src/lib/i18n/metadata.ts` — create
- `src/lib/i18n/metadata.test.ts` — create
- `src/lib/i18n/LocaleProvider.tsx` — create
- `src/lib/i18n/LocaleProvider.test.tsx` — create
- `src/lib/i18n/useTranslation.ts` — create
- `src/lib/i18n/useTranslation.test.tsx` — create
- `vitest.config.ts` — modify

**Test cases:**

- `src/lib/i18n/metadata.test.ts`
  - returns the localized description for `"en"` and `"pt-BR"`
  - keeps the title "TopTracks — band discovery" identical in both
    locales (untranslated wordmark)
  - includes `alternates.languages` entries for both locale paths
- `src/lib/i18n/LocaleProvider.test.tsx` / `useTranslation.test.tsx`
  - children receive the provided dictionary and locale via the hook
  - `useTranslation` outside a provider throws a descriptive error

**Business goal:** PRD R5 — each language has a distinct URL path that
renders regardless of preference, unsupported locales 404, and the
document `<title>`, meta description, and `<html lang>` match the active
language (`alternates.languages` making each language independently
indexable); the provider cases prove the delivery mechanism every
localized component in Task 6 depends on.

### Task 6: Component localization

**Deliverable:** Every authored string routed through the dictionaries:
`page.tsx` loads the dictionary and passes slices to the server
components (`SiteHeader`, `PageFooter`); client components read copy via
`useTranslation` (`PageHeader`, `EmptyState`, `SearchStatus`,
`ResultsSkeleton`, `SearchBar`/`SearchInput`, the `ArtistResults`
family); `SearchStatus` gains `errorCode`/`query` props and renders
`formatMessage(dictionary.errors[errorCode], { query })`; `HomeSearch`
pushes locale-prefixed URLs; counts render through the Task 4 formatters
with the locale from `useTranslation` — with every listed component test
passing in both locales.

**Depends on:** Task 3, Task 4, and Task 5.

**Files:**

- `src/app/[lang]/page.tsx` — modify
- `src/app/[lang]/page.test.tsx` — modify
- `src/app/[lang]/_components/SiteHeader.tsx` + test — modify
- `src/app/[lang]/_components/PageHeader.tsx` + test — modify
- `src/app/[lang]/_components/PageFooter.tsx` + test — modify
- `src/app/[lang]/_components/EmptyState.tsx` + test — modify
- `src/app/[lang]/_components/SearchStatus.tsx` + test — modify
- `src/app/[lang]/_components/HomeSearch.tsx` + test — modify
- `src/app/[lang]/_components/HomeSearchFallback.test.tsx` — modify
  (wrapped in provider)
- `src/app/[lang]/_components/ResultsSkeleton.tsx` + test — modify
- `src/components/SearchBar/SearchBar.tsx` + `SearchInput.tsx` — modify
- `src/components/SearchBar/*.test.tsx` — modify
- `src/components/ArtistResults/*` — modify
- `src/components/ArtistResults/*.test.tsx` — modify

**Test cases:**

- `src/app/[lang]/_components/SearchStatus.test.tsx` (modified cases)
  - renders the localized message for each error code, in `en` and
    `pt-BR`
  - interpolates the query into the not-found message
  - renders the localized "Searching…" live region text while loading
- `src/app/[lang]/_components/HomeSearch.test.tsx` (modified cases)
  - searching pushes `/{locale}?q=<artist>`, keeping the active locale
    prefix
- Component tests (modified: `PageHeader`, `EmptyState`, `PageFooter`,
  `SiteHeader`, `ResultsSkeleton`, `SearchBar`, `SearchInput`,
  `ArtistHeader`, `TrackCard`, `AlbumCard`, `SimilarArtists`,
  `SimilarArtistCard`, `ArtistResults`, `page`)
  - each renders its Portuguese copy when given the `pt-BR` dictionary
    (via provider or prop slice) — one case per component asserting a
    representative string or accessible name
  - each keeps its English copy under `en` (existing assertions, now
    routed through the dictionary)
  - `ArtistHeader` renders the listeners line with locale-grouped digits
  - `TrackCard`/`AlbumCard` render locale-compact playcounts
  - API-sourced content (artist, track, album names, tags) renders
    unchanged in both locales
  - `SiteHeader` and `PageFooter` keep the "band discovery" tagline in
    English under `pt-BR` (untranslated wordmark)

**Business goal:** PRD R1 in full — every authored string in the active
language across all screen states, API-sourced content untouched — plus
R6's rendering in the real components; the `HomeSearch` case protects
R5's prefix through the search flow, and the tagline cases pin the
untranslated-wordmark decision (2026-07-29).

### Task 7: Language switcher

**Deliverable:** `LanguageSwitcher` (client component in
`src/app/[lang]/_components/`, rendered by `SiteHeader`): "PT" and "EN"
buttons with `aria-pressed` marking the active locale, writing the
`top-tracks-locale` cookie (`path=/`, one-year `Max-Age`) and calling
`router.replace` with the locale segment swapped and the current query
string preserved — with `LanguageSwitcher.test.tsx` passing.

**Depends on:** Task 6.

**Files:**

- `src/app/[lang]/_components/LanguageSwitcher.tsx` — create
- `src/app/[lang]/_components/LanguageSwitcher.test.tsx` — create
- `src/app/[lang]/_components/SiteHeader.tsx` + test — modify (hosts the
  switcher)

**Test cases:**

- `src/app/[lang]/_components/LanguageSwitcher.test.tsx`
  - renders "PT" and "EN" options
  - marks the active locale with `aria-pressed="true"` and the other
    false
  - activating the inactive locale navigates to the same path and query
    with the locale segment swapped
  - activating writes the `top-tracks-locale` cookie
  - activating the already-active locale does not navigate
  - both options are focusable and activatable via keyboard

**Business goal:** PRD R2 in full — a header switcher labeled "PT"/"EN",
active language visually distinguishable, switching without losing the
search context, keyboard-accessible — and the cookie write is R4's
persistence half (the proxy's cookie read from Task 2 completes it).

### Task 8: E2E coverage

**Deliverable:** `e2e/i18n.spec.ts` exercising the full language journey
in a real browser, `mockArtistApi` emitting `{ code }` error fixtures,
and the four existing specs passing against locale-prefixed URLs — the
whole Playwright suite green.

**Depends on:** Task 7.

**Files:**

- `e2e/i18n.spec.ts` — create
- `e2e/support/mockArtistApi.ts` — modify
- `e2e/search.spec.ts` — modify
- `e2e/errorStates.spec.ts` — modify
- `e2e/discoveryLoop.spec.ts` — modify
- `e2e/accessibility.spec.ts` — modify

**Test cases:**

- `e2e/i18n.spec.ts`
  - visiting `/` with a default (English) browser redirects to `/en` and
    shows the English hero
  - visiting `/` with a `pt-BR` browser locale redirects to `/pt-BR` and
    shows the Portuguese hero
  - opening `/pt-BR?q=Opeth` directly renders Portuguese UI with Opeth's
    results, regardless of browser language
  - switching to PT from English results re-renders the same results in
    Portuguese and the URL becomes `/pt-BR?q=…`
  - after switching to PT, visiting `/` again redirects to `/pt-BR`
    (persistence via cookie)
  - the switcher marks the active language
  - `<html lang>` and the document title match the active locale on both
    locale paths
  - an unsupported locale path (`/fr`) renders the 404 page
  - the not-found and upstream-error messages appear in Portuguese on
    `/pt-BR` (mocked API)
- Existing specs (modified)
  - `search.spec.ts` / `discoveryLoop.spec.ts` / `errorStates.spec.ts`
    keep passing through the `/` → `/en` redirect; URL assertions gain
    the `/en` prefix; error mocks emit `{ code }` bodies
  - `accessibility.spec.ts` additionally scans the `/pt-BR` home and
    results states for violations

**Business goal:** End-to-end proof of every PRD requirement as a user
experiences it — R3's detection and R4's persistence only truly verify in
a real browser with real cookies, R5's redirect covers the PRD's URL
migration risk, and the success metric ("a search-to-discovery loop
entirely in PT-BR") is exercised literally; the accessibility scan holds
the project's WCAG baseline on the new locale.

## Test coverage check

Every test case in the tech spec's "Testing approach" is assigned to
exactly one task; no task's functionality has cases it does not list.

| Tech spec test file | Task |
| ------------------- | ---- |
| `src/lib/i18n/locales.test.ts` | Task 1 |
| `src/lib/i18n/getDictionary.test.ts` | Task 1 |
| `src/lib/i18n/formatMessage.test.ts` | Task 1 |
| `src/proxy.test.ts` | Task 2 |
| `src/app/api/artist/route.test.ts` | Task 3 |
| `src/app/[lang]/_hooks/useArtistSearch.test.ts` | Task 3 |
| `src/lib/format.test.ts` | Task 4 |
| `src/lib/i18n/metadata.test.ts` | Task 5 |
| `src/lib/i18n/LocaleProvider.test.tsx` | Task 5 |
| `src/lib/i18n/useTranslation.test.tsx` | Task 5 |
| `src/app/[lang]/_components/SearchStatus.test.tsx` | Task 6 |
| `src/app/[lang]/_components/HomeSearch.test.tsx` | Task 6 |
| Component tests (`PageHeader`, `EmptyState`, `PageFooter`, `SiteHeader`, `ResultsSkeleton`, `SearchBar`, `SearchInput`, `ArtistHeader`, `TrackCard`, `AlbumCard`, `SimilarArtists`, `SimilarArtistCard`, `ArtistResults`, `page`) | Task 6 |
| `src/app/[lang]/_components/LanguageSwitcher.test.tsx` | Task 7 |
| `e2e/i18n.spec.ts` | Task 8 |
| Existing E2E specs (`search`, `discoveryLoop`, `errorStates`, `accessibility`) | Task 8 |

## Open questions

None — the switcher placement, tagline, compact-number rendering, and
API-language decisions were all resolved during the PRD and tech spec
interviews (2026-07-29).
