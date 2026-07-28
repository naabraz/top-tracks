---
name: create-tasks
description: Create a task list from an approved PRD and tech spec using spec-driven development. Use whenever the user asks to break a feature into tasks, typically invoked as /create-tasks <docs/prds/feature.md> <docs/tech-specs/feature.md>.
---

<critical>
Before writing any task list, you MUST read every file in the `references/`
folder of this skill:

- `references/TEMPLATE.md`
- `references/good-example.md`
- `references/bad-examples.md`

The template defines the exact body every task list must share; the examples
show what a finished task list should and should not look like. Do not skip
them, even if the rules below seem self-explanatory.
</critical>

# Creating task lists

This skill turns an approved PRD and tech spec into a task list, following
spec-driven development: the PRD says *what* to build, the tech spec says
*how*, and the task list says *in which increments* — each with a defined
deliverable and its tests — so implementation can be reviewed step by step.
The skill receives the paths to a PRD (created by the `create-prd` skill) and
a tech spec (created by the `create-tech-spec` skill) as its arguments.

## Rules

1. **The PRD and the tech spec are both mandatory inputs.** The arguments are
   the path to a PRD in `docs/prds/` and the path to a tech spec in
   `docs/tech-specs/`. Read both in full before anything else, and check that
   the tech spec's frontmatter points at that same PRD. If either path is
   missing, either file does not exist, or they describe different features,
   stop and ask the user — never derive tasks from one document alone, from
   the conversation, or from files you picked yourself.
2. **Get the high-level task list approved before creating any file.**
   First present, in the conversation only, a numbered high-level list: one
   line per task with its deliverable, in delivery order. Do not create the
   task file — or any other file — until the user explicitly approves that
   list. If the user adjusts it, re-present the updated list and wait for
   approval again. Only after approval do you expand it into the template and
   save it.
3. **Follow the template exactly.** Every task list uses
   `references/TEMPLATE.md`: same sections, same order, same headings. Do not
   add, remove, or rename sections — a reader must be able to open any task
   list in the project and know where everything lives.
4. **One file per feature in `docs/tasks/`.** Save the task list as
   `docs/tasks/<feature>.md`, using the same kebab-case feature name as the
   PRD and tech spec (e.g. `docs/prds/recent-searches.md` →
   `docs/tasks/recent-searches.md`). Create the folder if it does not exist.
5. **Frontmatter tracks the lifecycle and both sources.** Every task list
   starts with frontmatter containing `feature`, `prd`, `tech-spec`,
   `status`, and `created`. A new task list is always `status: draft`; only
   the user moves it to `in-review` or `approved`. Convert relative dates to
   absolute (`YYYY-MM-DD`).
6. **Every task has a well-defined deliverable.** A task's deliverable names
   the concrete, observable outcome that marks it done — the files it
   creates or modifies (taken from the tech spec's "Affected files") and the
   behavior that exists afterwards. "Work on the hook" is not a deliverable;
   "`useRecentSearches` hook persisting a deduplicated, capped list, with its
   test file passing" is. If you cannot state when a task is done, it is not
   a task yet — split or clarify it.
7. **Every task carries the tests that prove it.** Each task lists the test
   cases that guarantee both the behavior it delivers and the business goal
   it serves — covering the PRD acceptance criteria the task fulfills, plus
   the loading, empty, error, and edge states from the tech spec. A task is
   only complete when its test cases pass; a task without test cases cannot
   enter the list.
8. **Every test case belongs to a task's functionality.** Each task must
   include all the test cases from the tech spec's "Testing approach" that
   relate to the functionality it implements: distribute every case to
   exactly one task and verify the mapping in the "Test coverage check"
   section. A test case left unassigned means a task is missing or
   mis-scoped; a task whose functionality has cases it does not list is not
   done being written.
9. **Checkboxes track progress after approval.** The "Approved high-level
   tasks" section lists each task as a `- [ ]` checkbox, so GitHub renders
   the file's progress ("n of m tasks") at a glance. A new task list always
   has every box unchecked; a box is only checked when the task's
   deliverable exists and every one of its test cases passes — checking is
   the record that rule 7's bar was met, never a statement of intent. During
   implementation, checking a task off is done in the same commit that makes
   its tests pass.
10. **English only.** Like all documentation in this project, task lists are
    written in English, regardless of the language of the conversation.
11. **Stop for review — never implement.** The deliverable is the task list
    file and nothing else: no source code, no test files, no scaffolding, no
    "quick prototypes", under any circumstances. After writing the file,
    summarize the tasks and open questions and ask the user to review it.
    Implementation only starts when the user asks for it in a later request,
    ideally after the task list is approved.

## References

For the mandatory body and annotated examples see the `references/` folder:

- [`references/TEMPLATE.md`](references/TEMPLATE.md) — the exact structure
  every task list must follow.
- [`references/good-example.md`](references/good-example.md) — a complete
  task list that follows every rule, for a fictional feature.
- [`references/bad-examples.md`](references/bad-examples.md) — a catalogue of
  task-list anti-patterns, each annotated with the rule it breaks and how to
  fix it.
