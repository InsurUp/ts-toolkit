<script lang="ts">
  import { onDestroy } from "svelte";
  import { createCustomerTable } from "@insurup/table-adapter-svelte";
  import { getClient } from "$lib/client";
  import { toast } from "svelte-sonner";
  import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Search,
    RefreshCw,
  } from "@lucide/svelte";

  const client = getClient();
  let searchInput = $state("");
  const SEARCH_DEBOUNCE_MS = 300;

  // Column order managed by $state
  let columnOrder = $state(["id", "name", "type", "primaryEmail", "createdAt"]);

  // Column headers map for display
  const columnHeaders: Record<string, string> = {
    id: "ID",
    name: "Name",
    type: "Type",
    primaryEmail: "Email",
    createdAt: "Created",
  };

  // Create a basic customer table instance with reactive columnOrder
  const ct = createCustomerTable(() => ({
    columns: (col) => [
      col.id({ header: "ID" }),
      col.name({ header: "Name" }),
      col.type({ header: "Type" }),
      col.primaryEmail({ header: "Email" }),
      col.createdAt({ header: "Created", sortable: true }),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pageSize: 10,
    autoFetch: true,
    tableOptions: {
      state: { columnOrder },
      // Required for controlled columnOrder - tells TanStack Table to use external state
      onColumnOrderChange: (updater) => {
        columnOrder = typeof updater === "function" ? updater(columnOrder) : updater;
      },
    },
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
  }));

  onDestroy(() => ct.destroy());

  $inspect('table', ct.table);

  // Debounced search effect
  $effect(() => {
    const value = searchInput;
    const timeout = setTimeout(() => {
      if (value.trim()) {
        ct.adapter.setSearch({
          name: { textSearch: { value: value.trim() } },
        });
      } else {
        ct.adapter.clearSearch();
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  });

  function moveColumnUp(index: number): void {
    if (index <= 0) return;
    const newOrder = [...columnOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    columnOrder = newOrder;
  }

  function moveColumnDown(index: number): void {
    if (index >= columnOrder.length - 1) return;
    const newOrder = [...columnOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    columnOrder = newOrder;
  }

  function handleRefresh(): void {
    ct.adapter.invalidate();
    toast.success("Refreshing data...");
  }

  function formatDate(dateStr: unknown): string {
    if (typeof dateStr !== "string") return "-";
    return new Date(dateStr).toLocaleDateString();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Basic Customers</h1>
      <p class="text-muted-foreground">
        A simple customer table with pagination and search.
      </p>
    </div>
    <button
      class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent"
      disabled={ct.isLoading}
      onclick={handleRefresh}
    >
      <RefreshCw class="h-4 w-4 {ct.isLoading ? 'animate-spin' : ''}" />
      Refresh
    </button>
  </div>

  <div class="flex items-center gap-4">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search customers by name..."
        bind:value={searchInput}
        class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm"
      />
    </div>
  </div>

  <!-- Column Order Manager Panel -->
  <div class="rounded-md border bg-muted/30 p-4">
    <p class="text-sm font-medium mb-3">Column Order</p>
    <div class="flex flex-wrap gap-2">
      {#each columnOrder as colId, index (colId)}
        <div class="flex items-center gap-1 rounded-md border bg-background px-2 py-1">
          <span class="text-sm">{columnHeaders[colId]}</span>
          <button
            class="p-0.5 hover:bg-accent rounded disabled:opacity-30"
            onclick={() => moveColumnUp(index)}
            disabled={index === 0}
          >
            <ChevronUp class="h-3 w-3" />
          </button>
          <button
            class="p-0.5 hover:bg-accent rounded disabled:opacity-30"
            onclick={() => moveColumnDown(index)}
            disabled={index === columnOrder.length - 1}
          >
            <ChevronDown class="h-3 w-3" />
          </button>
        </div>
      {/each}
    </div>
  </div>

  <div class="relative w-full overflow-x-auto rounded-md border">
    <table class="w-full caption-bottom text-sm">
      <thead class="[&_tr]:border-b bg-muted/50">
        <tr>
          {#each ct.table.getHeaderGroups() as headerGroup}
            {#each headerGroup.headers as header}
              <th class="h-10 px-4 text-left align-middle font-medium text-foreground">
                {#if !header.isPlaceholder}
                  {#if typeof header.column.columnDef.header === "string"}
                    {header.column.columnDef.header}
                  {:else}
                    {header.column.id}
                  {/if}
                {/if}
              </th>
            {/each}
          {/each}
        </tr>
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#if ct.isLoading}
          {#each {length: 5} as _}
            <tr class="border-b">
              {#each ct.table.getVisibleFlatColumns() as _col}
                <td class="p-4">
                  <div class="h-4 w-full bg-accent animate-pulse rounded-md"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {:else if ct.isError}
          <tr>
            <td
              colspan={ct.table.getVisibleFlatColumns().length}
              class="h-24 text-center text-destructive"
            >
              Error: {ct.error?.message}
            </td>
          </tr>
        {:else if ct.isEmpty}
          <tr>
            <td
              colspan={ct.table.getVisibleFlatColumns().length}
              class="h-24 text-center"
            >
              No customers found.
            </td>
          </tr>
        {:else}
          {#each ct.table.getRowModel().rows as row (`${row.id}-${columnOrder.join(',')}`)}
            <tr class="border-b hover:bg-muted/50">
              {#each row.getVisibleCells() as cell}
                <td class="p-4 align-middle">
                  {#if cell.column.id === "type"}
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                      {cell.getValue() ?? "-"}
                    </span>
                  {:else if cell.column.id === "createdAt"}
                    {formatDate(cell.getValue())}
                  {:else}
                    {cell.getValue() ?? "-"}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <div class="flex items-center justify-between">
    <div class="text-sm text-muted-foreground">
      Page {ct.table.getState().pagination.pageIndex + 1} of {ct.pageCount || 1}
      {#if ct.rowCount > 0}
        <span class="ml-2">({ct.rowCount} rows)</span>
      {/if}
    </div>
    <div class="flex items-center space-x-2">
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanPreviousPage() || ct.isLoading}
        onclick={() => ct.table.previousPage()}
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </button>
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanNextPage() || ct.isLoading}
        onclick={() => ct.table.nextPage()}
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>
