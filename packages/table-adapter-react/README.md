# @insurup/table-adapter-react

React bindings for [@insurup/table-adapter-core](https://www.npmjs.com/package/@insurup/table-adapter-core).

## Installation

```bash
npm install @insurup/table-adapter-react @insurup/sdk @tanstack/react-table
```

```bash
bun add @insurup/table-adapter-react @insurup/sdk @tanstack/react-table
```

## Usage

```tsx
import { useCustomerTable } from '@insurup/table-adapter-react';
import { flexRender } from '@tanstack/react-table';
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com',
  tokenProvider: () => token,
});

function CustomersPage() {
  const { state, table, adapter } = useCustomerTable({
    columns: (col) => [col.id(), col.name(), col.primaryEmail()],
    fetch: (options) => client.customers.getCustomers(options),
    autoFetch: true,
  });

  if (state.isLoading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error.message}</div>;

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        Page {table.getState().pagination.pageIndex + 1} of {state.pageCount}
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
      </div>
    </div>
  );
}
```

## API

### useCustomerTable

```tsx
const { state, table, adapter } = useCustomerTable(options);
```

**Returns:**

| Property  | Type            | Description                                        |
| --------- | --------------- | -------------------------------------------------- |
| `state`   | `AdapterState`  | Current adapter state (loading, error, rows, etc.) |
| `table`   | `Table`         | TanStack Table instance                            |
| `adapter` | `CustomerTable` | Raw adapter for advanced use                       |

**`state` properties:**

- `rows` - Current page data
- `isLoading` - Initial loading state
- `isFetching` - Any fetch in progress
- `error` - Error if any
- `pageCount` - Total pages
- `rowCount` - Total records

**`adapter` methods:**

- `setFilter(filter)` — set the **unified** filter (filter ops + `$search`-marked entries) and refetch
- `getFilter()` — get the current unified filter
- `clearFilter()` — clear the filter and refetch
- `invalidate()` — invalidate cache and refetch
- `refetch({ force })` — refetch with optional cache bypass

The adapter exposes **one** filter API. There is no `setSearch` — fields are promoted to server-side search by adding `$search: true` to the per-field value. The adapter splits the unified value into the server's `filter:` and `search:` slots at fetch time.

```tsx
// Plain filter — routed to the server's `filter:` slot
adapter.setFilter({ type: { eq: CustomerType.Individual } });

// Search — `$search: true` routes to `search:` and unlocks text-search ops
adapter.setFilter({ name: { $search: true, textSearch: 'ali' } });

// Mixed in one call — splits into both slots
adapter.setFilter({
  type: { eq: CustomerType.Individual },
  name: { $search: true, textSearch: { value: 'ali', score: { boost: 2 } } },
});
```

See the [`@insurup/table-adapter-core` README](https://www.npmjs.com/package/@insurup/table-adapter-core) for the full unified-filter shape (combinators, score boost/constant, runtime meta introspection).

## License

MIT
