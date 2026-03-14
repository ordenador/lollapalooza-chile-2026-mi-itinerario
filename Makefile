# Lollapalooza Chile 2026 - Makefile

NODE_VERSION := $(shell node --version 2>/dev/null || echo "not-installed")
PNPM_BIN := $(shell command -v pnpm 2>/dev/null)
ifeq ($(PNPM_BIN),)
PNPM := corepack pnpm
PNPM_VERSION := $(shell corepack pnpm --version 2>/dev/null || echo "not-available")
else
PNPM := pnpm
PNPM_VERSION := $(shell pnpm --version)
endif

GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available commands
	@echo "$(GREEN)Lollapalooza Chile 2026 - Commands$(NC)"
	@echo "Node.js: $(NODE_VERSION) | pnpm: $(PNPM_VERSION)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-22s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

.PHONY: install-dependencies
install-dependencies: ## Install dependencies
	@if [ -f "pnpm-lock.yaml" ]; then \
		$(PNPM) install --frozen-lockfile; \
	else \
		$(PNPM) install; \
	fi

.PHONY: dev
dev: ## Start development server (auto-installs pre-commit hooks)
	@echo "$(GREEN)Checking pre-commit installation...$(NC)"
	@if command -v pre-commit >/dev/null 2>&1; then \
		if [ -f ".pre-commit-config.yaml" ] && [ ! -f ".git/hooks/pre-commit" ]; then \
			echo "$(YELLOW)Installing pre-commit hooks...$(NC)"; \
			pre-commit install; \
			echo "$(GREEN)✓ Pre-commit hooks installed$(NC)"; \
		elif [ -f ".git/hooks/pre-commit" ]; then \
			echo "$(GREEN)✓ Pre-commit hooks already installed$(NC)"; \
		else \
			echo "$(YELLOW)No .pre-commit-config.yaml found, skipping hooks$(NC)"; \
		fi; \
	else \
		echo "$(YELLOW)Pre-commit not installed. Install with: pipx install pre-commit$(NC)"; \
	fi
	$(PNPM) run dev

.PHONY: build
build: ## Build for production
	$(PNPM) run build

.PHONY: start
start: ## Start production server
	$(PNPM) run start

.PHONY: lint
lint: ## Run ESLint
	$(PNPM) run lint

.PHONY: format
format: ## Format codebase with Prettier
	$(PNPM) run format

.PHONY: type-check
type-check: ## Run TypeScript checks
	$(PNPM) run type-check

.PHONY: test
test: ## Run tests
	$(PNPM) run test

.PHONY: update
update: ## Update dependencies within configured ranges (lockfile)
	$(PNPM) update

.PHONY: update-latest
update-latest: ## Force update to latest major versions (package.json + lockfile)
	$(PNPM) update --latest

.PHONY: check
check: ## Run format check + lint + type-check + test
	$(PNPM) run format:check
	$(PNPM) run lint
	$(PNPM) run type-check
	$(PNPM) run test

.PHONY: install-hooks
install-hooks: ## Install pre-commit hooks
	@if command -v pre-commit >/dev/null 2>&1; then \
		pre-commit install; \
		echo "$(GREEN)✓ Pre-commit hooks installed$(NC)"; \
	else \
		echo "$(YELLOW)Pre-commit not installed. Install with: pipx install pre-commit$(NC)"; \
		exit 1; \
	fi

.PHONY: clean
clean: ## Clean build artifacts and caches
	rm -rf .next out dist coverage node_modules/.cache
