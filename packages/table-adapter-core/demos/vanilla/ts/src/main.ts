import "./style.css";
import { DefaultInsurUpClient } from "@insurup/sdk";
import {
  createCustomerTable,
  type CustomerRowType,
  type FieldColumnDef,
  type ColumnInfo,
} from "@insurup/table-adapter-core";
import type { Table, HeaderGroup, Header, Row, Cell } from "@tanstack/table-core";
import { startLogin, handleCallback, getAccessToken, isAuthenticated, clearTokens } from "./auth";

// ============================================================================
// Types
// ============================================================================

type CustomerColumns = [
  FieldColumnDef<"id">,
  FieldColumnDef<"name">,
  FieldColumnDef<"type">,
  FieldColumnDef<"primaryEmail">,
  FieldColumnDef<"primaryPhoneNumber">,
  FieldColumnDef<"createdAt">
];

type CustomerRow = CustomerRowType<CustomerColumns>;

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  apiBaseUrl: "https://api.insurup.com",
};

const THEME_STORAGE_KEY = "table_adapter_vanilla_theme";

// ============================================================================
// App State
// ============================================================================

const state = {
  // Table adapter (manages TanStack Table internally)
  customerTable: null as ReturnType<typeof createCustomerTable<CustomerColumns>> | null,
  // UI
  searchInput: "",
  searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
  showColumnMenu: false,
};

// ============================================================================
// Theme
// ============================================================================

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function setTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
}

function initTheme(): void {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark);
}

// ============================================================================
// API Client
// ============================================================================

let client: DefaultInsurUpClient | null = null;

function getClient(): DefaultInsurUpClient {
  if (!client) {
    client = new DefaultInsurUpClient({
      tokenProvider: () => getAccessToken(),
      baseUrl: CONFIG.apiBaseUrl,
    });
  }
  return client;
}

// ============================================================================
// Customer Table
// ============================================================================

function initCustomerTable(): void {
  state.customerTable = createCustomerTable({
    columns: (col) => [
      col.id({ header: "ID", sortable: true, hiddenByDefault: true }),
      col.name({ header: "Name", sortable: true }),
      col.type({ header: "Type", sortable: true }),
      col.primaryEmail({ header: "Email" }),
      col.primaryPhoneNumber({ header: "Phone", hiddenByDefault: true }),
      col.createdAt({ header: "Created", sortable: true }),
    ],
    fetch: (options) => getClient().customers.getCustomers(options),
    pagination: { type: 'cursor', pageSize: 10 },
    autoFetch: true,
    onError: (error) => console.error("Failed to load customers:", error.message),
    tableOptions: { enableSorting: true },
  });

  // Subscribe to re-render (TanStack Table is auto-synced by getTable())
  state.customerTable.subscribe(() => render());

  render();
}

// ============================================================================
// Auth Actions
// ============================================================================

function logout(): void {
  clearTokens();
  state.customerTable = null;
  render();
}

// ============================================================================
// Rendering
// ============================================================================

function formatDate(value: unknown): string {
  return typeof value === "string" ? new Date(value).toLocaleDateString() : "-";
}

function renderSortIcon(columnId: string, table: Table<CustomerRow>): string {
  const sorting = table.getState().sorting;
  const sort = sorting.find((s) => s.id === columnId);
  if (!sort) return " ↕️";
  return sort.desc ? " ↓" : " ↑";
}

function renderColumnMenu(columnInfo: ColumnInfo[], table: Table<CustomerRow>): string {
  const visibility = table.getState().columnVisibility;
  const hideableColumns = columnInfo.filter((col) => col.hideable);

  return `
    <div class="relative">
      <button id="column-menu-btn" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent">
        ⚙️ Columns
      </button>
      ${state.showColumnMenu ? `
        <div id="column-menu-dropdown" class="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-10">
          <div class="p-2">
            <p class="text-xs font-medium text-muted-foreground mb-2 px-2">Toggle columns</p>
            ${hideableColumns.map((col) => `
              <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                <input type="checkbox" data-column="${col.key}" ${visibility[col.key] !== false ? "checked" : ""} class="h-4 w-4 rounded border" />
                <span class="text-sm">${col.header}</span>
              </label>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderTable(): string {
  if (!state.customerTable) {
    return `
      <div class="flex min-h-[50vh] items-center justify-center">
        <div class="text-center">
          <div class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p class="text-muted-foreground">Loading...</p>
        </div>
      </div>
    `;
  }

  // Get table and state from adapter (table is auto-synced)
  const table = state.customerTable.getTable();
  const adapterState = state.customerTable.getSnapshot();
  const columnInfo = state.customerTable.getColumnInfo();

  const headers = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const pagination = table.getState().pagination;
  const colCount = table.getVisibleLeafColumns().length;

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Customers (Pagination)</h1>
          <p class="text-muted-foreground">Customer table using createCustomerTable with TanStack Table.</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/infinite.html" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent">
            ♾️ Infinite Scroll Demo
          </a>
          <button id="refresh-btn" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent" ${adapterState.isLoading ? "disabled" : ""}>
            ${adapterState.isLoading ? "⏳" : "🔄"} Refresh
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-sm">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input id="search-input" type="text" placeholder="Search customers..." value="${state.searchInput}" class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm" />
        </div>
        ${renderColumnMenu(columnInfo, table)}
      </div>

      <div class="relative w-full overflow-x-auto">
        <table class="w-full caption-bottom text-sm">
          <thead class="[&_tr]:border-b">
            ${headers.map((hg: HeaderGroup<CustomerRow>) => `
              <tr>
                ${hg.headers.map((h: Header<CustomerRow, unknown>) => `
                  <th class="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap ${h.column.getCanSort() ? "cursor-pointer select-none" : ""}" data-sort="${h.column.id}">
                    <div class="flex items-center">
                      ${typeof h.column.columnDef.header === "string" ? h.column.columnDef.header : h.column.id}
                      ${h.column.getCanSort() ? renderSortIcon(h.column.id, table) : ""}
                    </div>
                  </th>
                `).join("")}
              </tr>
            `).join("")}
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            ${adapterState.isLoading ? Array.from({ length: 5 }, () => `
              <tr class="border-b">
                ${Array.from({ length: colCount }, () => `<td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>`).join("")}
              </tr>
            `).join("") : ""}
            ${adapterState.error ? `<tr><td colspan="${colCount}" class="h-24 text-center text-destructive">Error: ${adapterState.error.message}</td></tr>` : ""}
            ${!adapterState.isLoading && !adapterState.error && rows.length === 0 ? `<tr><td colspan="${colCount}" class="h-24 text-center">No customers found.</td></tr>` : ""}
            ${!adapterState.isLoading && !adapterState.error ? rows.map((row: Row<CustomerRow>) => `
              <tr class="border-b hover:bg-muted/50">
                ${row.getVisibleCells().map((cell: Cell<CustomerRow, unknown>) => `
                  <td class="p-2 align-middle whitespace-nowrap">
                    ${cell.column.id === "type"
                      ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">${cell.getValue() ?? "-"}</span>`
                      : cell.column.id === "createdAt"
                        ? formatDate(cell.getValue())
                        : cell.getValue() ?? "-"}
                  </td>
                `).join("")}
              </tr>
            `).join("") : ""}
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm text-muted-foreground">Page ${pagination.pageIndex + 1} of ${adapterState.pageCount || 1}</div>
        <div class="flex items-center space-x-2">
          <button id="prev-page" class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50" ${!table.getCanPreviousPage() || adapterState.isLoading ? "disabled" : ""}>◀ Previous</button>
          <button id="next-page" class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50" ${!table.getCanNextPage() || adapterState.isLoading ? "disabled" : ""}>Next ▶</button>
        </div>
      </div>
    </div>
  `;
}

function renderContent(): string {
  if (!isAuthenticated()) {
    return `
      <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div class="text-6xl mb-6">📊</div>
        <h1 class="text-4xl font-bold tracking-tight mb-4">Table Adapter Vanilla Demo</h1>
        <p class="text-xl text-muted-foreground mb-8 max-w-md">
          A Vanilla TypeScript demo showcasing @insurup/table-adapter-core with TanStack Table.
        </p>
        <button id="login-btn" class="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          Sign in to get started
        </button>
      </div>
    `;
  }
  return renderTable();
}

function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  // Preserve focus state
  const activeEl = document.activeElement as HTMLInputElement | null;
  const wasSearchFocused = activeEl?.id === "search-input";
  const selStart = wasSearchFocused ? activeEl.selectionStart : null;
  const selEnd = wasSearchFocused ? activeEl.selectionEnd : null;

  app.innerHTML = `
    <div class="min-h-screen bg-background">
      <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div class="container mx-auto px-4 flex h-14 items-center">
          <div class="mr-4 font-bold">Table Adapter Demo</div>
          <div class="flex flex-1 items-center justify-end space-x-2">
            <button id="toggle-theme" class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent" aria-label="Toggle theme">
              ${isDark() ? "☀️" : "🌙"}
            </button>
            ${isAuthenticated() ? `<button id="logout-btn" class="inline-flex items-center justify-center h-9 px-4 rounded-md border hover:bg-accent">Logout</button>` : ""}
          </div>
        </div>
      </header>
      <main class="container mx-auto px-4 py-6">
        ${renderContent()}
      </main>
    </div>
  `;

  attachEventListeners();

  // Restore focus
  if (wasSearchFocused) {
    const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      if (selStart !== null && selEnd !== null) {
        searchInput.setSelectionRange(selStart, selEnd);
      }
    }
  }
}

function attachEventListeners(): void {
  document.getElementById("login-btn")?.addEventListener("click", startLogin);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document.getElementById("toggle-theme")?.addEventListener("click", () => {
    setTheme(!isDark());
    render();
  });

  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    state.customerTable?.invalidate();
  });

  document.getElementById("search-input")?.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    state.searchInput = value;
    if (state.searchDebounceTimer) clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => {
      if (value.trim()) {
        state.customerTable?.setSearch({ name: { textSearch: { value: value.trim() } } });
      } else {
        state.customerTable?.clearSearch();
      }
    }, 300);
  });

  document.getElementById("prev-page")?.addEventListener("click", () => {
    state.customerTable?.getTable().previousPage();
  });
  document.getElementById("next-page")?.addEventListener("click", () => {
    state.customerTable?.getTable().nextPage();
  });

  document.querySelectorAll("[data-sort]").forEach((el) => {
    el.addEventListener("click", () => {
      const columnId = el.getAttribute("data-sort");
      if (columnId && state.customerTable) {
        state.customerTable.getTable().getColumn(columnId)?.getToggleSortingHandler()?.(new MouseEvent("click"));
      }
    });
  });

  document.getElementById("column-menu-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    state.showColumnMenu = !state.showColumnMenu;
    render();
  });

  document.querySelectorAll("[data-column]").forEach((el) => {
    el.addEventListener("change", (e) => {
      e.stopPropagation();
      const columnKey = el.getAttribute("data-column");
      if (columnKey && state.customerTable) {
        state.customerTable.getTable().getColumn(columnKey)?.toggleVisibility();
      }
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("#column-menu-btn") && !target.closest("#column-menu-dropdown") && state.showColumnMenu) {
      state.showColumnMenu = false;
      render();
    }
  });
}

// ============================================================================
// Initialization
// ============================================================================

async function init(): Promise<void> {
  initTheme();

  // Handle OAuth callback
  if (window.location.pathname === "/callback") {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const urlState = params.get("state");

    if (code && urlState) {
      try {
        await handleCallback(code, urlState);
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
    window.history.replaceState({}, "", "/");
  }

  if (isAuthenticated() && !state.customerTable) {
    initCustomerTable();
  } else {
    render();
  }
}

init();
