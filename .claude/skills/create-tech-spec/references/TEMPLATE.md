---
feature: <feature-name-in-kebab-case>
prd: docs/prds/<feature-name-in-kebab-case>.md
status: draft
created: <YYYY-MM-DD>
---

# Tech spec: <Feature name>

## Overview

<!-- One or two paragraphs: what is being built (from the PRD) and the shape
of the technical solution. A reader should understand the approach without
opening any other section. -->

## Current state

<!-- What exists in the codebase today that this feature touches: components,
hooks, routes, data access, utilities. Reference real paths (src/...). This
section proves the exploration happened — it is never generic. -->

## Proposed solution

<!-- The how. Describe the data flow end to end and the responsibilities of
each piece. Subsections are free-form here (e.g. "Data flow", "State
ownership", "Error handling"), but the section must answer every technical
question a reviewer would ask before approving. -->

## Affected files

<!-- A table of every file created or modified, with its role. Follow the
`folder-structure` skill for placement. Every source file listed must have
its test file listed too. -->

| File | Change | Purpose |
| ---- | ------ | ------- |
| `src/...` | create / modify | <!-- one line --> |

## Third-party libraries

<!-- Libraries this feature depends on and the specific APIs used, verified
via Context7 (or node_modules/next/dist/docs/ for Next.js). Note the version
and anything that differs from common knowledge. "None beyond the existing
stack" is a valid entry. -->

## Testing approach

<!-- The exhaustive list of test cases that keeps coverage above 80%. Group
by test file. Each case is one line: the behavior it asserts, phrased so a
developer can write the test from the line alone. Cover every acceptance
criterion in the PRD, plus loading, empty, error, and edge states. -->

### Unit tests (Vitest + Testing Library)

#### `src/.../<Name>.test.tsx`

- <!-- test case -->

### E2E tests (Playwright)

#### `e2e/<flow>.spec.ts`

- <!-- test case -->

### Coverage expectation

<!-- Which modules the cases above cover and why that clears 80%. Name any
intentionally uncovered code and justify it. -->

## Rollout & risks

<!-- How the change ships (single PR? behind a flag?), what could break, and
the mitigation. Include migration or cleanup steps if any. -->

## Open questions

<!-- Everything still unresolved after the interview. Each entry is a real
question awaiting a real answer — never a disguised assumption. -->
