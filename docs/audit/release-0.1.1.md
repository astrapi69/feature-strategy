# Audit report — release v0.1.1

Branch: `main` · Date: 2026-06-11 · Publisher: `astrapi69`

## 1. Summary

Documentation-only patch release. No code changed; only the three READMEs and
the two package versions. Both packages were republished at **0.1.1** so that
npmjs.com serves the rewritten docs ahead of the Medium article launch.

The new READMEs add three things:
- the **defaults-plus-deviations** design principle, including the
  total-function anti-pattern;
- the **cheap-and-pure conditions** rule;
- the **React context memoization** and **cost model** sections (react package).

Published packages:

| Package | Version | npm |
|---|---|---|
| `@astrapi69/feature-strategy` | 0.1.1 | https://www.npmjs.com/package/@astrapi69/feature-strategy |
| `@astrapi69/feature-strategy-react` | 0.1.1 | https://www.npmjs.com/package/@astrapi69/feature-strategy-react |

## 2. Verification

### Preconditions
- On `main`; `npm whoami` → `astrapi69`; registry at `0.1.0` for both packages
  before publish (0.1.1 did not exist).
- Content present in all three READMEs:
  `grep -c "defaults plus deviations" README.md` → 1,
  `… packages/core/README.md` → 1,
  `grep -c "Memoize the context object" packages/react/README.md` → 1.
- **Deviation noted and resolved (see Open issues):** the *core* and *react*
  package READMEs were already committed and pushed to `origin/main` in
  `24cc2a0` from a prior step; only the **root** `README.md` was an uncommitted
  working-tree change at the start of this task. The working tree contained no
  stray/source files, so the intent of precondition 1 (docs-only, no foreign
  changes) held. Confirmed with the user before proceeding.

### Verification gate (`make clean → install → build → typecheck → test → pack-dry`)
- build: core + react built clean (core before react).
- typecheck: 0 errors.
- test: **32 passed** — 23 core (5 files), 9 react (2 files).
- pack-dry: **version 0.1.1**, **9 files per package** (LICENSE + README.md +
  6 `dist/` artifacts + package.json).

### Diff scope check (`git diff main --stat`, on the release branch)
```
 README.md                   | 24 ++++++++++++++++++++----
 package-lock.json           |  4 ++--
 packages/core/package.json  |  2 +-
 packages/react/package.json |  2 +-
 4 files changed, 24 insertions(+), 8 deletions(-)
```
**Zero source files.** The core/react READMEs do not appear because they were
already on `main` (committed in `24cc2a0`); the lockfile change is the two
`0.1.0 → 0.1.1` version references only. react's dependency on core was left at
`^0.1.0` (resolves 0.1.1 correctly).

### Published tarballs
| Package | Version | Files | shasum |
|---|---|---|---|
| `@astrapi69/feature-strategy` | 0.1.1 | 9 | `c35b303f527a6629afd354953857ff608b2e4b16` |
| `@astrapi69/feature-strategy-react` | 0.1.1 | 9 | `835f68113748e8bc90f935672665171c8aac6471` |

### Registry README check (the point of the release)
```
npm view @astrapi69/feature-strategy readme       | grep -c "defaults plus deviations"  → 1
npm view @astrapi69/feature-strategy-react readme | grep -c "Memoize the context object" → 1
```
Both registries serve the new READMEs.

### Propagation timing
Unlike the 0.1.0 release (60–90 s), both 0.1.1 publishes were visible via
`npm view` **immediately** (~0 s on the first poll). No publish was retried.

## 3. Git state

- **Merge commit:** `e6f48d41c662fa0dcbbd5dcc353ae3203f6a6630`
  — `docs: README update and v0.1.1 patch release` (`--no-ff`).
- **Pushed:** `origin/main` advanced `24cc2a0..e6f48d4`.
- **Tag:** `v0.1.1` (annotated, `feat(release): v0.1.1 - documentation patch`)
  → points at `e6f48d4`, pushed. No GitHub release page.
- **Branch cleanup:** local `docs/readme-v0.1.1` deleted (was `c01afb0`); never
  pushed to remote.
- Branch commits merged: `8fd4c68` docs: document design principle, condition
  purity and react cost model · `c01afb0` feat(release): Bump version to 0.1.1.

## 4. Open issues

- **Procedure deviation (resolved):** Task 1 assumed all three READMEs were
  uncommitted. In fact the core/react package READMEs were already committed and
  pushed to `origin/main` (`24cc2a0`) before this task began; only the root
  README was an uncommitted change. I stopped and reported this rather than
  improvising, and the user confirmed the adapted flow (commit the root README,
  bump, verify, merge, publish). No history was rewritten and no force-push was
  used. Net effect on the registry is identical to the intended plan.
- **esbuild allow-scripts notice (non-blocking, known).** `npm install`/`npm
  version` warn that `esbuild@0.27.7`'s install script is not allow-listed.
  Builds, tests, and both publishes succeeded regardless; relevant only for a
  locked-down CI.
- Nothing was skipped; no auth/OTP failures; nothing was unpublished.

## 5. Recommendations (prioritized, max two)

1. **CI workflow remains the next task** — a GitHub Actions pipeline running
   `make ci && make build && make typecheck && make test && make pack-dry` on
   push/PR (Node 24) would enforce the gate that protected this release and
   catch the esbuild allow-scripts policy gap.
2. **adaptive-learner integration can now point users to the published docs**
   that explain the abstention / defaults-plus-deviations principle, since both
   registry READMEs now carry that guidance.
