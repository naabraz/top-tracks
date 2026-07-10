---
name: folder-structure
description: How to place files and folders in this Next.js (App Router) + React project — co-location and test-file placement. Use whenever creating a component, screen, hook, or deciding where a file goes.
---

<critical>
Before creating any file or folder, or deciding where something goes, you MUST
read every file in the `references/` folder of this skill:

- `references/good-structure.md`
- `references/bad-structure.md`

These references show the exact layout to follow and to avoid. Do not skip them,
even if the rules below seem self-explanatory.
</critical>

# Folder Structure

This is a Next.js **App Router** + React project. These rules are hard
requirements, not suggestions.

## Rules

1. **Co-locate everything an item owns.** All files that belong to a single
   component or screen — its source, test, styles, sub-components, and
   component-only hooks — live inside that component's/screen's own folder.
   Looking at one folder should tell you everything that unit is made of.
2. **No `__tests__` folders.** The test file sits directly next to its source
   with the matching name: `Button.tsx` and `Button.test.tsx` in the same
   folder — never a separate `__tests__/` directory.
3. **One folder per component.** A reusable component is a folder named after it
   containing at least `Component.tsx` + `Component.test.tsx` (plus its styles,
   sub-components, and hooks when it has them). An optional `index.ts` may
   re-export it for clean imports.
4. **Screens are route folders.** A screen lives in its App Router segment under
   `src/app/<route>/`. Components used by only that screen are co-located inside
   it in a **private folder** (`_components/`, underscore-prefixed) so Next.js
   does not treat them as routes.
5. **Only truly shared code is lifted out.** Promote a component or hook to a
   shared location (`src/components/`, `src/lib/`) only when more than one
   screen/component uses it. Do not pre-emptively centralize.
6. **Hooks follow their owner.** A hook used by a single component is co-located
   with it (`useToggle.ts` + `useToggle.test.ts` inside the folder). Only shared
   hooks go in a shared `hooks`/`lib` location.

## References

For fuller, annotated examples see the `references/` folder:

- [`references/good-structure.md`](references/good-structure.md) — layouts that
  follow every rule.
- [`references/bad-structure.md`](references/bad-structure.md) — a catalogue of
  layout anti-patterns, each annotated with the rule it breaks and how to fix it.
