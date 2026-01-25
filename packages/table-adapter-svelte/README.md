# @insurup/table-adapter-svelte

Svelte bindings for [@insurup/table-adapter-core](https://www.npmjs.com/package/@insurup/table-adapter-core).

## Installation

```bash
npm install @insurup/table-adapter-svelte @insurup/sdk @tanstack/svelte-table
```

```bash
bun add @insurup/table-adapter-svelte @insurup/sdk @tanstack/svelte-table
```

## Usage (Svelte 5)

```svelte
<script lang="ts">
import { onDestroy } from 'svelte';
import { createCustomerTable } from '@insurup/table-adapter-svelte';
import { FlexRender } from '@tanstack/svelte-table';
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com',
  tokenProvider: () => token,
});

const customerTable = createCustomerTable({
  columns: (col) => [col.id(), col.name(), col.primaryEmail()],
  fetch: (options) => client.customers.getCustomers(options),
  autoFetch: true,
});

// Cleanup on unmount
onDestroy(() => customerTable.destroy());

// For Svelte 5: create reactive state
let state = $state(customerTable.state);
customerTable.subscribe((s) => (state = s));

// Table is a Svelte store
const { table } = customerTable;
</script>

{#if state.isLoading}
  <p>Loading...</p>
{:else if state.error}
  <p>Error: {state.error.message}</p>
{:else}
  <table>
    <thead>
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th>
              <FlexRender
                content={header.column.columnDef.header}
                context={header.getContext()}
              />
            </th>
          {/each}
        </tr>
      {/each}
    </thead>
    <tbody>
      {#each $table.getRowModel().rows as row}
        <tr>
          {#each row.getVisibleCells() as cell}
            <td>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <div>
    Page {$table.getState().pagination.pageIndex + 1} of {state.pageCount}
    <button onclick={() => $table.previousPage()} disabled={!$table.getCanPreviousPage()}>
      Previous
    </button>
    <button onclick={() => $table.nextPage()} disabled={!$table.getCanNextPage()}>
      Next
    </button>
  </div>
{/if}
```

## API

### createCustomerTable

```ts
const customerTable = createCustomerTable(options);
```

**Returns:**

| Property    | Type              | Description                        |
| ----------- | ----------------- | ---------------------------------- |
| `state`     | `AdapterState`    | Current adapter state (use getter) |
| `table`     | `Readable<Table>` | TanStack Table Svelte store        |
| `adapter`   | `CustomerTable`   | Raw adapter for advanced use       |
| `subscribe` | `Function`        | Svelte store contract for state    |
| `destroy`   | `Function`        | Cleanup function                   |

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
