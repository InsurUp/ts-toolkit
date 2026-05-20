# @insurup/table-adapter-vue

Vue bindings for [@insurup/table-adapter-core](https://www.npmjs.com/package/@insurup/table-adapter-core).

## Installation

```bash
npm install @insurup/table-adapter-vue @insurup/sdk @tanstack/vue-table
```

```bash
bun add @insurup/table-adapter-vue @insurup/sdk @tanstack/vue-table
```

## Usage

```vue
<script setup lang="ts">
import { useCustomerTable } from '@insurup/table-adapter-vue';
import { FlexRender } from '@tanstack/vue-table';
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({
  baseUrl: 'https://api.insurup.com',
  tokenProvider: () => token,
});

const { state, table, adapter } = useCustomerTable({
  columns: (col) => [col.id(), col.name(), col.primaryEmail()],
  fetch: (options) => client.customers.getCustomers(options),
  autoFetch: true,
});
</script>

<template>
  <div v-if="state.isLoading">Loading...</div>
  <div v-else-if="state.error">Error: {{ state.error.message }}</div>
  <div v-else>
    <table>
      <thead>
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </table>

    <div>
      Page {{ table.getState().pagination.pageIndex + 1 }} of {{ state.pageCount }}
      <button @click="table.previousPage()" :disabled="!table.getCanPreviousPage()">
        Previous
      </button>
      <button @click="table.nextPage()" :disabled="!table.getCanNextPage()">Next</button>
    </div>
  </div>
</template>
```

## API

### useCustomerTable

```ts
const { state, table, adapter } = useCustomerTable(options);
```

**Returns:**

| Property  | Type                       | Description                  |
| --------- | -------------------------- | ---------------------------- |
| `state`   | `ShallowRef<AdapterState>` | Reactive adapter state       |
| `table`   | `Table`                    | TanStack Table instance      |
| `adapter` | `CustomerTable`            | Raw adapter for advanced use |

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

```ts
// Plain filter
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
