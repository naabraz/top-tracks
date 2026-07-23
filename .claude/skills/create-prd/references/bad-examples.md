# PRD anti-patterns

A catalogue of fragments from bad PRDs. Each example names the rule it breaks
(from `SKILL.md`) and how to fix it.

---

## 1. Invented requirements

> ### R3 — Sync history across devices
>
> Users probably also want their history on their phone, so we will sync it
> through an account system.

**Breaks rule 2 (interview, never invent).** The prompt never mentioned
accounts or sync; "probably also want" is the author filling a gap with
fiction, and fiction gets built. **Fix:** remove the requirement and add an
entry to "Open questions" — or ask the user before generating.

---

## 2. Unverifiable acceptance criteria

> **Acceptance criteria:**
>
> - Search should work well and feel fast.
> - The list looks clean and modern.

**Breaks rule 7 (acceptance criteria must be verifiable).** No test could
assert "works well" or "modern"; these are wishes, not criteria. **Fix:**
rephrase as observable outcomes: "results render without a full page reload",
"the list shows at most 5 entries, most recent first".

---

## 3. Missing or empty non-goals

> ## Non-goals
>
> None — we want this feature to be as complete as possible.

**Breaks rule 8 (non-goals are mandatory).** "Everything is in scope" means
the boundary conversation never happened, and scope will be negotiated during
implementation instead — the most expensive time to do it. **Fix:** interview
the user about the boundary and list real exclusions ("no cross-device sync",
"no entry editing").

---

## 4. Reshaped template

> # Recent searches — one-pager
>
> ## TL;DR
>
> ## The Ask
>
> ## Solution sketch

**Breaks rule 3 (follow the template exactly).** Custom section names mean a
reader can no longer open any PRD in `docs/prds/` and know where everything
lives. **Fix:** use the sections from `references/TEMPLATE.md`, in order, with
their exact headings.

---

## 5. Implementation plan disguised as a PRD

> ## Requirements
>
> ### R1 — Add a `useRecentSearches` hook
>
> Create the hook in `src/hooks/`, wire it to `localStorage` with a
> `JSON.parse` fallback, and render a `<RecentSearches>` component from
> `HomeScreen.tsx`.

**Breaks rule 7 (criteria describe outcomes) and the spirit of rule 10 (the
PRD precedes implementation).** This specifies *how* before the *what* has
been reviewed; hooks and file paths belong in a technical plan. **Fix:** state
the user-facing requirement ("a returning user sees their recent searches on
the home screen") and keep architecture notes brief, inside "Technical
considerations".

---

## 6. Padded sections

> ## Success metrics
>
> Success will be measured across multiple dimensions including but not
> limited to user satisfaction, engagement uplift, retention impact,
> ecosystem synergies, and overall product excellence.

**Breaks rule 6 (depth proportional to the feature).** Five vague dimensions
say less than one measurable signal; padding hides the fact that no metric
was agreed. **Fix:** name the one or two signals that would actually change a
decision, or ask the user which outcome matters.

---

## 7. Assumptions disguised as open questions

> ## Open questions
>
> - We assume history is capped at 5 entries (confirm later).
> - Not-found searches are recorded for now; revisit if anyone complains.

**Breaks rule 2 (interview, never invent).** These are decisions already
taken and dressed up as questions — the "question" ships. **Fix:** either ask
the user now and record the answer as a requirement, or phrase a genuine
question with no embedded default: "Should a not-found search be recorded?"

---

## 8. Lifecycle not tracked

> # PRD: Recent searches (FINAL v3, approved-ish)

**Breaks rule 5 (frontmatter tracks the lifecycle).** Status buried in the
title is unparseable and "approved-ish" is not a state. **Fix:** keep the
title clean and track the lifecycle in frontmatter (`status: draft` →
`in-review` → `approved`), changed only by the user.
