@AGENTS.md

# Skills

| Action        | Domain               | Skill              |
| ------------- | -------------------- | ------------------ |
| Write/edit    | React component/hook | `react-components` |
| Write/edit    | Any source code      | `code-standards`   |
| Write/edit    | Test file            | `unit-testing`     |
| Write/edit    | E2E test (Playwright)| `e2e-testing`      |
| Create/place  | Files & folders      | `folder-structure` |

# Project rules

## Git safety

Never run a destructive git command without explicit permission from the user.
Always ask first, explain what the command will do and what it will affect, and
wait for confirmation before running it.

Destructive commands include (non-exhaustive):

- `git push --force` / `git push --force-with-lease`
- `git reset --hard`
- `git clean -fd` (and any `git clean` that deletes files)
- `git checkout .` / `git restore .` that discards uncommitted changes
- `git branch -D` (force-delete a branch)
- `git rebase` (including `--onto`) and history rewrites
- `git commit --amend` on already-pushed commits
- `git push origin --delete <branch>` (deleting a remote branch)
- `git stash drop` / `git stash clear`
- `git filter-branch` / `git reflog expire --expire=now`

Non-destructive commands (e.g. `git status`, `git diff`, `git log`, `git add`,
`git commit`, a regular `git push`) may be run as needed, following the usual
"only commit or push when the user asks" guidance.

`git commit -m` is always allowed and never requires confirmation.

### Conventional Commits

Every commit in this project MUST follow the
[Conventional Commits](https://www.conventionalcommits.org) format:

```
<type>[optional scope]: <description>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`. Examples:

- `feat(search): add debounced artist search`
- `fix(lookup): use the track's own album cover`
- `docs: document the data sources in the README`

This is enforced automatically: the `commit-msg` git hook
(`.husky/commit-msg`) runs `commitlint` against the message on every commit, so
a non-conventional message aborts the commit. If a commit is rejected, fix the
message to match the format and commit again — do not bypass the hook with
`--no-verify`.

### Commit and push triggers

- When the user says **"Ok, go"**, commit the current changes immediately
  without asking for confirmation to run the command.
- When the user says **"Ok, push"**, you may push to the branch.

## Testing

Every component or piece of code must have its corresponding test file created.
When you add a new component, hook, module, or utility, create its test file in
the same step (e.g. `SearchBar.tsx` → `SearchBar.test.tsx`, `lookup.ts` →
`lookup.test.ts`). Do not consider a change complete until its tests exist and
pass.

## Language

- Every skill must be written in **English**.
- All code — identifiers, comments, commit messages, and documentation — must
  always be written in **English**.

# Design Context

Strategy lives in [`PRODUCT.md`](PRODUCT.md); the visual system in
[`DESIGN.md`](DESIGN.md). Read them before any design or UI work.

- **Register:** `product` — a tool that happens to look great. Product rules
  govern behavior (clarity, speed, state-rich components); a brand-leaning
  identity governs the visuals.
- **Platform:** `web`.

Design principles:

1. **Answer first** — the top track is the headline; instant, unambiguous
   hierarchy of track → album → similar.
2. **Every answer is a doorway** — the similar-artists path drives the
   discovery loop; make the next search feel one tap away.
3. **Warm, not corporate** — a recommending-a-friend tone over
   efficient-but-cold convention.
4. **Character with clarity** — keep the editorial atmosphere, but when it
   fights legibility, hierarchy, or speed, the task wins.
5. **Accessible by default** — WCAG 2.1 AA on the dark palette, visible focus,
   `prefers-reduced-motion` honored.
