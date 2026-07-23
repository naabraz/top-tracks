---
name: create-prd
description: Create a PRD from a prompt file using spec-driven development. Use whenever the user asks to create a PRD, product spec, or feature spec, typically invoked as /create-prd <path/to/prompt.md>.
---

<critical>
Before writing any PRD, you MUST read every file in the `references/` folder
of this skill:

- `references/TEMPLATE.md`
- `references/good-example.md`
- `references/bad-examples.md`

The template defines the exact body every PRD must share; the examples show
what a finished PRD should and should not look like. Do not skip them, even if
the rules below seem self-explanatory.
</critical>

# Creating PRDs

This skill turns a feature prompt into a Product Requirements Document (PRD),
following spec-driven development: the PRD is the reviewed specification that
precedes any implementation. The skill receives a `prompt.md` file path as its
argument, containing the raw information about the feature to be built.

## Rules

1. **Start from the prompt file.** The argument is the path to a `prompt.md`
   describing the feature. Read it in full before anything else. If no path
   was given or the file does not exist, ask the user for it — do not guess a
   location or write a PRD from the conversation alone.
2. **Interview, never invent.** If the prompt lacks the information a template
   section needs (who it is for, what success looks like, what is out of
   scope...), interview the user with concrete questions before generating.
   Fabricated requirements are worse than open questions: a wrong "requirement"
   gets built, an open question gets answered.
3. **Follow the template exactly.** Every PRD uses `references/TEMPLATE.md`:
   same sections, same order, same headings. Do not add, remove, or rename
   sections — a reader must be able to open any PRD in the project and know
   where everything lives.
4. **One file per feature in `docs/prds/`.** Save the PRD as
   `docs/prds/<feature>.md`, with the feature name in kebab-case (e.g.
   `docs/prds/recent-searches.md`). Create the folder if it does not exist.
5. **Frontmatter tracks the lifecycle.** Every PRD starts with frontmatter
   containing `feature`, `status`, and `created`. A new PRD is always
   `status: draft`; only the user moves it to `in-review` or `approved`.
   Convert relative dates to absolute (`YYYY-MM-DD`).
6. **Depth proportional to the feature.** The sections are fixed, but their
   depth scales with the complexity described in the prompt: a small feature
   gets a short PRD. Never pad a section to look thorough — an empty-feeling
   section signals a question to ask, not space to fill.
7. **Acceptance criteria must be verifiable.** Each requirement's criteria
   describe an observable outcome that a test could assert ("searching for an
   unknown artist shows the not-found message"), never intentions ("search
   should work well"). If you cannot phrase a criterion as something checkable,
   the requirement is not understood yet — go back to rule 2.
8. **Non-goals are mandatory.** Every PRD states what is explicitly out of
   scope. "Everything is in scope" is never true; a missing non-goals section
   means the boundary conversation has not happened.
9. **English only.** Like all documentation in this project, PRDs are written
   in English, regardless of the language of the prompt file or conversation.
10. **Stop for review — do not implement.** After writing the PRD, summarize
    the key decisions and open questions, and ask the user to review it. The
    skill ends there: implementation only starts when the user asks for it in
    a later request, ideally after the PRD is approved.

## References

For the mandatory body and annotated examples see the `references/` folder:

- [`references/TEMPLATE.md`](references/TEMPLATE.md) — the exact structure
  every PRD must follow.
- [`references/good-example.md`](references/good-example.md) — a complete PRD
  that follows every rule, for a fictional feature.
- [`references/bad-examples.md`](references/bad-examples.md) — a catalogue of
  PRD anti-patterns, each annotated with the rule it breaks and how to fix it.
