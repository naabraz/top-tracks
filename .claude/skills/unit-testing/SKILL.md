---
name: unit-testing
description: Unit-testing best practices for the top-tracks project (Vitest + Testing Library). Use whenever writing or editing a test file (*.test.ts / *.test.tsx).
---

<critical>
Before writing or editing any test, you MUST read every file in the
`references/` folder of this skill:

- `references/good-examples.test.ts`
- `references/bad-examples.test.ts`

These references show the exact testing patterns to follow and to avoid. Do not
skip them, even if the rules below seem self-explanatory.
</critical>

# Unit Testing

The project uses **Vitest** and **Testing Library**. Every component, hook,
module, and utility must have a matching test file (see the Testing rule in
`CLAUDE.md`). These practices are hard requirements, not suggestions.

## Rules

1. **Test behavior, not implementation.** Assert on observable output and
   effects, not on private internals, call order, or state variable names. A
   valid refactor must not break the test.
2. **Descriptive test names.** Each `it` reads as a sentence describing the
   expected behavior: `it("returns null when the artist is not found")`. Not
   `it("works")` or `it("test 1")`.
3. **Arrange–Act–Assert.** Structure every test in three clear phases: set up
   inputs and mocks, run the code under test once, then assert.
4. **One behavior per test.** Each test verifies a single behavior. Cover
   separate cases in separate `it` blocks rather than piling unrelated
   assertions together.
5. **Isolate tests.** No shared mutable state between tests. Reset mocks in
   `afterEach` (`vi.restoreAllMocks()`) so order never matters.
6. **Mock external dependencies.** Stub network, APIs, time, and randomness with
   `vi.mock` / `vi.stubGlobal`. Tests must be deterministic and offline.
7. **Cover edge cases and errors.** Test the not-found path, empty input, and
   thrown errors — not just the happy path.
8. **Query by role and accessible name.** For components prefer
   `getByRole`, `getByLabelText`, `getByText`. Avoid `data-testid` and querying
   by class or DOM structure.

## References

For fuller, annotated examples see the `references/` folder:

- [`references/good-examples.test.ts`](references/good-examples.test.ts) — tests
  that follow every rule.
- [`references/bad-examples.test.ts`](references/bad-examples.test.ts) — a
  catalogue of testing anti-patterns, each annotated with the rule it breaks and
  how to fix it.
