# @insurup/table-adapter-svelte

Svelte bindings for [@insurup/table-adapter-core](https://www.npmjs.com/package/@insurup/table-adapter-core).

## Installation

```bash
npm install @insurup/table-adapter-svelte @insurup/sdk @tanstack/table-core
```

```bash
bun add @insurup/table-adapter-svelte @insurup/sdk @tanstack/table-core
```

## Usage (Svelte 5)

The `createCustomerTable` function returns a `CustomerTableInstance` with a **reactive** `state` property powered by Svelte 5's `$state` rune.

**No subscription needed!** Just access `ct.state` directly in your template.

```svelte
<script lang="ts">
import { onDestroy } from 'svelte';
import { createCustomerTable } from '@insurup/table-adapter-svelte';
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com',
  tokenProvider: () => token,
});

// Create the customer table - state is reactive!
const ct = createCustomerTable({
  columns: (col) => [col.id(), col.name(), col.primaryEmail()],
  fetch: (options) => client.customers.getCustomers(options),
  autoFetch: true,
});

// Cleanup on unmount
onDestroy(() => ct.destroy());

// Search handler
function handleSearch(value: string) {
  if (value.trim()) {
    ct.adapter.setSearch({ name: { textSearch: { value: value.trim() } } });
  } else {
    ct.adapter.clearSearch();
  }
}
</script>

<!-- ct.state is reactive - no subscription needed! -->
{#if ct.state.isLoading}
  <p>Loading...</p>
{:else if ct.state.error}
  <p>Error: {ct.state.error.message}</p>
{:else}
  <table>
    <thead>
      {#each ct.table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th>{header.column.columnDef.header}</th>
          {/each}
        </tr>
      {/each}
    </thead>
    <tbody>
      {#each ct.table.getRowModel().rows as row}
        <tr>
          {#each row.getVisibleCells() as cell}
            <td>{cell.getValue()}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <div>
    Page {ct.table.getState().pagination.pageIndex + 1} of {ct.state.pageCount}
    <button onclick={() => ct.table.previousPage()} disabled={!ct.table.getCanPreviousPage()}>
      Previous
    </button>
    <button onclick={() => ct.table.nextPage()} disabled={!ct.table.getCanNextPage()}>
      Next
    </button>
  </div>
{/if}
```

## API

### createCustomerTable

```ts
const ct = createCustomerTable(options);
```

**Returns a `CustomerTableInstance` with:**

| Property  | Type            | Description                            |
| --------- | --------------- | -------------------------------------- |
| `state`   | `AdapterState`  | **Reactive** adapter state via `$state`|
| `table`   | `Table`         | TanStack Table instance                |
| `adapter` | `CustomerTable` | Raw adapter for advanced use           |
| `destroy` | `Function`      | Cleanup function - call in `onDestroy` |

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

### Reactivity

The `state` property is reactive via Svelte 5's `$state` rune. Access it directly in your template:

```svelte
<!-- This is reactive - updates automatically when data changes -->
{#if ct.state.isLoading}
  <p>Loading...</p>
{/if}

{#each ct.table.getRowModel().rows as row}
  ...
{/each}
```

This package re-exports everything from `@insurup/table-adapter-core`. See the [core package documentation](https://www.npmjs.com/package/@insurup/table-adapter-core) for full API details.

## License

MIT
