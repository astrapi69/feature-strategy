# feature-strategy monorepo Makefile
# npm-workspaces monorepo for framework-agnostic feature gating.
#   packages/core  -> @astrapi69/feature-strategy        (zero runtime deps)
#   packages/react -> @astrapi69/feature-strategy-react  (depends on core)
# Build order is enforced through explicit make prerequisites instead of
# relying on the alphabetical workspace glob expansion of npm. Targets that
# resolve the core package (react build, react tests, typecheck) depend on
# build-core, because the core exports point to dist/.

.PHONY: help install ci build build-core build-react test test-core test-react \
        typecheck clean pack-dry

# Default
help: ## Show all targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ─── Setup ───────────────────────────────────────────────────────────

install: ## Install all workspace dependencies
	npm install

ci: ## Reproducible install from package-lock.json (for CI pipelines)
	npm ci

# ─── Build ───────────────────────────────────────────────────────────

build: build-core build-react ## Build all packages in dependency order

build-core: ## Build only @astrapi69/feature-strategy
	npm run build --workspace packages/core

build-react: build-core ## Build @astrapi69/feature-strategy-react (builds core first)
	npm run build --workspace packages/react

# ─── Quality ─────────────────────────────────────────────────────────

test: build-core ## Run Vitest in all packages (react tests resolve core via dist)
	npm run test --workspaces

test-core: ## Run Vitest in @astrapi69/feature-strategy
	npm run test --workspace packages/core

test-react: build-core ## Run Vitest in @astrapi69/feature-strategy-react
	npm run test --workspace packages/react

typecheck: build-core ## Type-check all packages (react resolves core via dist)
	npm run typecheck --workspaces

# ─── Package ─────────────────────────────────────────────────────────

pack-dry: build ## Show publish contents of every package without publishing
	npm pack --workspaces --dry-run

# ─── Cleanup ─────────────────────────────────────────────────────────

clean: ## Remove dist/, coverage/ and node_modules/ in root and all packages
	rm -rf node_modules coverage
	rm -rf packages/*/dist packages/*/coverage packages/*/node_modules
	@echo "Clean."