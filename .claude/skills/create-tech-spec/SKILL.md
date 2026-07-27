---
name: create-tech-spec
description: Create a tech spec from an approved PRD using spec-driven development. Use whenever the user asks to create a tech spec, technical specification, or technical plan, typically invoked as /create-tech-spec <docs/prds/feature.md>.
---

<critical>
Before writing any tech spec, you MUST read every file in the `references/`
folder of this skill:

- `references/TEMPLATE.md`
- `references/good-example.md`
- `references/bad-examples.md`

The template defines the exact body every tech spec must share; the examples
show what a finished tech spec should and should not look like. Do not skip
them, even if the rules below seem self-explanatory.
</critical>

# Creating tech specs

This skill turns a PRD into a Technical Specification (tech spec), following
spec-driven development: the PRD says *what* to build; the tech spec says
*how*, and is reviewed before any implementation starts. The skill receives
the path to a PRD file (created by the `create-prd` skill) as its argument.

## Rules

1. **The PRD is the mandatory input.** The argument is the path to a PRD in
   `docs/prds/`. Read it in full before anything else. If no path was given,
   the file does not exist, or the file is not a PRD, stop and ask the user
   for it — never write a tech spec from the conversation alone, and never
   pick a PRD yourself.
2. **Explore the project before asking anything.** Before the interview, read
   the parts of the codebase the feature will touch: existing components,
   hooks, routes, data access, test setup, and the project skills
   (`code-standards`, `folder-structure`, `react-components`, `unit-testing`,
   `e2e-testing`). Questions must show that homework — never ask the user
   something the code already answers.
3. **Interview, never assume.** After exploring, interview the user about
   every technical decision the PRD leaves open (data flow, state ownership,
   error handling, performance constraints, rollout...). Do not generate the
   tech spec before the interview. A fabricated decision is worse than an
   open question: a wrong decision gets built, an open question gets
   answered.
4. **Use Context7 for third-party library questions.** When a decision
   depends on how a third-party library works (Next.js, React, Vitest,
   Playwright, Tailwind...), resolve it with the Context7 MCP tools
   (`resolve-library-id`, then `get-library-docs`) instead of memory —
   training data is stale for this project's dependencies (see `AGENTS.md`).
   If Context7 is unavailable, consult the docs in
   `node_modules/next/dist/docs/` or ask the user; never guess an API.
5. **Follow the template exactly.** Every tech spec uses
   `references/TEMPLATE.md`: same sections, same order, same headings. Do not
   add, remove, or rename sections — a reader must be able to open any tech
   spec in the project and know where everything lives.
6. **One file per feature in `docs/tech-specs/`.** Save the tech spec as
   `docs/tech-specs/<feature>.md`, using the same kebab-case feature name as
   the PRD (e.g. `docs/prds/recent-searches.md` →
   `docs/tech-specs/recent-searches.md`). Create the folder if it does not
   exist.
7. **Frontmatter tracks the lifecycle and the source PRD.** Every tech spec
   starts with frontmatter containing `feature`, `prd`, `status`, and
   `created`. A new tech spec is always `status: draft`; only the user moves
   it to `in-review` or `approved`. Convert relative dates to absolute
   (`YYYY-MM-DD`).
8. **The testing approach is exhaustive, not decorative.** The "Testing
   approach" section must enumerate concrete test cases — unit (Vitest +
   Testing Library) and E2E (Playwright) — covering every acceptance
   criterion in the PRD plus loading, empty, error, and edge states, with
   enough cases to keep coverage above 80%. Each case names the file it
   belongs in and the behavior it asserts. A testing section that a developer
   cannot turn directly into test files is not done.
9. **English only.** Like all documentation in this project, tech specs are
   written in English, regardless of the language of the PRD or conversation.
10. **Stop for review — never implement.** The deliverable is the tech spec
    file and nothing else: no source code, no test files, no scaffolding, no
    "quick prototypes", under any circumstances. After writing the spec,
    summarize the key decisions and open questions and ask the user to review
    it. Implementation only starts when the user asks for it in a later
    request, ideally after the tech spec is approved.

## References

For the mandatory body and annotated examples see the `references/` folder:

- [`references/TEMPLATE.md`](references/TEMPLATE.md) — the exact structure
  every tech spec must follow.
- [`references/good-example.md`](references/good-example.md) — a complete
  tech spec that follows every rule, for a fictional feature.
- [`references/bad-examples.md`](references/bad-examples.md) — a catalogue of
  tech-spec anti-patterns, each annotated with the rule it breaks and how to
  fix it.
