---
feature: i18n-language-selection
prd: docs/prds/i18n-language-selection.md
status: approved
created: 2026-07-29
---

# Tech spec: i18n language selection

## Overview

The PRD asks for a PT-BR/EN interface: locale-prefixed URLs (`/en`,
`/pt-BR`), a PT/EN switcher in the site header, browser-language detection on
first visit, a persisted choice, localized SEO metadata, and locale-aware
number formatting — with all translations shipped offline.

The solution is the App Router pattern from this Next.js version's own i18n
guide: every route moves under `src/app/[lang]/`, a `proxy.ts` (the renamed
`middleware` convention) redirects unprefixed URLs using cookie → header →
default negotiation, and per-locale JSON dictionaries load server-side and
reach client components through a small `LocaleProvider` context. The
`/api/artist` route switches from English error strings to stable error
codes that the client maps to localized messages. No new dependencies.

## Current state

- `src/app/page.tsx` is the only page: a server component rendering
  `SiteHeader`, a `Suspense`-wrapped client `HomeSearch` (with
  `HomeSearchFallback` as the prerendered fallback), and `PageFooter`.
- `src/app/layout.tsx` hardcodes `lang="en"` on `<html>` and an English
  `metadata` object. It is excluded from coverage as a framework shell.
- `src/app/_components/HomeSearch.tsx` is a client component that treats the
  `?q=` search param as the source of truth and pushes `/?q=<artist>` on each
  search — locale prefixes must survive this navigation.
- `src/app/_hooks/useArtistSearch.ts` fetches `/api/artist?q=` and exposes
  `errorMessage` strings, two of them hardcoded client-side ("Something went
  wrong…", "Could not reach the server…"), the rest passed through from the
  API response body.
- `src/app/api/artist/route.ts` returns user-facing English `error` strings
  for four failure branches (missing query, not found, Last.fm failure —
  including a missing-API-key variant — and unexpected). It has no test file
  today.
- UI copy is hardcoded in English across `SiteHeader`, `PageHeader`,
  `PageFooter`, `EmptyState`, `SearchStatus` ("Searching…" live region),
  `SearchBar`/`SearchInput` ("Discover", label, placeholder),
  `ResultsSkeleton` (aria-label), and the `ArtistResults` family
  (`ArtistHeader` "Band"/"listeners on Last.fm", `TrackCard`/`AlbumCard`
  labels and empty notes, `SimilarArtists` heading, `SimilarArtistCard`
  `aria-label`, `ArtistResults` region label).
- `src/lib/format.ts` hardcodes `en-US` grouping in `formatNumber` and
  hand-rolls "K"/"M" suffixes in `formatCount`.
- E2E specs (`e2e/search.spec.ts`, `discoveryLoop.spec.ts`,
  `errorStates.spec.ts`, `accessibility.spec.ts`) `goto("/")` and locate by
  English accessible names via `e2e/support/homePage.ts`;
  `e2e/support/mockArtistApi.ts` stubs `/api/artist` with fixture bodies,
  including error bodies shaped as `{ error: string }`.
- There is no proxy/middleware file and no cookie usage in the project.

## Proposed solution

**Locale model.** A shared `src/lib/i18n/` module owns the vocabulary:
`locales.ts` exports `LOCALES = ["en", "pt-BR"]`, `DEFAULT_LOCALE = "en"`,
`hasLocale(value)`, and `negotiateLocale(acceptLanguageHeader, cookieValue)`
— a pure function so the proxy stays thin and testable. Negotiation order:
valid cookie first, then any `pt*` entry in `Accept-Language` → `pt-BR`,
otherwise `en` (PRD R3/R4). The `Locale` and `Dictionary` types live in
`src/lib/i18n/types.ts`.

**Routing.** `layout.tsx`, `page.tsx`, `_components/`, and `_hooks/` move to
`src/app/[lang]/` (the root layout is nestable under the dynamic segment in
this Next.js version — verified in the bundled docs). `favicon.ico` and
`globals.css` stay in `src/app/`. The layout calls `notFound()` when
`hasLocale(lang)` fails (so `/fr` 404s), declares
`generateStaticParams()` returning both locales, and sets
`<html lang={lang}>`. `/api/artist` stays outside `[lang]` and is untouched
by routing.

**Proxy.** `src/proxy.ts` (Next 16 convention; `middleware` is deprecated)
exports `proxy(request)`: if the pathname already starts with a supported
locale, pass through; otherwise 307-redirect to
`/{negotiateLocale(...)}{pathname}` preserving search params, so
`/?q=Opeth` → `/en?q=Opeth` and old bookmarks keep working (PRD R5). The
`matcher` excludes `api`, `_next/static`, `_next/image`, and files with
extensions (favicon, images).

**Persistence.** The choice lives in a `top-tracks-locale` cookie
(`path=/`, `Max-Age` one year), written by the switcher on activation and
read only by the proxy. A URL prefix always outranks the cookie (PRD R5);
the cookie only decides redirects of unprefixed URLs.

**Dictionaries.** `src/lib/i18n/dictionaries/en.json` and `pt-BR.json`,
grouped by surface (`metadata`, `header`, `hero`, `search`, `empty`,
`results`, `errors`, `footer`). The brand tagline "band discovery" (site
header, footer colophon, metadata title) is part of the wordmark and stays
in English in both dictionaries (interview decision, 2026-07-29). `getDictionary.ts` (marked `server-only`)
lazy-imports the JSON per locale. The `Dictionary` type is derived from the
English file (`typeof en`), so a key missing from `pt-BR.json` is a
compile-time error — the PRD's "string drift" mitigation. Messages with
runtime values use `{placeholder}` syntax resolved by a tiny
`formatMessage(template, values)` helper (needed for the not-found message
and the listeners line).

**Delivery to components.** The `[lang]` layout awaits the dictionary and
wraps `children` in `LocaleProvider` (a client context provider in
`src/lib/i18n/` — shared infrastructure, used by components under both
`src/app/` and `src/components/`). Client components read strings with a
`useTranslation()` hook returning `{ dictionary, locale }` and throwing
outside the provider. Server components (`SiteHeader`, `PageFooter`) cannot
read context, so `page.tsx` passes them their dictionary slice as a prop.
Both patterns keep dictionary JSON out of the client bundle except the one
serialized copy the provider receives.

**Language switcher.** `LanguageSwitcher` (client, co-located in
`src/app/[lang]/_components/`, rendered by `SiteHeader`) shows two buttons,
"PT" and "EN", the active one marked with `aria-pressed` (PRD R2). On
activation it writes the cookie and calls `router.replace` with the current
pathname's locale segment swapped and the current query string (read at
click time from `window.location.search`) appended — so switching preserves
`?q=` and the on-screen results. Buttons are used instead of prerendered
links to avoid a `useSearchParams` dependency in the header, which sits
outside the existing `Suspense` boundary.

**Error codes.** `/api/artist` responses change from `{ error: string }` to
`{ code: ArtistLookupErrorCode }` with
`"missing-query" | "not-found" | "missing-api-key" | "upstream-error" |
"unexpected-error"` (type added to `src/lib/music/types.ts`). The API stays
language-agnostic (interview decision, 2026-07-29). `useArtistSearch`
replaces `errorMessage` with `errorCode`, adding `"network-error"` for fetch
failures and falling back to `"unexpected-error"` for malformed bodies.
`SearchStatus` gains a `query` prop and renders
`formatMessage(dictionary.errors[errorCode], { query })`.

**Number formatting.** `formatNumber(count, locale)` delegates to
`toLocaleString(locale)`; `formatCount(count, locale)` is rewritten on
`Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 })`
— "9.1M" in EN, "9,1 mi" in PT-BR (interview decision, 2026-07-29). Callers
(`ArtistHeader`, `TrackCard`, `AlbumCard`) take the locale from
`useTranslation()`.

**SEO metadata.** `buildMetadata(locale)` in `src/lib/i18n/metadata.ts`
returns the localized `title`/`description` plus `alternates.languages`
entries for `/en` and `/pt-BR`; the layout's `generateMetadata` just calls
it, keeping the layout a thin shell.

## Affected files

| File | Change | Purpose |
| ---- | ------ | ------- |
| `src/proxy.ts` | create | Locale detection + redirect for unprefixed URLs |
| `src/proxy.test.ts` | create | Unit tests for redirect/pass-through behavior |
| `src/lib/i18n/types.ts` | create | `Locale` and `Dictionary` types |
| `src/lib/i18n/locales.ts` | create | Locale list, `hasLocale`, `negotiateLocale` |
| `src/lib/i18n/locales.test.ts` | create | Negotiation and validation cases |
| `src/lib/i18n/getDictionary.ts` | create | Server-only dictionary loader |
| `src/lib/i18n/getDictionary.test.ts` | create | Loader + dictionary parity cases |
| `src/lib/i18n/dictionaries/en.json` | create | English strings |
| `src/lib/i18n/dictionaries/pt-BR.json` | create | Portuguese strings |
| `src/lib/i18n/formatMessage.ts` | create | `{placeholder}` interpolation |
| `src/lib/i18n/formatMessage.test.ts` | create | Interpolation cases |
| `src/lib/i18n/metadata.ts` | create | `buildMetadata(locale)` for the layout |
| `src/lib/i18n/metadata.test.ts` | create | Localized metadata cases |
| `src/lib/i18n/LocaleProvider.tsx` | create | Client context provider |
| `src/lib/i18n/LocaleProvider.test.tsx` | create | Provider cases |
| `src/lib/i18n/useTranslation.ts` | create | Context consumer hook |
| `src/lib/i18n/useTranslation.test.tsx` | create | Hook cases incl. missing provider |
| `src/app/[lang]/layout.tsx` | move + modify | Locale-aware root layout (from `src/app/layout.tsx`) |
| `src/app/[lang]/page.tsx` | move + modify | Loads dictionary, passes slices (from `src/app/page.tsx`) |
| `src/app/[lang]/page.test.tsx` | move + modify | Home-screen behavior under a locale |
| `src/app/[lang]/_components/LanguageSwitcher.tsx` | create | PT/EN toggle in the header |
| `src/app/[lang]/_components/LanguageSwitcher.test.tsx` | create | Switcher cases |
| `src/app/[lang]/_components/SiteHeader.tsx` | move + modify | Dict slice via props; hosts the switcher |
| `src/app/[lang]/_components/SiteHeader.test.tsx` | move + modify | Localized header cases |
| `src/app/[lang]/_components/PageHeader.tsx` | move + modify | Hero copy from dictionary |
| `src/app/[lang]/_components/PageHeader.test.tsx` | move + modify | Localized hero cases |
| `src/app/[lang]/_components/PageFooter.tsx` | move + modify | Dict slice via props |
| `src/app/[lang]/_components/PageFooter.test.tsx` | move + modify | Localized footer cases |
| `src/app/[lang]/_components/EmptyState.tsx` | move + modify | Copy via `useTranslation` |
| `src/app/[lang]/_components/EmptyState.test.tsx` | move + modify | Localized empty-state cases |
| `src/app/[lang]/_components/SearchStatus.tsx` | move + modify | `errorCode` + `query` props; localized errors |
| `src/app/[lang]/_components/SearchStatus.test.tsx` | move + modify | Error-mapping cases |
| `src/app/[lang]/_components/HomeSearch.tsx` | move + modify | Locale-prefixed `router.push`; passes `errorCode`/`query` |
| `src/app/[lang]/_components/HomeSearch.test.tsx` | move + modify | Navigation keeps the locale prefix |
| `src/app/[lang]/_components/HomeSearchFallback.tsx` | move | Unchanged apart from imports |
| `src/app/[lang]/_components/HomeSearchFallback.test.tsx` | move + modify | Wrapped in provider |
| `src/app/[lang]/_components/ResultsSkeleton.tsx` | move + modify | Localized `aria-label` |
| `src/app/[lang]/_components/ResultsSkeleton.test.tsx` | move + modify | Localized label case |
| `src/app/[lang]/_components/*` (remaining: `HeroSection`, `SkeletonBar`, logos) + tests | move | Path move only |
| `src/app/[lang]/_hooks/useArtistSearch.ts` | move + modify | `errorCode` instead of `errorMessage` |
| `src/app/[lang]/_hooks/useArtistSearch.test.ts` | move + modify | Code-mapping cases |
| `src/app/api/artist/route.ts` | modify | Return `{ code }` instead of `{ error }` |
| `src/app/api/artist/route.test.ts` | create | First tests for all four branches |
| `src/lib/music/types.ts` | modify | Add `ArtistLookupErrorCode` |
| `src/lib/format.ts` | modify | Locale-aware `formatNumber`/`formatCount` |
| `src/lib/format.test.ts` | modify | Cases for both locales |
| `src/components/SearchBar/SearchBar.tsx` + `SearchInput.tsx` | modify | Label, placeholder, button copy via `useTranslation` |
| `src/components/SearchBar/*.test.tsx` | modify | Localized cases, provider wrapper |
| `src/components/ArtistResults/*` (header, cards, similar, region label) | modify | Copy + counts via `useTranslation` |
| `src/components/ArtistResults/*.test.tsx` | modify | Localized cases, provider wrapper |
| `vitest.config.ts` | modify | Coverage exclusion path for the moved layout |
| `e2e/i18n.spec.ts` | create | Language-selection journey |
| `e2e/support/mockArtistApi.ts` | modify | Error fixtures return `{ code }` |
| `e2e/search.spec.ts`, `errorStates.spec.ts`, `discoveryLoop.spec.ts`, `accessibility.spec.ts` | modify | Locale-prefixed URLs where asserted |

## Third-party libraries

None beyond the existing stack. The Context7 MCP tools are not available in
this environment, so every Next.js API was verified against the bundled docs
in `node_modules/next/dist/docs/` (Next 16.2.10):

- `proxy.ts` replaces the deprecated `middleware` convention; the file lives
  in `src/`, exports a `proxy` function and an optional `config.matcher`
  (`01-app/03-api-reference/03-file-conventions/proxy.md`).
- The i18n guide prescribes `app/[lang]/` segments, `params` as an awaited
  promise, the globally available `PageProps<'/[lang]'>` /
  `LayoutProps<'/[lang]'>` helpers, `generateStaticParams`, and nesting the
  root layout under `[lang]`
  (`01-app/02-guides/internationalization.md`).
- Locale negotiation needs no library: the PRD reduces it to "any `pt*` →
  pt-BR, else en", so `@formatjs/intl-localematcher`/`negotiator` from the
  guide's example are unnecessary.
- Number formatting uses the platform `Intl.NumberFormat` (compact
  notation); no library.

## Testing approach

### Unit tests (Vitest + Testing Library)

#### `src/lib/i18n/locales.test.ts`

- `hasLocale` accepts `"en"` and `"pt-BR"`, rejects `"fr"`, `"pt"`, `""`
- `negotiateLocale` returns the cookie locale when the cookie holds a
  supported value, regardless of the header
- ignores an unsupported cookie value and falls through to the header
- returns `pt-BR` for headers preferring `pt`, `pt-BR`, or `pt-PT`
- returns `en` for an English, unsupported, malformed, or absent header

#### `src/proxy.test.ts`

- redirects `/` to `/en` with no cookie and no language preference
- redirects `/` to `/pt-BR` when `Accept-Language` prefers Portuguese
- redirects `/` to the cookie's locale, overriding the header
- preserves the query string: `/?q=Opeth` redirects to `/en?q=Opeth`
- passes through `/en` and `/pt-BR?q=Opeth` without redirecting
- redirects with a 307 status so bookmarks are not permanently rewritten

#### `src/lib/i18n/getDictionary.test.ts`

- returns the English strings for `"en"` and Portuguese for `"pt-BR"`
- both dictionaries expose the exact same key paths (parity walk — the
  runtime backstop behind the compile-time `Dictionary` type)

#### `src/lib/i18n/formatMessage.test.ts`

- replaces a single `{placeholder}` with its value
- replaces multiple distinct placeholders in one template
- leaves a placeholder literal when no value is provided
- returns a template with no placeholders unchanged

#### `src/lib/i18n/metadata.test.ts`

- returns the localized description for `"en"` and `"pt-BR"`
- keeps the title "TopTracks — band discovery" identical in both locales
  (untranslated wordmark)
- includes `alternates.languages` entries for both locale paths

#### `src/lib/i18n/LocaleProvider.test.tsx` / `useTranslation.test.tsx`

- children receive the provided dictionary and locale via the hook
- `useTranslation` outside a provider throws a descriptive error

#### `src/lib/format.test.ts`

- `formatNumber` groups as `1,213,400` for `en` and `1.213.400` for `pt-BR`
- `formatCount` keeps values under 1,000 unformatted in both locales
- `formatCount` renders `12.3K` / `1.2M` for `en`
- `formatCount` renders `12,3 mil` / `1,2 mi` for `pt-BR`
- `formatCount` drops the trailing zero (`1M`, not `1.0M`)

#### `src/app/api/artist/route.test.ts`

- missing `q` responds 400 with `{ code: "missing-query" }`
- an unmatched artist responds 404 with `{ code: "not-found" }`
- a missing API key responds 502 with `{ code: "missing-api-key" }`
- a Last.fm failure responds 502 with `{ code: "upstream-error" }`
- an unexpected error responds 500 with `{ code: "unexpected-error" }`
- a successful lookup responds 200 with the lookup result unchanged

#### `src/app/[lang]/_hooks/useArtistSearch.test.ts` (modified cases)

- a non-ok response surfaces the body's `code` as `errorCode`
- a non-ok response without a parsable code yields `"unexpected-error"`
- a fetch rejection yields `"network-error"`
- success and loading states expose a null `errorCode`

#### `src/app/[lang]/_components/LanguageSwitcher.test.tsx`

- renders "PT" and "EN" options
- marks the active locale with `aria-pressed="true"` and the other false
- activating the inactive locale navigates to the same path and query with
  the locale segment swapped
- activating writes the `top-tracks-locale` cookie
- activating the already-active locale does not navigate
- both options are focusable and activatable via keyboard

#### `src/app/[lang]/_components/SearchStatus.test.tsx` (modified cases)

- renders the localized message for each error code, in `en` and `pt-BR`
- interpolates the query into the not-found message
- renders the localized "Searching…" live region text while loading

#### `src/app/[lang]/_components/HomeSearch.test.tsx` (modified cases)

- searching pushes `/{locale}?q=<artist>`, keeping the active locale prefix

#### Component tests (modified: `PageHeader`, `EmptyState`, `PageFooter`, `SiteHeader`, `ResultsSkeleton`, `SearchBar`, `SearchInput`, `ArtistHeader`, `TrackCard`, `AlbumCard`, `SimilarArtists`, `SimilarArtistCard`, `ArtistResults`, `page`)

- each renders its Portuguese copy when given the `pt-BR` dictionary (via
  provider or prop slice) — one case per component asserting a
  representative string or accessible name
- each keeps its English copy under `en` (existing assertions, now routed
  through the dictionary)
- `ArtistHeader` renders the listeners line with locale-grouped digits
- `TrackCard`/`AlbumCard` render locale-compact playcounts
- API-sourced content (artist, track, album names, tags) renders unchanged
  in both locales
- `SiteHeader` and `PageFooter` keep the "band discovery" tagline in
  English under `pt-BR` (untranslated wordmark)

### E2E tests (Playwright)

#### `e2e/i18n.spec.ts`

- visiting `/` with a default (English) browser redirects to `/en` and shows
  the English hero
- visiting `/` with a `pt-BR` browser locale redirects to `/pt-BR` and shows
  the Portuguese hero
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

#### Existing specs (modified)

- `search.spec.ts` / `discoveryLoop.spec.ts` / `errorStates.spec.ts` keep
  passing through the `/` → `/en` redirect; URL assertions gain the `/en`
  prefix; error mocks emit `{ code }` bodies
- `accessibility.spec.ts` additionally scans the `/pt-BR` home and results
  states for violations

### Coverage expectation

Every new module in `src/lib/i18n/`, `src/proxy.ts`, and the rewritten
`src/lib/format.ts` is exercised across all branches above, so they land at
~100%. `route.ts` gains its first test file covering all response branches.
Component coverage is preserved by updating the existing co-located tests in
place. Intentionally uncovered: `src/app/[lang]/layout.tsx` stays in the
vitest coverage exclusion (framework shell — its logic lives in the tested
`metadata.ts` and `locales.ts` helpers) and the dictionary JSON files (data,
no runtime). Overall coverage stays above 80%.

## Rollout & risks

Single PR, no flag — the URL scheme change is atomic (half-migrated routes
would 404). The riskiest edge is the redirect of legacy URLs: `/` and
`/?q=…` bookmarks must land on the locale-prefixed equivalents, covered by
six proxy unit cases and the E2E redirect cases; using 307 (not 308) keeps
browsers from caching a locale permanently. The `/api/artist` contract
change (`error` → `code`) is internal — the hook and the E2E mocks are
updated in the same PR, and no external consumer exists. String drift is
mitigated structurally: the `Dictionary` type derived from `en.json` makes
an incomplete `pt-BR.json` a compile-time error, backed by the runtime
parity test. Portuguese copy is reviewed by the project owner before merge
(PRD risk). No cleanup steps; the cookie is new.

## Open questions

None — the tagline question was answered during review: "band discovery"
stays in English in both locales as part of the brand wordmark.
