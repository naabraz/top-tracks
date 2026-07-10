/**
 * Commit messages in this project must follow the Conventional Commits spec.
 * See https://www.conventionalcommits.org for the full format:
 *   <type>[optional scope]: <description>
 * Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci,
 * chore, revert.
 *
 * The commit-msg git hook (.husky/commit-msg) runs commitlint against every
 * commit message, so an invalid message aborts the commit.
 */
export default {
  extends: ["@commitlint/config-conventional"],
};
