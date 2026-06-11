# Audit report — initial scaffold

Branch: `feat/initial-scaffold` · Date: 2026-06-11

## 1. Summary

The freshly scaffolded `feature-strategy` npm-workspaces monorepo was finalized
for development. Two files carried over from the single-package `entity-kit-core`
repository — the root `Makefile` and `.gitignore` — were adapted to the
workspaces layout: the Makefile was rewritten to drive all packages (with
core-before-react build ordering verified, not assumed) and trimmed of dead
publish/version/link/lint targets that referenced scripts and tools absent from
this repo; the `.gitignore` was consolidated and deduplicated. The full
verification chain (`clean → install → build → typecheck → test → pack-dry`)
passes end to end: both packages build dual ESM+CJS+DTS bundles, all 32 tests
pass (23 core, 9 react), and `npm pack` confirms each package publishes only its
`dist/`, `README.md`, and `package.json`. No public API was changed and no
runtime dependency was added.

## 2. Changes

### `Makefile` (rewritten — authored by fable)
The entity-kit-core single-package Makefile was replaced with a
workspaces-aware one. **This file was adapted by the `fable` agent at the
user's request; it is not authored here and was left untouched during this
audit.** Verification below exercises fable's final version.

What fable's Makefile provides:

- **Targets:** `help`, `install` (`npm install`), `ci` (`npm ci`, reproducible
  install for pipelines), `build`, `build-core`, `build-react`, `test`,
  `test-core`, `test-react`, `typecheck`, `pack-dry`, `clean`.
- **Build order via explicit make prerequisites, not the npm glob:** `build:
  build-core build-react` and `build-react: build-core`, so core is built
  before react deterministically regardless of how npm expands `packages/*`.
- **`test`, `test-react`, and `typecheck` each depend on `build-core`**, because
  the react workspace resolves `@astrapi69/feature-strategy` through
  `packages/core/dist`; without core's `dist/` those steps cannot resolve the
  types.
- **Per-package convenience targets** (`build-core`/`build-react`/`test-core`/
  `test-react`) via `npm run <script> --workspace packages/<pkg>`.
- **`pack-dry`** runs `npm pack --workspaces --dry-run`.
- **`clean`** removes `dist/`, `coverage/`, and `node_modules/` in the root and
  both packages (via `packages/*/…`).
- **All entity-kit-core dead targets dropped** (`*-watch`, `lint`/`lint-fix`,
  `check-all`, `pack`/`inspect`, `publish*`, `version-*`/`release-*`,
  `link`/`unlink`, `clean-all`) — they referenced absent scripts/tools or
  single-package/publish assumptions out of scope here.

### `.gitignore` (consolidated)
Merged the scaffold's comprehensive Node ignore with entity-kit-core's JetBrains
entries into one deduplicated file grouped by purpose (dependencies, build
output, coverage, logs, caches, pack output, dotenv, Vite/Vitest temp files,
JetBrains, VS Code, OS files).

- **Kept** entries relevant to a TS/tsup/vitest/npm-workspaces monorepo:
  `node_modules/`, `dist/`, `*.tsbuildinfo`, `coverage/`, `*.lcov`,
  `.nyc_output`, logs, `.npm`/`.eslintcache`/`.stylelintcache`, `*.tgz`,
  `.env*`, Vite/Vitest timestamp files, JetBrains files, `.vscode-test`.
- **Added** `.DS_Store` / `Thumbs.db` (OS noise, not previously covered).
- **Dropped** framework-/tool-specific bloat that never applied here and only
  rode along in entity-kit-core's copy of the GitHub Node template: Bower,
  Grunt, jspm, Snowpack/`web_modules`, Next.js, Nuxt.js, Gatsby, vuepress,
  vitepress, Sveltekit, Docusaurus, Serverless, FuseBox, DynamoDB, Firebase,
  TernJS, node-waf, `build/Release`, parcel cache, Yarn v3 PnP/`.yarn`,
  `.pnpm-store`, diagnostic reports, runtime `pids`, REPL history.

### `docs/audit/initial-scaffold.md` (new)
This report.

### `README.md` (scaffold content, committed)
The root README was expanded from a one-line stub into the monorepo overview
(packages table, concept, quick-start). It is scaffold documentation and is
committed with the core package. `.claude/settings.json` (local agent config)
was deliberately **not** committed.

## 3. Verification

All commands run from the repo root on `feat/initial-scaffold`
(Node v24.15.0, npm 11.16.0).

### `make clean && make install`
Clean removed all build/dep artifacts. `npm install` added 145 packages,
**0 vulnerabilities**. (npm emitted an advisory that `esbuild`'s postinstall
script is not in the allow-scripts list; the build below confirms esbuild/tsup
still works, so this is non-blocking — see Open issues.)

### `make build`  →  `build-core` then `build-react`
Build order **core → react** confirmed — enforced by the `build: build-core
build-react` / `build-react: build-core` make prerequisites (each runs
`npm run build --workspace packages/<pkg>`).

| Package | Format | File | Size |
|---|---|---|---|
| core | CJS | `dist/index.cjs` | 9.49 KB |
| core | ESM | `dist/index.js` | 9.27 KB |
| core | DTS | `dist/index.d.ts` / `.d.cts` | 13.48 KB |
| react | CJS | `dist/index.cjs` | 1.88 KB |
| react | ESM | `dist/index.js` | 1.72 KB |
| react | DTS | `dist/index.d.ts` / `.d.cts` | 3.65 KB |

### `make typecheck`  →  `tsc --noEmit` (both workspaces)
Passed with no errors (core built first so react resolves core's `.d.ts`).

### `make test`  →  `vitest run` (both workspaces)
- core: 5 files, **23 passed**
- react: 2 files, **9 passed**
- **Total: 32 passed, 0 failed.** The react run prints an `Uncaught Error:
  useFeature must be used within a FeatureProvider` to stderr — this is the
  *expected* throw asserted by the "throws outside of a FeatureProvider" test,
  which passes.

### `make pack-dry`  →  `npm pack --workspaces --dry-run`
Each package publishes exactly **8 files** — `README.md`, the six `dist/`
artifacts, and `package.json`. No `LICENSE` file is bundled (carried via the
`"license": "MIT"` field, as intended).

| Package | Files | Package size | Unpacked |
|---|---|---|---|
| `@astrapi69/feature-strategy` | 8 | 10.2 kB | 93.2 kB |
| `@astrapi69/feature-strategy-react` | 8 | 4.6 kB | 29.2 kB |

Contents per package: `README.md`, `dist/index.cjs`, `dist/index.cjs.map`,
`dist/index.d.cts`, `dist/index.d.ts`, `dist/index.js`, `dist/index.js.map`,
`package.json`.

## 4. Open issues

- **esbuild postinstall not allow-listed.** `npm install` warns that
  `esbuild@0.27.7`'s postinstall is pending approval under the repo's
  allow-scripts policy. Builds and tests succeed regardless, so this is
  non-blocking, but in a locked-down CI it may need `npm approve-scripts` or an
  explicit allow entry. No action taken (would be an environment/policy change
  outside this task's scope).
- **Unrelated `README.md` modification** was already present in the working tree
  at session start; left as-is rather than reverting or committing, since it is
  outside the scaffold-finalization scope.
- No API changes were required or made; nothing was skipped in the verification
  chain.

## 5. Recommendations (prioritized)

1. **Add a CI workflow** (GitHub Actions) running `make install && make build &&
   make typecheck && make test && make pack-dry` on push/PR, so the verified
   chain above is enforced continuously. Pin Node 24 to match local.
2. **Define a publish path that enforces core-before-react ordering** when
   v0.1.0 ships (e.g. a `release` target that publishes `packages/core` then
   `packages/react`, since react's `dependencies` pin `@astrapi69/feature-strategy@^0.1.0`).
   Deliberately omitted here per task scope.
3. **Consider a subscription/notification mechanism** for runtime context
   changes (role/flag updates) as a v0.2 candidate, so the react adapter can
   re-render on context switches without a full provider remount.
