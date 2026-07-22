---
name: e2e-testing
description: End-to-end testing best practices for the top-tracks project (Playwright). Use whenever writing or editing an E2E test (e2e/*.spec.ts) or its support helpers.
---

<critical>
Before writing or editing any E2E test, you MUST read every file in the
`references/` folder of this skill:

- `references/good-examples.spec.ts`
- `references/bad-examples.spec.ts`

These references show the exact testing patterns to follow and to avoid. Do not
skip them, even if the rules below seem self-explanatory.
</critical>

# E2E Testing

The project uses **Playwright** (`@playwright/test`). Specs live in
`e2e/*.spec.ts`; shared locators, actions, and network mocks live in
`e2e/support/`. Run with `npm run test:e2e` (or `test:e2e:ui` /
`test:e2e:headed` while debugging). These practices are hard requirements, not
suggestions.

## Rules

1. **Test user journeys, not pages.** Each spec file covers one product flow
   (searching, the discovery loop, failing honestly), and each test walks it
   the way a user does — through the UI, asserting what the user sees. Never
   assert on internal state, CSS classes, or markup nesting.
2. **Locate by role and accessible name.** Use `getByRole`, `getByLabelText`,
   `getByText`. Avoid CSS selectors, XPath, and `data-testid`: a locator should
   break when the experience breaks, not when a class name changes. Bonus: if a
   role-based locator can't find an element, that is an accessibility bug worth
   fixing in the component, not in the test.
3. **Web-first assertions, never sleeps.** `expect(locator).toBeVisible()` and
   friends auto-retry until the assertion holds. Never use
   `page.waitForTimeout`, manual polling, or fixed delays — they are the number
   one source of slow, flaky suites. If you need to wait, wait *for something*
   (a locator state, a response), not for time.
4. **Mock the network at the boundary.** Stub external APIs with `page.route`
   so the suite is offline and deterministic — live data that changes can never
   turn a passing test red, and error paths become testable on demand. Mock at
   your own API route (`/api/...`), not deep inside third-party calls.
5. **Independent, isolated tests.** Every test does its own setup (mock, then
   `goto`) and must pass alone, in any order, and in parallel. No shared
   mutable state, no test that depends on a previous test's navigation or
   data, no `test.describe.serial` to paper over coupling.
6. **Share helpers, not copy-paste.** Locators and multi-step actions used by
   more than one test belong in `e2e/support/` (e.g. `homePage.ts`,
   `mockArtistApi.ts`). Fixture data is typed and centralized (`artists.ts`),
   never inlined ad hoc per test.
7. **Descriptive, user-facing names.** Each `test` reads as a sentence about
   what the user gets: `test("answers a search with the top track...")`. Group
   a flow's tests in a `test.describe` named for the flow. Not `test("test 1")`
   or `test("search works")`.
8. **Cover loading, empty, and error states.** The skeleton, the not-found
   message, the upstream-failure alert — each is a first-class test, not an
   afterthought. E2E is where these states are most honestly verified.
9. **No logic in tests.** No `if`/`else`, loops over cases, or `try`/`catch`
   inside a test body. A test is a straight line: set up, act, assert. Branches
   mean you don't know what the test verifies on a given run.
10. **Keep E2E lean.** Playwright tests are the most expensive tests in the
    project — reserve them for critical flows and cross-cutting behavior
    (hierarchy, a11y, mobile). Fine-grained cases (formatting, prop
    permutations, unit edge cases) belong in Vitest under the `unit-testing`
    skill.

## References

For fuller, annotated examples see the `references/` folder:

- [`references/good-examples.spec.ts`](references/good-examples.spec.ts) —
  tests that follow every rule.
- [`references/bad-examples.spec.ts`](references/bad-examples.spec.ts) — a
  catalogue of E2E anti-patterns, each annotated with the rule it breaks and
  how to fix it.
