# Task list anti-patterns

A catalogue of fragments from bad task lists. Each example names the rule it
breaks (from `SKILL.md`) and how to fix it.

---

## 1. Tasks derived from one document (or none)

> # Tasks: Recent searches
>
> Based on the PRD (the tech spec isn't written yet, but the approach is
> obvious), the tasks are: build the hook, build the component, wire it up.

**Breaks rule 1 (the PRD and the tech spec are both mandatory inputs).**
Without the tech spec there are no affected files and no test cases to
distribute — every task below this line is guesswork about the *how*.
**Fix:** stop and ask for the tech spec path; if it does not exist yet, the
`create-tech-spec` skill comes first.

---

## 2. File created before the approval gate

> I've gone ahead and saved `docs/tasks/recent-searches.md` with my proposed
> breakdown — let me know if you'd like any changes!

**Breaks rule 2 (get the high-level task list approved before creating any
file).** The file exists before the user saw the high-level list, so the
approval became a formality over a fait accompli. **Fix:** present the
numbered high-level list in the conversation, wait for explicit approval
(re-presenting after any adjustment), and only then create the file.

---

## 3. Vague deliverable

> ### Task 1: Search history
>
> **Deliverable:** Work on the recent-searches functionality and make good
> progress on the hook.

**Breaks rule 6 (every task has a well-defined deliverable).** "Work on"
and "good progress" never finish — no reviewer can say when this task is
done. **Fix:** name the observable outcome and its files: "the
`useRecentSearches` hook persisting a deduplicated, capped list, with its
test file passing".

---

## 4. Task without test cases

> ### Task 2: RecentSearches component
>
> **Deliverable:** The presentational list component.
>
> **Test cases:** Will be added in a later hardening task once the UI
> settles.

**Breaks rule 7 (every task carries the tests that prove it).** A task with
deferred tests has no definition of done and no proof of its business goal
— and "later hardening tasks" are the first thing cut. **Fix:** list the
component's cases from the tech spec in this task; a task without test
cases cannot enter the list.

---

## 5. Test cases dropped in the mapping

> ### Task 1: useRecentSearches hook
>
> **Test cases:**
>
> - `src/hooks/useRecentSearches.test.ts`
>   - adds an artist to the list
>   - clears the list

**Breaks rule 8 (every test case belongs to a task's functionality).** The
tech spec lists twelve cases for this hook — dedupe, cap, and three
storage-failure branches among them — and ten silently vanished, so the
branches most likely to break ship unproven. **Fix:** carry over *all* of
the tech spec's cases for the functionality, and expose any gap in the
"Test coverage check" section instead of hiding it.

---

## 6. Tests hoarded in a final "testing task"

> ### Task 4: Write all the tests
>
> **Deliverable:** Unit and E2E tests for everything built in Tasks 1–3.

**Breaks rules 7 and 8 (each task carries the tests for its own
functionality).** If all tests live in a last task, Tasks 1–3 have no
definition of done and can be "completed" broken — and the testing task is
the one that gets dropped under deadline. **Fix:** distribute each test
case to the task that implements its functionality; a dedicated task is
only for tests with their own deliverable, like the E2E flow over the
integrated feature.

---

## 7. Implementation smuggled into the task list

> ### Task 1: useRecentSearches hook
>
> To speed things up I already implemented this one — see
> `src/hooks/useRecentSearches.ts` in the working tree. Marking it done.

**Breaks rule 10 (stop for review — never implement).** The task list
exists to be reviewed *before* code exists; "already implemented" inverts
the process and marks work done that nobody approved. **Fix:** delete the
implementation, finish the task list, and wait for the user to approve it
and ask for implementation.

---

## 8. Reshaped template

> # Recent searches — sprint plan
>
> ## Ticket backlog
>
> ## Definition of done (team wiki)
>
> ## Estimates

**Breaks rule 3 (follow the template exactly).** Custom section names mean
a reader can no longer open any task list in `docs/tasks/` and know where
everything lives — and the definition of done was outsourced to a wiki page
this repo cannot see. **Fix:** use the sections from
`references/TEMPLATE.md`, in order, with their exact headings.

---

## 9. Lifecycle and sources untracked

> # Tasks: Recent searches (final — based on the spec we agreed on)

**Breaks rule 5 (frontmatter tracks the lifecycle and both sources).** "The
spec we agreed on" is not a path, and "final" in a title is not a status.
**Fix:** keep the title clean and put `feature`, `prd`, `tech-spec`,
`status`, and `created` in frontmatter; only the user moves `status`
forward.
