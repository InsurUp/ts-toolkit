# @insurup/table-adapter-core

Framework-agnostic TanStack Table adapter for [@insurup/sdk](https://www.npmjs.com/package/@insurup/sdk).

This is the core package that provides the table adapter logic. For framework-specific bindings, see:

- [`@insurup/table-adapter-react`](https://www.npmjs.com/package/@insurup/table-adapter-react) - React bindings
- [`@insurup/table-adapter-vue`](https://www.npmjs.com/package/@insurup/table-adapter-vue) - Vue bindings
- [`@insurup/table-adapter-svelte`](https://www.npmjs.com/package/@insurup/table-adapter-svelte) - Svelte bindings

## Features

- 🚀 Framework agnostic - works with React, Vue, Svelte, Solid, or vanilla JS
- 🔄 Built-in caching via `@tanstack/query-core`
- 📝 Type-safe columns with SDK field autocompletion
- 📄 Cursor pagination handled internally

## Installation

```bash
npm install @insurup/table-adapter-core @insurup/sdk
```

```bash
bun add @insurup/table-adapter-core @insurup/sdk
```

## Quick Start

```typescript
import { createCustomerTable } from '@insurup/table-adapter-core';
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com',
  tokenProvider: () => token,
});

// Create table adapter with builder API
const customerTable = createCustomerTable({
  columns: (col) => [
    col.id({ header: 'ID' }),
    col.name({ header: 'Name', sortable: true }),
    col.primaryEmail('Email'),
    col.createdAt({ header: 'Created', sortable: true }),
  ],
  fetch: (options) => client.customers.getCustomers(options),
  pageSize: 10,
  autoFetch: true,
  // Sorting is managed by the consumer via tableOptions.state.sorting
  tableOptions: {
    state: {
      sorting: [{ id: 'createdAt', desc: true }],
    },
    onSortingChange: (updater) => {
      // Update your sorting state here
    },
  },
});

// Subscribe to state changes
const unsubscribe = customerTable.subscribe(() => {
  const state = customerTable.getSnapshot();
  console.log('Data:', state.rows);
});

// Get TanStack Table options
const tableOptions = customerTable.getTableOptions();

// Cleanup when done
customerTable.destroy();
```

## API

### createCustomerTable

Creates a customer table adapter with built-in caching and state management.

```typescript
const customerTable = createCustomerTable({
  // Required
  columns: (col) => [...],          // Builder function for columns
  fetch: (options) => Promise,      // SDK fetch function

  // Optional
  pageSize?: number,                // Items per page (default: 20)
  defaultFilter?: FilterInput,      // Initial filter
  defaultSearch?: SearchInput,      // Initial search
  staleTime?: number,               // Cache stale time in ms (default: 30000)
  gcTime?: number,                  // Garbage collection time in ms (default: 300000)
  autoFetch?: boolean,              // Fetch on creation (default: false)

  // Callbacks
  onError?: (error) => void,        // Called on fetch error
  onSuccess?: (data) => void,       // Called on fetch success
  onSettled?: (data, error) => void // Called after fetch completes
});
```

### Column Builder

The `columns` option receives a builder with methods for each field:

```typescript
columns: (col) => [
  // Simple - uses field name as header
  col.id(),

  // With custom header
  col.name('Customer Name'),

  // With full config
  col.type({
    header: 'Type',
    sortable: true,
    render: (value) => (value === 'Individual' ? '👤' : '🏢'),
  }),

  // Computed column using multiple fields
  col.computed({
    uses: ['cityText', 'districtText'] as const,
    header: 'Location',
    render: (row) => `${row.cityText}, ${row.districtText}`,
  }),
];
```

### Adapter Methods

| Method                | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `columns`             | TanStack ColumnDef[] (readonly)                                           |
| `getState()`          | Current state: `{ rows, rowCount, pageCount, isLoading, error, ... }`     |
| `getTableOptions()`   | Complete TanStack Table options (includes data, columns, getCoreRowModel) |
| `subscribe(listener)` | Subscribe to state changes (for useSyncExternalStore)                     |
| `getSnapshot()`       | Get current state snapshot (for useSyncExternalStore)                     |
| `getServerSnapshot()` | Get server snapshot for SSR (for useSyncExternalStore)                    |
| `fetch()`             | Trigger a manual fetch                                                    |
| `invalidate()`        | Invalidate cache and refetch                                              |
| `refetch({ force })`  | Refetch with optional cache bypass                                        |
| `destroy()`           | Clean up resources (call on unmount)                                      |
| `setFilter(filter)`   | Set filter and refetch                                                    |
| `clearFilter()`       | Clear filter and refetch                                                  |
| `setSearch(search)`   | Set search and refetch                                                    |
| `clearSearch()`       | Clear search and refetch                                                  |
| `setPageSize(size)`   | Change page size                                                          |

### AdapterState

State returned by `getState()` and `getSnapshot()`.

```typescript
interface AdapterState<TEntity> {
  rows: TEntity[]; // Current page data
  rowCount: number; // Total records
  pageCount: number; // Total pages
  isLoading: boolean; // Initial loading
  isFetching: boolean; // Any fetch in progress
  error: Error | null; // Error if any
  isError: boolean;
  isSuccess: boolean;
}
```

## Pagination Limitations

This adapter uses **cursor-based pagination**, which only supports sequential navigation (previous/next). Jumping to arbitrary pages (e.g., page 1 → page 5) is **not supported**.

The `getTableOptions()` method returns `paginationMode: 'cursor'` to signal this limitation.

## License

MIT
