# Contributing to FinPulse

Thank you for taking the time to contribute! This guide covers everything you need to get started.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Branch Naming](#branch-naming)
3. [Commit Messages](#commit-messages)
4. [Pull Request Process](#pull-request-process)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Branch Protection Rules Setup](#branch-protection-rules-setup)

---

## Development Setup

```bash
git clone https://github.com/zihadimasumbillah/Asset-Manager.git
cd Asset-Manager
npm install
cp .env.example .env   # Fill in DATABASE_URL at minimum
npm run db:push
npm run dev
```

Git hooks are installed automatically on `npm install` via Husky. You'll get:

- **pre-commit**: ESLint + Prettier on staged files
- **commit-msg**: commitlint validates your commit message format

---

## Branch Naming

Use the following prefixes:

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Maintenance, dependencies, tooling |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring (no feature or fix) |
| `test/` | Adding or improving tests |
| `ci/` | CI/CD pipeline changes |

**Examples:**
```
feat/add-auth-middleware
fix/path-traversal-in-file-endpoint
chore/upgrade-express-5.1
docs/add-api-reference
```

Keep branch names lowercase and use hyphens, not underscores.

---

## Commit Messages

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). Your commit message will be validated by commitlint on every commit.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance (deps, config, tooling) |
| `docs` | Documentation only |
| `style` | Formatting — no logic change |
| `refactor` | Code restructuring — no feature or fix |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `ci` | CI/CD pipeline changes |
| `build` | Build system changes |
| `revert` | Reverts a previous commit |

### Rules

- Subject must be **lowercase**
- Subject must **not end with a period**
- Maximum header length: **100 characters**
- Scope is **required** (e.g., `routes`, `auth`, `schema`, `client`, `ci`)

### Examples

```
feat(auth): add session-based login with passport-local
fix(routes): patch path traversal vulnerability in /api/files
chore(deps): upgrade express to 5.1.0
test(schema): add boundary tests for healthScore validation
docs(readme): add deployment guide for Vercel
ci(github-actions): add postgres service container to test job
```

### Bad Examples (will be rejected)

```
Update stuff          ← no type, no scope
feat: Fixed the bug   ← subject starts with uppercase
fix(routes): added.   ← subject ends with period
WIP                   ← not conventional
```

---

## Pull Request Process

### Before Opening a PR

Ensure all checks pass locally:

```bash
npm run lint          # ESLint must exit 0
npm run format:check  # Prettier must exit 0
npm run check         # TypeScript must exit 0
npm run test          # All tests must pass
```

### PR Checklist

- [ ] Branch is up to date with `main`
- [ ] All CI checks pass (lint, typecheck, test, build)
- [ ] New code has test coverage (don't decrease the existing threshold)
- [ ] `CHANGELOG` or PR description explains the change clearly
- [ ] No `console.log` left in production code paths
- [ ] No `error: any` or type casts (`as X`) introduced without justification

### Review Policy

- At least **1 approving review** is required before merge
- All CI status checks must pass
- Direct pushes to `main` are blocked (see [Branch Protection Rules](#branch-protection-rules-setup))
- Squash-merge is preferred to keep `main` history clean

---

## Code Standards

### TypeScript

- **No `any`** — use `unknown` and narrow with type guards
- **No floating promises** — always `await` or explicitly `.catch()`
- **Prefer `const`** — use `let` only when reassignment is necessary
- **Use type imports** — `import type { Foo } from "./foo"`

### React

- **No prop-types** — TypeScript interfaces only
- **No index as key** — use a stable unique identifier
- **Memoize sparingly** — only when profiling proves it's needed

### Error Handling

```ts
// ✅ Correct
catch (error: unknown) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  console.error("Context:", error);
  return res.status(500).json({ message: "An unexpected error occurred." });
}

// ❌ Wrong
catch (error: any) {
  return res.status(500).json({ message: error.message });
}
```

---

## Testing Requirements

- Tests live in `server/**/*.test.ts`, `shared/**/*.test.ts`, or `tests/**/*.test.tsx`
- Mock the `storage` layer in server tests — don't hit a live DB in unit tests
- Coverage thresholds: **70% lines / branches / functions / statements**
- Running tests: `npm test` (single run) or `npm run test:watch` (interactive)

---

## Branch Protection Rules Setup

> Configure these in **GitHub → Repository → Settings → Branches → Add rule** for the `main` branch.

### Step-by-Step

1. Go to `https://github.com/zihadimasumbillah/Asset-Manager/settings/branches`
2. Click **Add branch protection rule**
3. Set **Branch name pattern**: `main`
4. Enable the following:

| Setting | Value |
|---|---|
| Require a pull request before merging | ✅ Enabled |
| Require approvals | 1 |
| Dismiss stale reviews when new commits are pushed | ✅ Enabled |
| Require status checks to pass before merging | ✅ Enabled |
| Required status checks | `Lint & Format`, `TypeScript`, `Tests`, `Build` |
| Require branches to be up to date before merging | ✅ Enabled |
| Do not allow bypassing the above settings | ✅ Enabled |
| Allow force pushes | ❌ Disabled |
| Allow deletions | ❌ Disabled |

5. Click **Create**

The status check names (`Lint & Format`, `TypeScript`, `Tests`, `Build`) match the `name:` fields in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml). They appear in the dropdown after at least one CI run has completed.
