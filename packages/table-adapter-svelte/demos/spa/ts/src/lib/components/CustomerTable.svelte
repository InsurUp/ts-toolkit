<script lang="ts">
  import { onDestroy } from "svelte";
  import { createCustomerTable, type AdapterState } from "@insurup/table-adapter-svelte";
  import { getClient } from "$lib/client";
  import { toast } from "svelte-sonner";
  import {
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
  } from "@lucide/svelte";

  const client = getClient();
  let searchInput = $state("");

  const customerTable = createCustomerTable({
    columns: (col) => [
      col.id(),
      col.name(),
      col.type(),
      col.primaryEmail(),
      col.primaryPhoneNumber(),
      col.createdAt({ header: "Created", sortable: true }),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pageSize: 10,
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
    // Required TanStack Table state for column pinning
    tableOptions: {
      enableSorting: true,
      state: {
        columnPinning: { left: [], right: [] },
        columnVisibility: {},
        columnOrder: [],
      },
    },
  });

  onDestroy(() => customerTable.destroy());

  // Reactive state using Svelte 5 runes with explicit type
  let adapterState: AdapterState<Record<string, unknown>> = $state(customerTable.state);
  customerTable.subscribe((s) => (adapterState = s));

  // Get table instance
  const { adapter } = customerTable;

  // Derived table for reactivity
  const table = $derived(customerTable.table);

  // Force reactivity: these derivations explicitly depend on adapterState
  // which updates on every fetch, ensuring table methods are re-evaluated
  const headerGroups = $derived.by(() => {
    void adapterState; // access to create reactive dependency
    return table.getHeaderGroups();
  });

  const rows = $derived.by(() => {
    void adapterState; // access to create reactive dependency
    return table.getRowModel().rows;
  });

  const canGoPrevious = $derived.by(() => {
    void adapterState;
    return table.getCanPreviousPage();
  });

  const canGoNext = $derived.by(() => {
    void adapterState;
    return table.getCanNextPage();
  });

  const sortingState = $derived.by(() => {
    void adapterState;
    return table.getState().sorting;
  });

  const pageIndex = $derived.by(() => {
    void adapterState;
    return table.getState().pagination.pageIndex;
  });

  function handleSearch(value: string): void {
    searchInput = value;
    if (value.trim()) {
      adapter.setSearch({
        name: { textSearch: { value: value.trim() } },
      });
    } else {
      adapter.clearSearch();
    }
  }

  function handleRefresh(): void {
    adapter.invalidate();
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
      <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
      <p class="text-muted-foreground">
        Customer table using createCustomerTable with TanStack Table.
      </p>
    </div>
    <button
      class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent"
      disabled={adapterState.isLoading}
      onclick={handleRefresh}
    >
      <RefreshCw class="h-4 w-4 {adapterState.isLoading ? 'animate-spin' : ''}" />
      Refresh
    </button>
  </div>

  <div class="flex items-center gap-4">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search customers..."
        bind:value={searchInput}
        class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm"
        oninput={(e) => handleSearch(e.currentTarget.value)}
      />
    </div>
  </div>

  <div class="relative w-full overflow-x-auto">
    <table class="w-full caption-bottom text-sm">
      <thead class="[&_tr]:border-b">
        {#each headerGroups as headerGroup (headerGroup.id)}
          <tr>
            {#each headerGroup.headers as header (header.id)}
              <th
                class="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap {header.column.getCanSort() ? 'cursor-pointer select-none' : ''}"
                onclick={header.column.getToggleSortingHandler()}
              >
                <div class="flex items-center">
                  {#if !header.isPlaceholder}
                    {#if typeof header.column.columnDef.header === "string"}
                      {header.column.columnDef.header}
                    {:else}
                      {header.column.id}
                    {/if}
                  {/if}
                  {#if header.column.getCanSort()}
                    {@const sortItem = sortingState.find((s) => s.id === header.column.id)}
                    {#if sortItem?.desc === true}
                      <ArrowDown class="ml-2 h-4 w-4" />
                    {:else if sortItem?.desc === false}
                      <ArrowUp class="ml-2 h-4 w-4" />
                    {:else}
                      <ArrowUpDown class="ml-2 h-4 w-4" />
                    {/if}
                  {/if}
                </div>
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#if adapterState.isLoading}
          {#each {length: 5} as _}
            <tr class="border-b">
              {#each table.getAllColumns() as _col (_col.id)}
                <td class="p-2">
                  <div class="h-4 w-full bg-accent animate-pulse rounded-md"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {:else if adapterState.error}
          <tr>
            <td
              colspan={table.getAllColumns().length}
              class="h-24 text-center text-destructive"
            >
              Error: {adapterState.error.message}
            </td>
          </tr>
        {:else if rows.length === 0}
          <tr>
            <td
              colspan={table.getAllColumns().length}
              class="h-24 text-center"
            >
              No customers found.
            </td>
          </tr>
        {:else}
          {#each rows as row (row.id)}
            <tr class="border-b hover:bg-muted/50">
              {#each row.getVisibleCells() as cell (cell.id)}
                <td class="p-2 align-middle whitespace-nowrap">
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
      Page {pageIndex + 1} of {adapterState.pageCount || 1}
    </div>
    <div class="flex items-center space-x-2">
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!canGoPrevious || adapterState.isLoading}
        onclick={() => table.previousPage()}
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </button>
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!canGoNext || adapterState.isLoading}
        onclick={() => table.nextPage()}
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>
