<script lang="ts">
  import { onDestroy } from "svelte";
  import { createCustomerTable } from "@insurup/table-adapter-svelte";
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

  // Create customer table instance
  const ct = createCustomerTable({
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
    tableOptions: {
      enableSorting: true,
    },
  });

  onDestroy(() => ct.destroy());

  // ct.state is now reactive via $state - no subscription needed!

  function handleSearch(value: string): void {
    searchInput = value;
    if (value.trim()) {
      ct.adapter.setSearch({
        name: { textSearch: { value: value.trim() } },
      });
    } else {
      ct.adapter.clearSearch();
    }
  }

  function handleRefresh(): void {
    ct.adapter.invalidate();
    toast.success("Refreshing data...");
  }

  function formatDate(dateStr: unknown): string {
    if (typeof dateStr !== "string") return "-";
    return new Date(dateStr).toLocaleDateString();
  }

  function getSortIcon(columnId: string): "asc" | "desc" | "none" {
    const sorting = ct.table.getState().sorting;
    const sortItem = sorting.find((s) => s.id === columnId);
    if (!sortItem) return "none";
    return sortItem.desc ? "desc" : "asc";
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
      disabled={ct.state.isLoading}
      onclick={handleRefresh}
    >
      <RefreshCw class="h-4 w-4 {ct.state.isLoading ? 'animate-spin' : ''}" />
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
        {#each ct.table.getHeaderGroups() as headerGroup (headerGroup.id)}
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
                    {@const sortDir = getSortIcon(header.column.id)}
                    {#if sortDir === "desc"}
                      <ArrowDown class="ml-2 h-4 w-4" />
                    {:else if sortDir === "asc"}
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
        {#if ct.state.isLoading}
          {#each {length: 5} as _}
            <tr class="border-b">
              {#each ct.table.getAllColumns() as _col (_col.id)}
                <td class="p-2">
                  <div class="h-4 w-full bg-accent animate-pulse rounded-md"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {:else if ct.state.error}
          <tr>
            <td
              colspan={ct.table.getAllColumns().length}
              class="h-24 text-center text-destructive"
            >
              Error: {ct.state.error.message}
            </td>
          </tr>
        {:else if ct.table.getRowModel().rows.length === 0}
          <tr>
            <td
              colspan={ct.table.getAllColumns().length}
              class="h-24 text-center"
            >
              No customers found.
            </td>
          </tr>
        {:else}
          {#each ct.table.getRowModel().rows as row (row.id)}
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
      Page {ct.table.getState().pagination.pageIndex + 1} of {ct.state.pageCount || 1}
    </div>
    <div class="flex items-center space-x-2">
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanPreviousPage() || ct.state.isLoading}
        onclick={() => ct.table.previousPage()}
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </button>
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanNextPage() || ct.state.isLoading}
        onclick={() => ct.table.nextPage()}
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>
