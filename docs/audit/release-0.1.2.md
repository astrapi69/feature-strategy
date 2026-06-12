# Audit report — release v0.1.2

Branch: `main` · Date: 2026-06-12 · Publisher: `astrapi69`

## 1. Summary

Documentation-only patch release. No code changed; only the three READMEs and
the two package versions. Both packages were republished at **0.1.2** so the
npmjs.com pages serve the refined docs.

What the new READMEs change:
- **Code-sample reindentation** — all TypeScript/TSX examples across the root,
  core and react READMEs were re-indented from 2-space to 4-space for
  consistency.
- **Composition-escalation note (core)** — clarifies that a per-feature outcome
  configured inside a single strategy (e.g. a role requirement's `missingState`)
  is that strategy's verdict only: `CompositeStrategy` can escalate it to a more
  restrictive state when another strategy demands it, but can never soften it.
- **React memoization block fix** — the "Wrong vs Right" example in the
  *Memoize the context object* section had an inconsistent indentation
  introduced by the bulk reindent (the "Right" lines were 4-space indented while
  the "Wrong" lines were not). Fixed during this release so both examples align
  at column 0. Confirmed with the user before publishing.

Published packages:

| Package | Version | npm |
|---|---|---|
| `@astrapi69/feature-strategy` | 0.1.2 | https://www.npmjs.com/package/@astrapi69/feature-strategy |
| `@astrapi69/feature-strategy-react` | 0.1.2 | https://www.npmjs.com/package/@astrapi69/feature-strategy-react |

## 2. Verification

### Preconditions
- On `main`; registry at `0.1.1` for both packages before publish.
- All three READMEs modified in the working tree (docs-only). An untracked
  `.vscode/` directory was present and deliberately **not** staged or committed.

### README check (requested)
Reviewed the full diff before releasing. Overwhelmingly cosmetic reindentation
plus one genuine content addition (core escalation note). Flagged the react
memoization-block indentation inconsistency to the user; per their decision it
was fixed (the two "Right" lines dedented to column 0) ahead of publish.

### Verification gate (`make clean → install → build → typecheck → test → pack-dry`)
- build: core + react built clean (core before react).
- typecheck: 0 errors.
- test: **32 passed** — 23 core (5 files), 9 react (2 files).
- pack-dry: **version 0.1.2**, **9 files per package** (LICENSE + README.md +
  6 `dist/` artifacts + package.json).

### Diff scope check (`git diff main --stat`, on the release branch)
```
 README.md                   | 32 +++++++++++++++----------------
 package-lock.json           |  4 ++--
 packages/core/README.md     | 36 +++++++++++++++++++----------------
 packages/core/package.json  |  2 +-
 packages/react/README.md    | 46 ++++++++++++++++++++++-----------------------
 packages/react/package.json |  2 +-
 6 files changed, 63 insertions(+), 59 deletions(-)
```
Three READMEs + two `package.json` + lockfile. **Zero source files.** The
lockfile change is the two `0.1.1 → 0.1.2` version references only. react's
dependency on core stayed `^0.1.0` (resolves 0.1.2 correctly).

### Published tarballs
| Package | Version | Files | shasum |
|---|---|---|---|
| `@astrapi69/feature-strategy` | 0.1.2 | 9 | `82a681592bbd192b68104fc4a6a1cb923148ce2c` |
| `@astrapi69/feature-strategy-react` | 0.1.2 | 9 | `0f7b9e876984f29659ddbb77197d6aeeb4e4758f` |

### Registry README check
```
npm view @astrapi69/feature-strategy readme       | grep -c "defaults plus deviations"  → 1
npm view @astrapi69/feature-strategy readme       | grep -c "can never soften"           → 1  (new escalation note)
npm view @astrapi69/feature-strategy-react readme | grep -c "Memoize the context object" → 1
```
Indentation fix confirmed live: the published react README shows
`// Right: stable identity …` at column 0.

### Propagation timing
Core visible at `0.1.2` in ~15 s; react in ~31 s. No publish was retried.

## 3. Git state

- **Merge commit:** `2cbcf78166b8f00fdb88c94c0c35ab881b1826c3`
  — `docs: README update and v0.1.2 patch release` (`--no-ff`).
- **Pushed:** `origin/main` advanced `baf5960..2cbcf78`.
- **Tag:** `v0.1.2` (annotated, `feat(release): v0.1.2 - documentation patch`)
  → points at `2cbcf78`, pushed. No GitHub release page.
- **Branch cleanup:** local `docs/readme-v0.1.2` deleted (was `9ca7e7e`); never
  pushed to remote.
- Branch commits merged: `d2ada1e` docs: align README code samples and clarify
  composition escalation · `9ca7e7e` feat(release): Bump version to 0.1.2.

## 4. Open issues

- **esbuild allow-scripts notice (non-blocking, known).** `npm install`/`npm
  version` warn that `esbuild@0.27.7`'s install script is not allow-listed.
  Builds, tests, and both publishes succeeded regardless; relevant only for a
  locked-down CI.
- An untracked `.vscode/` directory remains in the working tree; it is local
  editor config, was not part of this release, and is left as-is (not gitignored
  yet — see recommendations).
- Nothing was skipped; no auth/OTP failures; nothing was unpublished.

## 5. Recommendations (prioritized, max two)

1. **CI workflow remains the next task** — a GitHub Actions pipeline running
   `make ci && make build && make typecheck && make test && make pack-dry` on
   push/PR (Node 24) would enforce the gate that protected this release. A
   markdown/prettier check would also have caught the README indentation
   inconsistency automatically.
2. **Add `.vscode/` to `.gitignore`** (or commit a curated
   `.vscode/extensions.json`) so the editor directory stops showing as an
   untracked change on every release.
