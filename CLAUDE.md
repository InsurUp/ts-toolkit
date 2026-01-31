# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

InsurUp TypeScript Toolkit — a Bun workspace monorepo with SDK, type contracts, and TanStack Table adapters for React, Vue, and Svelte.

## Commands

```bash
# All from repo root
bun install                  # Install dependencies
bun run build                # Build all packages (tsup, ESM+CJS)
bun run test                 # Run all tests (Vitest)
bun run typecheck            # Type check all packages (tsc --noEmit)
bun run lint                 # ESLint all packages
bun run lint:fix             # Auto-fix lint issues
bun run format               # Prettier format
bun run format:check         # Check formatting

# Single package
cd packages/table-adapter-core && bun test
cd packages/table-adapter-core && bun run test:watch

# Single test file
cd packages/table-adapter-core && bunx vitest run test/unit/adapter/base-adapter.spec.ts
```

## Architecture

**Dependency flow:** `contracts` → `sdk` → `table-adapter-core` → `table-adapter-{react,vue,svelte}`

### table-adapter-core

The core package implements a layered architecture:

- **BaseTableAdapter** (`src/lib/adapter/base-adapter.ts`) — framework-agnostic adapter wrapping TanStack Table + @tanstack/query-core. Manages caching, cursor pagination, sorting, column visibility, field selection, and state subscriptions (`subscribe`/`getSnapshot` for useSyncExternalStore).
- **InfiniteTableAdapter** (`src/lib/adapter/infinite-adapter/`) — wraps BaseTableAdapter for infinite scroll, accumulating rows across pages.
- **Factory pattern** (`src/lib/factory/utils.ts`) — `createColumnBuilder<TEntity, TFieldKey>()` returns a proxy-based builder for type-safe column definitions. `createTableApi()` wraps the adapter with a public API.
- **Entity factories** (`src/entities/customer/`) — pre-configured factories per entity (e.g., `createCustomerTable()`), handling sorting converters, query options, and fetch functions.
- **Pagination** (`src/lib/pagination/`) — cursor-based pagination (GraphQL Connection pattern) with cursor history for prev/next navigation.

### Type system

Columns carry field keys as branded types. `ExtractFieldsFromColumnDefs` extracts field keys from column arrays, and `EntityRowType` derives row types containing only selected fields (via SDK's `PickFields`). This means rows are typed with exactly the fields the user's columns reference.

### Framework bindings

Thin wrappers around the core adapter:
- React: `useCustomerTable()` hook using useSyncExternalStore
- Vue: `useCustomerTable()` composable with reactive refs
- Svelte: `createCustomerTable()` using Svelte 5 runes ($state, $derived, $effect)

## Code Standards

- **Use `bun`** for all commands — never npm, pnpm, yarn, node, or vite directly
- **Use CLI for dependencies** — `bun add <pkg>` / `bun add -d <pkg>`, never edit package.json manually
- **Strict TypeScript** — no `any`, no `@ts-ignore`/`@ts-expect-error`/`@ts-nocheck`, no `eslint-disable`. Use `unknown`, generics, or proper type narrowing. If truly unfixable, stop and ask.
- **Simplicity** — prefer the simplest solution. No over-engineering, no premature abstraction, no unnecessary wrappers. If 10 lines solve it, don't write 50.
- **Type imports** — use `import type { ... }` for type-only imports
- **Unused variables** — prefix with `_` if intentionally unused
