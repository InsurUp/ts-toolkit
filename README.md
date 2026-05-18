# InsurUp TypeScript Toolkit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-f9f1e1.svg)](https://bun.sh/)

Official TypeScript packages for building integrations with the InsurUp insurance platform. This monorepo contains type-safe libraries for API access, shared type definitions, and TanStack Table adapters for React, Vue, and Svelte.

## Packages

### Core

| Package                                      | Description                                            | Version                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| [`@insurup/sdk`](./packages/sdk)             | Full-featured SDK client with REST and GraphQL support | [![npm](https://img.shields.io/npm/v/@insurup/sdk.svg)](https://www.npmjs.com/package/@insurup/sdk)             |
| [`@insurup/contracts`](./packages/contracts) | Standalone TypeScript type definitions                 | [![npm](https://img.shields.io/npm/v/@insurup/contracts.svg)](https://www.npmjs.com/package/@insurup/contracts) |

### Table Adapters

TanStack Table integration for building data tables with the InsurUp SDK.

| Package                                                            | Description                                   | Version                                                                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [`@insurup/table-adapter-core`](./packages/table-adapter-core)     | Framework-agnostic table adapter with caching | [![npm](https://img.shields.io/npm/v/@insurup/table-adapter-core.svg)](https://www.npmjs.com/package/@insurup/table-adapter-core)     |
| [`@insurup/table-adapter-react`](./packages/table-adapter-react)   | React bindings (`useCustomerTable`)           | [![npm](https://img.shields.io/npm/v/@insurup/table-adapter-react.svg)](https://www.npmjs.com/package/@insurup/table-adapter-react)   |
| [`@insurup/table-adapter-vue`](./packages/table-adapter-vue)       | Vue bindings (`useCustomerTable`)             | [![npm](https://img.shields.io/npm/v/@insurup/table-adapter-vue.svg)](https://www.npmjs.com/package/@insurup/table-adapter-vue)       |
| [`@insurup/table-adapter-svelte`](./packages/table-adapter-svelte) | Svelte bindings (`createCustomerTable`)       | [![npm](https://img.shields.io/npm/v/@insurup/table-adapter-svelte.svg)](https://www.npmjs.com/package/@insurup/table-adapter-svelte) |

## Quick Start

### Full SDK (Recommended)

For complete API access with built-in HTTP client, GraphQL queries, and error handling:

```bash
npm install @insurup/sdk
```

```typescript
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});

// REST API
const customer = await client.customers.getCustomer('customer-id');

// GraphQL with type-safe field selection
const customers = await client.customers.getCustomers({
  first: 10,
  select: ['id', 'name', 'primaryEmail', 'type'] as const,
});
```

### Types Only

For projects that only need type definitions (e.g., custom API implementations, shared libraries):

```bash
npm install @insurup/contracts
```

```typescript
import type { Customer, PolicyState, ProductBranch } from '@insurup/contracts';

function processCustomer(customer: Customer): void {
  // Type-safe customer processing
}
```

### Table Adapter (React Example)

For building data tables with pagination, sorting, and caching:

```bash
npm install @insurup/table-adapter-react @insurup/sdk @tanstack/react-table
```

```tsx
import { useCustomerTable } from '@insurup/table-adapter-react';

function CustomersPage() {
  const { state, table } = useCustomerTable({
    columns: (col) => [col.id(), col.name(), col.primaryEmail()],
    fetch: (options) => client.customers.getCustomers(options),
    autoFetch: true,
  });

  if (state.isLoading) return <div>Loading...</div>;

  return <table>{/* Render with TanStack Table */}</table>;
}
```

## Which Package Should I Use?

| Use Case                                           | Package                         |
| -------------------------------------------------- | ------------------------------- |
| Building an application that calls InsurUp APIs    | `@insurup/sdk`                  |
| Need GraphQL queries with filtering and pagination | `@insurup/sdk`                  |
| Want built-in error handling and retries           | `@insurup/sdk`                  |
| Building data tables with React                    | `@insurup/table-adapter-react`  |
| Building data tables with Vue                      | `@insurup/table-adapter-vue`    |
| Building data tables with Svelte                   | `@insurup/table-adapter-svelte` |
| Only need type definitions for your own API client | `@insurup/contracts`            |
| Building a shared library that uses InsurUp types  | `@insurup/contracts`            |

> The SDK re-exports all types from contracts, so you don't need to install both.

## Features

### SDK (`@insurup/sdk`)

| Feature           | Description                                               |
| ----------------- | --------------------------------------------------------- |
| Zero Dependencies | No external runtime dependencies                          |
| Dual Format       | ESM and CommonJS builds included                          |
| Type-Safe Results | Discriminated unions for error handling                   |
| GraphQL Support   | Built-in queries with type-safe field selection           |
| 17 API Clients    | Customers, policies, proposals, vehicles, cases, and more |
| Interceptors      | Request/response hooks for logging and customization      |
| Retry Logic       | Configurable retry strategies with exponential backoff    |

### Contracts (`@insurup/contracts`)

| Feature                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| Complete Type Coverage | All InsurUp API types and enums                |
| Zero Runtime           | Pure TypeScript definitions, no runtime code   |
| Tree-Shakeable         | Import only what you need                      |
| GraphQL Types          | Filter, sort, and pagination types for queries |

### Table Adapters

| Feature           | Description                                |
| ----------------- | ------------------------------------------ |
| Framework Support | React, Vue, and Svelte bindings            |
| Built-in Caching  | Powered by `@tanstack/query-core`          |
| Type-Safe Columns | SDK field autocompletion in column builder |
| Cursor Pagination | Handles cursor-based pagination internally |
| TanStack Table    | Full compatibility with TanStack Table v8  |

## Demos

Example applications demonstrating SDK usage:

| Demo              | Description                                                 | Location                                                                     |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Web (Vanilla)** | Browser SPA with OAuth2/PKCE, GraphQL pagination, dark mode | [`packages/sdk/demos/web/vanilla`](./packages/sdk/demos/web/vanilla)         |
| **CLI (Bun)**     | Command-line app with OAuth authentication using Bun        | [`packages/sdk/demos/simple-cli/bun`](./packages/sdk/demos/simple-cli/bun)   |
| **CLI (Node)**    | Command-line app with OAuth authentication using Node.js    | [`packages/sdk/demos/simple-cli/node`](./packages/sdk/demos/simple-cli/node) |

### Running Demos

```bash
# Install dependencies from repo root
bun install

# Run the vanilla web demo
cd packages/sdk/demos/web/vanilla
bun dev

# Run the Bun CLI demo
cd packages/sdk/demos/simple-cli/bun
bun run src/index.ts
```

## Development

This monorepo uses [Bun](https://bun.sh/) workspaces.

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format
```

### Project Structure

```
ts-toolkit/
├── packages/
│   ├── sdk/                    # @insurup/sdk
│   │   ├── src/
│   │   │   ├── client/         # HTTP and GraphQL transports
│   │   │   ├── clients/        # Domain-specific API clients
│   │   │   └── core/           # Error handling, retry logic
│   │   ├── demos/
│   │   │   ├── web/vanilla/    # Browser demo with OAuth2/PKCE
│   │   │   └── simple-cli/     # CLI demos (Bun and Node)
│   │   └── test/
│   │
│   ├── contracts/              # @insurup/contracts
│   │   └── src/
│   │       ├── *.ts            # Domain contracts
│   │       └── graphql/        # GraphQL-specific types
│   │
│   ├── table-adapter-core/     # @insurup/table-adapter-core
│   │   └── src/
│   │       ├── lib/            # Adapter, pagination, sorting logic
│   │       └── entities/       # Entity-specific factories
│   │
│   ├── table-adapter-react/    # @insurup/table-adapter-react
│   ├── table-adapter-vue/      # @insurup/table-adapter-vue
│   └── table-adapter-svelte/   # @insurup/table-adapter-svelte
│
├── package.json                # Workspace root
├── tsconfig.base.json          # Shared TypeScript config
└── eslint.config.mjs           # Shared ESLint config
```

## Compatibility

| Environment | Support                                       |
| ----------- | --------------------------------------------- |
| Node.js     | 18+                                           |
| Browsers    | ES2022+ (Chrome 94+, Firefox 93+, Safari 15+) |
| Bun         | 1.0+                                          |
| Deno        | 1.0+                                          |

## License

[MIT](LICENSE)
