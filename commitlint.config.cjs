// commitlint.config.cjs
// Enforces Conventional Commits format: https://www.conventionalcommits.org
//
// Valid examples:
//   feat(auth): add session-based login
//   fix(routes): patch path traversal in /api/files
//   chore(deps): upgrade express to 5.0.2
//   docs(readme): add local setup instructions
//   test(routes): add integration tests for upload endpoint

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Types allowed in commit messages
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "chore", // Maintenance (deps, tooling)
        "docs", // Documentation only
        "style", // Formatting (no logic change)
        "refactor", // Code restructuring (no feature/fix)
        "perf", // Performance improvement
        "test", // Adding or fixing tests
        "ci", // CI/CD pipeline changes
        "build", // Build system or external deps
        "revert", // Reverts a previous commit
      ],
    ],
    // Enforce non-empty scope
    "scope-empty": [1, "never"],
    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],
    // Subject must be lower-case
    "subject-case": [2, "always", "lower-case"],
    // Max subject line length
    "header-max-length": [2, "always", 100],
  },
};
