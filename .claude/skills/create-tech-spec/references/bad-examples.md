# Tech spec anti-patterns

A catalogue of fragments from bad tech specs. Each example names the rule it
breaks (from `SKILL.md`) and how to fix it.

---

## 1. Spec written without the PRD

> # Tech spec: Recent searches
>
> Based on our conversation, users want to see past searches, so we'll add a
> hook and a component. We can align on the details later.

**Breaks rule 1 (the PRD is the mandatory input).** "Based on our
conversation" means the reviewed requirements were skipped and the spec is
anchored to memory of a chat. **Fix:** stop and ask for the PRD path; derive
every requirement and acceptance criterion from the PRD file.

---

## 2. Generic "Current state" that proves no exploration

> ## Current state
>
> The project is a standard Next.js app with components, hooks, and tests.
> The feature will integrate with the existing search functionality.

**Breaks rule 2 (explore the project before asking anything).** This
paragraph could describe any project on earth; it names no file and no
seam the feature will touch. **Fix:** read the code first and cite real
paths and behaviors ("`useArtistSearch.ts` already distinguishes `success`
from `not-found`").

---

## 3. Assumptions instead of an interview

> **State ownership.** We'll assume history should sync across tabs, so the
> hook uses a `storage` event listener. We'll also cap the list at 10, which
> feels like a reasonable number.

**Breaks rule 3 (interview, never assume).** Two decisions were invented —
one contradicting a PRD non-goal (no sync) and one contradicting a PRD
criterion (cap of 5). Both would get built. **Fix:** interview the user
before generating; record decisions with their source ("interview decision,
2026-07-22") or move genuinely open points to "Open questions".

---

## 4. Library APIs from memory

> ## Third-party libraries
>
> Next.js: we'll use `getServerSideProps` on the home page to hydrate the
> history server-side.

**Breaks rule 4 (use Context7 for third-party library questions).** This
project's Next.js version does not work the way training data remembers
(`AGENTS.md` warns exactly about this); `getServerSideProps` is Pages
Router API. **Fix:** verify the API via Context7 or
`node_modules/next/dist/docs/` before writing it into the spec.

---

## 5. Reshaped template

> # Recent searches — engineering one-pager
>
> ## TL;DR
>
> ## Architecture Decision Record
>
> ## Test strategy (see QA doc)

**Breaks rule 5 (follow the template exactly).** Custom section names mean a
reader can no longer open any tech spec in `docs/tech-specs/` and know where
everything lives — and the testing section was outsourced to a document that
does not exist. **Fix:** use the sections from `references/TEMPLATE.md`, in
order, with their exact headings.

---

## 6. Decorative testing approach

> ## Testing approach
>
> We will add unit tests for the hook and the component, and an E2E test for
> the happy path. Coverage should be above 80%.

**Breaks rule 8 (the testing approach is exhaustive, not decorative).** No
developer can turn "add unit tests for the hook" into test files; error,
empty, and edge states are absent; and "should be above 80%" is a hope, not
a plan. **Fix:** enumerate concrete cases grouped by test file — one line
per behavior — covering every acceptance criterion plus loading, empty,
error, and edge states, and explain why those cases clear 80%.

---

## 7. Happy-path-only test cases

> #### `src/hooks/useRecentSearches.test.ts`
>
> - adds an artist to the list
> - clears the list

**Breaks rule 8 (cover error, empty, and edge states).** Two happy-path
cases cannot keep coverage above 80% for a hook whose main complexity is
dedupe, the 5-entry cap, and three storage-failure branches — the branches
most likely to break in production are exactly the untested ones. **Fix:**
add cases for every branch: dedupe (including case-insensitivity), cap
overflow, malformed JSON, unavailable storage, write failure.

---

## 8. Implementation smuggled into the spec

> ## Proposed solution
>
> I went ahead and created the hook so we can validate the approach:
>
> ```ts
> // src/hooks/useRecentSearches.ts — already committed
> export function useRecentSearches() { ... }
> ```

**Breaks rule 10 (stop for review — never implement).** The spec exists to
be reviewed *before* code exists; "already committed" inverts the process
and turns review into a formality. Illustrative type signatures are fine —
shipped files are not. **Fix:** delete the implementation, finish the spec,
and wait for the user to approve it and ask for implementation.

---

## 9. Lifecycle and source PRD untracked

> # Tech spec: Recent searches (final, based on the PRD we discussed)

**Breaks rule 7 (frontmatter tracks the lifecycle and the source PRD).**
"The PRD we discussed" is not a path, and "final" in a title is not a
state. **Fix:** keep the title clean and put `feature`, `prd`, `status`, and
`created` in frontmatter; only the user moves `status` forward.
