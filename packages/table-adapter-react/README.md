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

- `setFilter(filter)` - Set filter and refetch
- `clearFilter()` - Clear filter
- `setSearch(search)` - Set search and refetch
- `clearSearch()` - Clear search
- `invalidate()` - Invalidate cache and refetch
- `refetch({ force })` - Refetch with optional cache bypass

This package re-exports everything from `@insurup/table-adapter-core`. See the [core package documentation](https://www.npmjs.com/package/@insurup/table-adapter-core) for full API details.

## License

MIT
