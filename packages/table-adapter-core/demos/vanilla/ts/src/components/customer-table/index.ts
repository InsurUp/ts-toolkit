import { appState } from "../../state";
import { renderSortIcon, renderSkeletonRows, formatDate } from "./helpers";

export function renderCustomerTable(): string {
  const state = appState.currentState;
  const table = appState.tanstackTable;

  if (!state || !table) {
    return `
      <div class="flex min-h-[50vh] items-center justify-center">
        <div class="text-center">
          <div class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p class="text-muted-foreground">Loading...</p>
        </div>
      </div>
    `;
  }

  const headers = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pagination = table.getState().pagination;

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
          <p class="text-muted-foreground">
            Customer table using createCustomerTable with TanStack Table.
          </p>
        </div>
        <button id="refresh-btn" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent" ${state.isLoading ? "disabled" : ""}>
          ${state.isLoading ? "⏳" : "🔄"} Refresh
        </button>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-sm">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            id="search-input"
            type="text"
            placeholder="Search customers..."
            value="${appState.searchInput}"
            class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      <div class="relative w-full overflow-x-auto">
        <table class="w-full caption-bottom text-sm">
          <thead class="[&_tr]:border-b">
            ${headers.map(headerGroup => `
              <tr>
                ${headerGroup.headers.map(header => `
                  <th class="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}" data-sort-column="${header.column.id}">
                    <div class="flex items-center">
                      ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.column.id}
                      ${header.column.getCanSort() ? renderSortIcon(header.column.id, table) : ""}
                    </div>
                  </th>
                `).join("")}
              </tr>
            `).join("")}
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            ${state.isLoading ? renderSkeletonRows(6) : ""}
            ${state.error ? `
              <tr>
                <td colspan="6" class="h-24 text-center text-destructive">
                  Error: ${state.error.message}
                </td>
              </tr>
            ` : ""}
            ${!state.isLoading && !state.error && rows.length === 0 ? `
              <tr>
                <td colspan="6" class="h-24 text-center">
                  No customers found.
                </td>
              </tr>
            ` : ""}
            ${!state.isLoading && !state.error && rows.length > 0 ? rows.map(row => `
              <tr class="border-b hover:bg-muted/50">
                ${row.getVisibleCells().map(cell => `
                  <td class="p-2 align-middle whitespace-nowrap">
                    ${cell.column.id === "type" 
                      ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">${cell.getValue() ?? "-"}</span>`
                      : cell.column.id === "createdAt"
                        ? formatDate(cell.getValue() as string)
                        : cell.getValue() ?? "-"
                    }
                  </td>
                `).join("")}
              </tr>
            `).join("") : ""}
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Page ${pagination.pageIndex + 1} of ${state.pageCount || 1}
        </div>
        <div class="flex items-center space-x-2">
          <button id="prev-page" class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50" ${!table.getCanPreviousPage() || state.isLoading ? "disabled" : ""}>
            ◀ Previous
          </button>
          <button id="next-page" class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50" ${!table.getCanNextPage() || state.isLoading ? "disabled" : ""}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  `;
}
