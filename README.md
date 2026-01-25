# InsurUp TypeScript Toolkit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-f9f1e1.svg)](https://bun.sh/)

Official TypeScript packages for building integrations with the InsurUp insurance platform. This monorepo contains type-safe libraries for API access and shared type definitions.

---

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@insurup/sdk`](./packages/sdk) | Full-featured SDK client with REST and GraphQL support | [![npm](https://img.shields.io/npm/v/@insurup/sdk.svg)](https://www.npmjs.com/package/@insurup/sdk) |
| [`@insurup/contracts`](./packages/contracts) | Standalone TypeScript type definitions | [![npm](https://img.shields.io/npm/v/@insurup/contracts.svg)](https://www.npmjs.com/package/@insurup/contracts) |

---

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

const result = await client.customers.getCustomer('customer-id');

if (result.isSuccess) {
  console.log(result.data);
}
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

---

## Which Package Should I Use?

| Use Case | Package |
|----------|---------|
| Building an application that calls InsurUp APIs | `@insurup/sdk` |
| Need GraphQL queries with filtering and pagination | `@insurup/sdk` |
| Want built-in error handling and retries | `@insurup/sdk` |
| Only need type definitions for your own API client | `@insurup/contracts` |
| Building a shared library that uses InsurUp types | `@insurup/contracts` |
| Server-side validation with InsurUp schemas | `@insurup/contracts` |

The SDK re-exports all types from contracts, so you don't need to install both.

---

## Features

### SDK (`@insurup/sdk`)

- **Zero Dependencies** — No external runtime dependencies
- **Dual Format** — ESM and CommonJS builds included
- **Type-Safe Results** — Discriminated unions for error handling
- **GraphQL Support** — Built-in queries with type-safe field selection
- **17 API Clients** — Customers, policies, proposals, vehicles, cases, and more
- **Interceptors** — Request/response hooks for logging and customization
- **Retry Logic** — Configurable retry strategies with exponential backoff

### Contracts (`@insurup/contracts`)

- **Complete Type Coverage** — All InsurUp API types and enums
- **Zero Runtime** — Pure TypeScript definitions, no runtime code
- **Tree-Shakeable** — Import only what you need
- **GraphQL Types** — Filter, sort, and pagination types for queries

---

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
bun run check-types
```

### Project Structure

```
ts-toolkit/
├── packages/
│   ├── sdk/           # @insurup/sdk - Full API client
│   │   ├── src/
│   │   │   ├── client/    # HTTP and GraphQL transports
│   │   │   ├── clients/   # Domain-specific API clients
│   │   │   └── core/      # Error handling, retry logic
│   │   └── test/
│   └── contracts/     # @insurup/contracts - Type definitions
│       └── src/
│           ├── *.ts       # Domain contracts
│           └── graphql/   # GraphQL-specific types
├── package.json       # Workspace root
└── tsconfig.base.json # Shared TypeScript config
```

---

## Compatibility

| Environment | Support |
|-------------|---------|
| Node.js | 18+ |
| Browsers | ES2022+ (Chrome 94+, Firefox 93+, Safari 15+) |
| Bun | 1.0+ |
| Deno | 1.0+ |

---

## License

[MIT](LICENSE)
