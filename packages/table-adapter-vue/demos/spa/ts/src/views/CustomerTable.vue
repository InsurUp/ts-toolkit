<script setup lang="ts">
import { ref } from "vue";
import { useCustomerTable } from "@insurup/table-adapter-vue";
import { FlexRender } from "@tanstack/vue-table";
import { useClient } from "@/composables/useClient";
import { toast } from "vue-sonner";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-vue-next";

const client = useClient();
const searchInput = ref("");

const { state, table, adapter } = useCustomerTable({
  columns: (col) => [
    col.id(),
    col.name(),
    col.type(),
    col.primaryEmail(),
    col.primaryPhoneNumber(),
    col.createdAt(),
  ],
  fetch: (options) => client.customers.getCustomers(options),
  pagination: { type: 'cursor', pageSize: 10 },
  autoFetch: true,
  onError: (error) => {
    toast.error(`Failed to load customers: ${error.message}`);
  },
});

function handleSearch(value: string): void {
  searchInput.value = value;
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

function getSortIcon(columnId: string): typeof ArrowUpDown | typeof ArrowUp | typeof ArrowDown {
  const sorting = table.getState().sorting;
  const sortItem = sorting.find((s) => s.id === columnId);
  if (!sortItem) return ArrowUpDown;
  return sortItem.desc ? ArrowDown : ArrowUp;
}

function formatDate(dateStr: unknown): string {
  if (typeof dateStr !== "string") return "-";
  return new Date(dateStr).toLocaleDateString();
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          Customers
        </h1>
        <p class="text-muted-foreground">
          Customer table using useCustomerTable composable with TanStack Table.
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent"
        :disabled="state.isLoading"
        @click="handleRefresh"
      >
        <RefreshCw :class="['h-4 w-4', state.isLoading ? 'animate-spin' : '']" />
        Refresh
      </button>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search customers..."
          :value="searchInput"
          class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm"
          @input="handleSearch(($event.target as HTMLInputElement).value)"
        >
      </div>
    </div>

    <div class="relative w-full overflow-x-auto">
      <table class="w-full caption-bottom text-sm">
        <thead class="[&_tr]:border-b">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap"
              :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <component
                  :is="getSortIcon(header.column.id)"
                  v-if="header.column.getCanSort()"
                  class="ml-2 h-4 w-4"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="[&_tr:last-child]:border-0">
          <template v-if="state.isLoading">
            <tr
              v-for="i in 5"
              :key="`skeleton-${i}`"
              class="border-b"
            >
              <td
                v-for="col in table.getAllColumns()"
                :key="col.id"
                class="p-2"
              >
                <div class="h-4 w-full bg-accent animate-pulse rounded-md" />
              </td>
            </tr>
          </template>
          <template v-else-if="state.error">
            <tr>
              <td
                :colspan="table.getAllColumns().length"
                class="h-24 text-center text-destructive"
              >
                Error: {{ state.error.message }}
              </td>
            </tr>
          </template>
          <template v-else-if="table.getRowModel().rows.length === 0">
            <tr>
              <td
                :colspan="table.getAllColumns().length"
                class="h-24 text-center"
              >
                No customers found.
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="border-b hover:bg-muted/50"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="p-2 align-middle whitespace-nowrap"
              >
                <template v-if="cell.column.id === 'type'">
                  <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                    <FlexRender
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </span>
                </template>
                <template v-else-if="cell.column.id === 'createdAt'">
                  {{ formatDate(cell.getValue()) }}
                </template>
                <template v-else>
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Page {{ table.getState().pagination.pageIndex + 1 }} of {{ state.pageCount || 1 }}
      </div>
      <div class="flex items-center space-x-2">
        <button
          class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
          :disabled="!table.getCanPreviousPage() || state.isLoading"
          @click="table.previousPage()"
        >
          <ChevronLeft class="h-4 w-4" />
          Previous
        </button>
        <button
          class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
          :disabled="!table.getCanNextPage() || state.isLoading"
          @click="table.nextPage()"
        >
          Next
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
