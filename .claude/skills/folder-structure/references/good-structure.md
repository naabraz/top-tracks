# GOOD STRUCTURE — layouts that follow the folder-structure rules

Everything a unit owns is co-located; test files sit next to their source
(`Name.tsx` + `Name.test.tsx`), never in a `__tests__/` folder.

## ✅ A reusable component is a folder

Source, test, styles, a private sub-component, and a component-only hook all live
together. `index.ts` re-exports for clean imports.

```
src/components/
└── MediaCard/
    ├── MediaCard.tsx          # component source
    ├── MediaCard.test.tsx     # test right next to the source (rule 2)
    ├── MediaCard.module.css   # component-only styles (rule 1)
    ├── CardImage.tsx          # private sub-component used only by MediaCard
    ├── CardImage.test.tsx
    ├── useCardHover.ts        # hook used only by MediaCard (rule 6)
    ├── useCardHover.test.ts
    └── index.ts               # export { MediaCard } from "./MediaCard"
```

Import it cleanly:

```ts
import { MediaCard } from "@/components/MediaCard";
```

## ✅ A screen is a route folder with a private `_components` folder

Components used by only one screen are co-located inside the route in a
private (`_`-prefixed) folder so Next.js does not treat them as routes (rule 4).

```
src/app/
├── page.tsx                   # home screen
├── page.test.tsx
└── artist/
    └── [name]/
        ├── page.tsx           # the artist screen
        ├── page.test.tsx
        └── _components/       # co-located, screen-only (not a route)
            ├── ArtistHeader/
            │   ├── ArtistHeader.tsx
            │   └── ArtistHeader.test.tsx
            └── SimilarList/
                ├── SimilarList.tsx
                └── SimilarList.test.tsx
```

## ✅ Only truly shared code is lifted out

A component or hook is promoted to a shared location only once more than one
screen uses it (rule 5).

```
src/
├── components/                # shared across screens
│   └── SearchBar/
│       ├── SearchBar.tsx
│       └── SearchBar.test.tsx
└── lib/                       # shared non-UI logic + its own tests
    ├── format.ts
    ├── format.test.ts
    └── music/
        ├── types.ts           # shared types live here (see code-standards)
        ├── lookup.ts
        └── lookup.test.ts
```
