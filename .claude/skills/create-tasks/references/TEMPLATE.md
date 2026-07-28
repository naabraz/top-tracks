---
feature: <feature-name-in-kebab-case>
prd: docs/prds/<feature-name-in-kebab-case>.md
tech-spec: docs/tech-specs/<feature-name-in-kebab-case>.md
status: draft
created: <YYYY-MM-DD>
---

# Tasks: <Feature name>

## Overview

<!-- One paragraph: the feature (from the PRD), the shape of the solution
(from the tech spec), and how the tasks below slice it into reviewable
increments. -->

## Approved high-level tasks

<!-- The numbered high-level list exactly as the user approved it in the
conversation, one line per task. This section is the record of the approval
gate — the file only exists because this list was approved first. -->

1. <!-- task name — one-line deliverable -->

## Task breakdown

<!-- One subsection per task, in delivery order, numbered to match the
approved list. Every file named must come from the tech spec's "Affected
files"; every test case must come from its "Testing approach". -->

### Task <n>: <Task name>

**Deliverable:** <!-- the concrete, observable outcome that marks the task
done — the behavior that exists afterwards, with its tests passing. -->

**Depends on:** <!-- "Task <m>" or "Nothing — can start immediately". -->

**Files:**

<!-- The subset of the tech spec's "Affected files" this task touches. -->

- `src/...` — create / modify

**Test cases:**

<!-- All test cases from the tech spec's "Testing approach" that relate to
this task's functionality, grouped by test file. Together they must cover
the PRD acceptance criteria this task fulfills plus its loading, empty,
error, and edge states. -->

- `src/.../<name>.test.ts`
  - <!-- test case -->

**Business goal:** <!-- the PRD requirement or acceptance criterion this
task fulfills, and which of the cases above prove it. -->

## Test coverage check

<!-- Prove the mapping is complete: every test case in the tech spec's
"Testing approach" is assigned to exactly one task above, and no task's
functionality has cases it does not list. Name the task each test file's
cases landed in. -->

| Tech spec test file | Task |
| ------------------- | ---- |
| `src/...` | Task <n> |

## Open questions

<!-- Everything still unresolved after the approval conversation. Each entry
is a real question awaiting a real answer — never a disguised assumption. -->
