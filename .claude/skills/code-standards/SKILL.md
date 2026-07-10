---
name: code-standards
description: General code quality standards for the top-tracks project (language, size limits, naming, control flow, type placement). Use whenever writing or editing any source code.
---

<critical>
Before writing or editing any source code in this project, you MUST read every
file in the `references/` folder of this skill:

- `references/good-examples.ts`
- `references/bad-examples.ts`

These references show the exact patterns to follow and to avoid. Do not skip
them, even if the rules below seem self-explanatory.
</critical>

# Code Standards

These rules apply to all source code in the project. They are hard requirements,
not suggestions.

## Rules

1. **English only.** All code — identifiers, comments, strings meant for
   developers, commit messages, and documentation — must be written in English.
2. **Methods under 30 lines.** No method or function body may exceed 30 lines.
   If it grows longer, extract helpers.
3. **At most 3 parameters.** A function takes no more than three parameters. If
   you need more, group them into a single options object (which then lives in
   its own type — see rule 8).
4. **Function names start with a verb.** Name functions after the action they
   perform: `getArtist`, `fetchTopTrack`, `formatCount`, `useArtistSearch`. Not
   `artist`, `topTrack`, `data`.
5. **At most 2 levels of if/else.** Do not nest conditionals more than two
   levels deep. Flatten with early returns, guard clauses, or extracted
   functions.
6. **No switch/case.** Use lookup maps or early returns instead of `switch`.
7. **Descriptive, unambiguous variable names.** Names must state what the value
   is. Avoid `d`, `tmp`, `data2`, `x`. Prefer `artistName`, `topTrackImageUrl`,
   `isLoading`.
8. **One type/interface per file, or in `types`.** Every type or interface lives
   in its own file or inside a `types.ts` (or `types/`) module. Do not scatter
   shared type declarations inside unrelated implementation files.

## References

For fuller, annotated examples see the `references/` folder:

- [`references/good-examples.ts`](references/good-examples.ts) — code that
  follows every rule.
- [`references/bad-examples.ts`](references/bad-examples.ts) — a catalogue of
  anti-patterns, each annotated with the rule it breaks and how to fix it.
