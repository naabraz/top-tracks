# BAD STRUCTURE — layout anti-patterns. Do NOT copy these.

Each block violates a folder-structure rule and is annotated with the rule it
breaks and how to fix it.

## ❌ RULE 2 — Separate `__tests__` folder

Tests are pulled away from the source they cover.

```
src/components/
├── __tests__/              # ❌ don't
│   └── MediaCard.test.tsx
└── MediaCard.tsx
```

**Fix:** put the test next to the source.

```
src/components/MediaCard/
├── MediaCard.tsx
└── MediaCard.test.tsx      # ✅ co-located
```

## ❌ RULE 1 — A component's files scattered across type-based folders

The pieces of one component are split by file type, so no single folder tells
you what MediaCard is made of.

```
src/
├── components/MediaCard.tsx
├── styles/MediaCard.module.css   # ❌ owned by MediaCard but elsewhere
├── hooks/useCardHover.ts         # ❌ used only by MediaCard but elsewhere
└── tests/MediaCard.test.tsx      # ❌ and again elsewhere
```

**Fix:** co-locate them all in `src/components/MediaCard/` (see good-structure).

## ❌ RULE 4 — Screen-only components dumped in a global folder

Components used by a single screen are placed in the shared `components/` tree,
mixing app-wide and screen-specific concerns.

```
src/
├── app/artist/[name]/page.tsx
└── components/
    ├── ArtistHeader.tsx    # ❌ used only by the artist screen
    └── SimilarList.tsx     # ❌ same
```

**Fix:** co-locate under the route in a private folder:
`src/app/artist/[name]/_components/ArtistHeader/…`. Promote to
`src/components/` only if a second screen starts using it (rule 5).

## ❌ RULE 5 — Premature centralization

A one-off component is placed in a shared folder "just in case", adding
indirection with no reuse.

```
src/components/ArtistPageOnlyBanner/   # ❌ used by exactly one screen
```

**Fix:** keep it co-located with the screen until a real second consumer exists.

## ❌ RULE 6 — Hook separated from its only consumer

A hook used solely by one component lives in a global `hooks/` folder.

```
src/
├── components/MediaCard/MediaCard.tsx
└── hooks/useCardHover.ts   # ❌ only MediaCard uses it
```

**Fix:** move it into the component folder
(`src/components/MediaCard/useCardHover.ts` + its test). Only genuinely shared
hooks belong in a shared location.
