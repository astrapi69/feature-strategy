# Audit report — release v0.1.0

Branch: `main` · Date: 2026-06-11 · Publisher: `astrapi69`

## 1. Summary

Both packages of the `feature-strategy` monorepo were published to the public
npm registry at version **0.1.0**, after the blocking LICENSE issue was fixed
(the MIT license text is now bundled in each tarball, not just referenced via
the `license` field). The `feat/initial-scaffold` branch was merged to `main`
with a `--no-ff` merge commit and pushed; the release was tagged `v0.1.0`. Both
packages were smoke-tested from the registry (not the workspace) in ESM and CJS
before and after the react publish.

Published packages:

| Package | Version | npm |
|---|---|---|
| `@astrapi69/feature-strategy` | 0.1.0 | https://www.npmjs.com/package/@astrapi69/feature-strategy |
| `@astrapi69/feature-strategy-react` | 0.1.0 | https://www.npmjs.com/package/@astrapi69/feature-strategy-react |

## 2. Verification

### Preconditions (all passed before any work)
- `git status` clean, on `feat/initial-scaffold`.
- `origin` configured → `git@github.com:astrapi69/feature-strategy.git`.
- `npm whoami` → `astrapi69`.
- `npm view @astrapi69/feature-strategy version` → 404 (not yet published).

### LICENSE fix
`LICENSE` copied into `packages/core/` and `packages/react/`. `make pack-dry`
then reported **9 files per package** including `LICENSE`. Committed as
`build: include LICENSE in published packages` (`3305c2b`).

### Verification gate (`make clean → install → build → typecheck → test → pack-dry`)
- build: core (9.49 KB CJS / 9.27 KB ESM / 13.48 KB DTS) → react (1.88 / 1.72 / 3.65 KB), core-before-react order enforced by make prerequisites.
- typecheck: 0 errors.
- test: **32 passed** — 23 core (5 files), 9 react (2 files).
- pack-dry: 9 files per package (LICENSE + README.md + 6 `dist/` artifacts + package.json).

### Final pack contents (as published)
Both tarballs, 9 files each:
`LICENSE`, `README.md`, `dist/index.cjs`, `dist/index.cjs.map`,
`dist/index.d.cts`, `dist/index.d.ts`, `dist/index.js`, `dist/index.js.map`,
`package.json`.

| Package | Files | Package size | Unpacked | shasum |
|---|---|---|---|---|
| `@astrapi69/feature-strategy` | 9 | 10.9 kB | 94.3 kB | `2d097c1b0b7082a09c9b159252a91799d9290446` |
| `@astrapi69/feature-strategy-react` | 9 | 5.3 kB | 30.3 kB | `fb566f934e8446266f39c7a8866965341ea98a68` |

### Smoke tests (throwaway project `/tmp/fs-smoke`, registry installs)

**Core** — `npm install @astrapi69/feature-strategy@0.1.0` (1 package, 0 runtime
deps, confirming core is dependency-free). Registered a feature with default
`disabled`, applied a `StaticFeatureStrategy({ export: 'active' })`, asserted
strategy precedence and fail-closed behavior:

```
ESM OK: getState(export)=active, getState(unknown)=hidden
CJS OK: getState(export)=active, getState(unknown)=hidden
```

**React** — `npm install react@18 react-dom@18 @astrapi69/feature-strategy-react@0.1.0`
(adapter resolved its `@astrapi69/feature-strategy@0.1.0` dependency from the
registry, deduped). Verified named-export resolution in both module systems:

```
React ESM OK: FeatureProvider, useFeature, Feature resolved
React CJS OK: FeatureProvider, useFeature, Feature resolved
```

All four smoke runs exited 0.

## 3. Git state

- **Merge commit:** `8aa067cf421a1fa0f659d694c7b9058b348c77a2`
  — `feat: initial scaffold for feature-strategy monorepo` (`--no-ff`).
- **Pushed:** `origin/main` advanced `4a090ed..8aa067c`.
- **Tag:** `v0.1.0` (annotated, `feat(release): v0.1.0 - core and react adapter`)
  → points at `8aa067c`, pushed to origin. No GitHub release page (tag only).
- **Branch cleanup:** local `feat/initial-scaffold` deleted (was `3305c2b`).
  The remote branch was never pushed, so the remote delete was skipped silently.
- Commits on the merged branch:
  `b0ec4cb` feat: add feature-strategy core package ·
  `fd8ceaf` feat: add react adapter package ·
  `ae2e8a7` build: adapt Makefile and gitignore for monorepo ·
  `3305c2b` build: include LICENSE in published packages.

## 4. Open issues

- **esbuild allow-scripts notice (non-blocking, known).** `npm install` warns
  that `esbuild@0.27.7`'s postinstall is not in the repo's allow-scripts list.
  Builds, tests, and both publishes succeeded regardless; relevant only for a
  locked-down CI (`npm approve-scripts` or an allow entry).
- **Registry propagation delay (informational).** After each `npm publish`,
  `npm view` / direct registry reads returned 404 for roughly 60–90 s before
  the package became visible (HTTP 200). This is normal npm CDN propagation,
  not a publish failure — confirmed by polling the registry until 200, then
  re-running `npm view`. No retry of the publish itself was performed.
- **Nothing was skipped** in the task sequence; no authentication/OTP failures
  occurred; nothing was unpublished.
- `.claude/settings.json` and `.claude/scheduled_tasks.lock` are gitignored
  (added during this work) and intentionally not committed.

## 5. Recommendations (prioritized)

1. **Add a CI workflow** (GitHub Actions) running `make ci && make build &&
   make typecheck && make test && make pack-dry` on push/PR, pinned to Node 24,
   so the verification gate that gated this release is enforced continuously.
2. **Bibliogon (or other downstream) integration is now unblocked** — both
   packages are installable from the public registry; downstream consumers can
   depend on `@astrapi69/feature-strategy@^0.1.0` and the react adapter directly.
3. **Subscription / change-notification mechanism** for runtime context changes
   (role/flag updates) as a v0.2 candidate, so the react adapter re-renders on
   context switches without a full provider remount.
