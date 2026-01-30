/**
 * @fileoverview Infinite Scroll Demo Page
 * @description Demonstrates infinite scroll with virtualization using TanStack Virtual
 */

import "./style.css";
import { DefaultInsurUpClient } from "@insurup/sdk";
import {
  createInfiniteCustomerTable,
  type CustomerRowType,
  type FieldColumnDef,
  type ColumnInfo,
} from "@insurup/table-adapter-core";
import type { Table, HeaderGroup, Header, Column } from "@tanstack/table-core";
import {
  startLogin,
  handleCallback,
  getAccessToken,
  isAuthenticated,
  clearTokens,
} from "./auth";

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
const ROW_HEIGHT = 48;
const TABLE_HEIGHT = 600;

// ============================================================================
// App State
// ============================================================================

const state = {
  // Table adapter (manages TanStack Table internally with row accumulation)
  customerTable: null as ReturnType<
    typeof createInfiniteCustomerTable<CustomerColumns>
  > | null,
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
  const prefersDark = stored
    ? stored === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
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
// Customer Table (Infinite Scroll Mode)
// ============================================================================

function initCustomerTable(): void {
  state.customerTable = createInfiniteCustomerTable({
    columns: (col) => [
      col.id({ header: "ID", sortable: true, hiddenByDefault: true }),
      col.name({ header: "Name", sortable: true }),
      col.type({ header: "Type", sortable: true }),
      col.primaryEmail({ header: "Email" }),
      col.primaryPhoneNumber({ header: "Phone", hiddenByDefault: true }),
      col.createdAt({ header: "Created", sortable: true }),
    ],
    fetch: (options) => getClient().customers.getCustomers(options),
    pageSize: 50, // Larger page size for infinite scroll
    autoFetch: true,
    onError: (error) => console.error("Failed to load customers:", error.message),
    tableOptions: { enableSorting: true },
  });

  // Subscribe to re-render on state changes
  state.customerTable.subscribe(() => {
    render();
  });

  render();
}

// ============================================================================
// Scroll Handling
// ============================================================================

function handleScroll(): void {
  const scrollContainer = document.getElementById(
    "scroll-container"
  ) as HTMLDivElement | null;
  if (!scrollContainer || !state.customerTable) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
  const { isFetching } = state.customerTable.getSnapshot();
  const table = state.customerTable.getTable();

  // Re-render visible rows on scroll
  renderVirtualRows();

  // Load more when near bottom
  if (
    scrollHeight - scrollTop - clientHeight < 300 &&
    table.getCanNextPage() &&
    !isFetching
  ) {
    table.nextPage();
  }
}

function renderVirtualRows(): void {
  if (!state.customerTable) return;

  const tbody = document.getElementById("virtual-tbody");
  if (!tbody) return;

  const { rows } = state.customerTable.getSnapshot();
  const table = state.customerTable.getTable();
  
  // Get scroll container to calculate visible range manually
  const scrollContainer = document.getElementById("scroll-container") as HTMLDivElement | null;
  const scrollTop = scrollContainer?.scrollTop ?? 0;
  const clientHeight = scrollContainer?.clientHeight ?? TABLE_HEIGHT;
  
  // Calculate visible range with overscan
  const overscan = 10;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan);
  const endIndex = Math.min(rows.length, Math.ceil((scrollTop + clientHeight) / ROW_HEIGHT) + overscan);
  const totalSize = rows.length * ROW_HEIGHT;

  // Update tbody height
  tbody.style.height = `${totalSize}px`;

  // Get visible columns
  const visibleColumns = table.getVisibleLeafColumns();

  // Build virtual items array manually
  const virtualItems: Array<{ index: number; start: number }> = [];
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({ index: i, start: i * ROW_HEIGHT });
  }

  // Render virtual rows
  const html = virtualItems
    .map((virtualItem) => {
      const row = rows[virtualItem.index];
      if (!row) return "";

      const cells = visibleColumns
        .map((column: Column<CustomerRow, unknown>) => {
          const value = (row as Record<string, unknown>)[column.id];
          const cellContent = formatCellValue(column.id, value);
          return `<td class="flex items-center overflow-hidden text-ellipsis whitespace-nowrap p-2 align-middle">${cellContent}</td>`;
        })
        .join("");

      return `
        <tr 
          class="grid grid-cols-4 absolute left-0 right-0 w-full border-b hover:bg-muted/50" 
          style="top: ${virtualItem.start}px; height: ${ROW_HEIGHT}px;"
          data-index="${virtualItem.index}"
        >
          ${cells}
        </tr>
      `;
    })
    .join("");
  
  tbody.innerHTML = html;
}

function formatCellValue(columnId: string, value: unknown): string {
  if (value === null || value === undefined) return "-";

  if (columnId === "type") {
    return `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">${value}</span>`;
  }

  if (columnId === "createdAt" && typeof value === "string") {
    return new Date(value).toLocaleDateString();
  }

  return String(value);
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

function renderSortIcon(
  columnId: string,
  table: Table<CustomerRow>
): string {
  const sorting = table.getState().sorting;
  const sort = sorting.find((s) => s.id === columnId);
  if (!sort) return " ↕️";
  return sort.desc ? " ↓" : " ↑";
}

function renderColumnMenu(
  columnInfo: ColumnInfo[],
  table: Table<CustomerRow>
): string {
  const visibility = table.getState().columnVisibility;
  const hideableColumns = columnInfo.filter((col) => col.hideable);

  return `
    <div class="relative">
      <button id="column-menu-btn" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent">
        ⚙️ Columns
      </button>
      ${
        state.showColumnMenu
          ? `
        <div id="column-menu-dropdown" class="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-20">
          <div class="p-2">
            <p class="text-xs font-medium text-muted-foreground mb-2 px-2">Toggle columns</p>
            ${hideableColumns
              .map(
                (col) => `
              <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                <input type="checkbox" data-column="${col.key}" ${
                  visibility[col.key] !== false ? "checked" : ""
                } class="h-4 w-4 rounded border" />
                <span class="text-sm">${col.header}</span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
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

  const table = state.customerTable.getTable();
  const adapterState = state.customerTable.getSnapshot();
  const columnInfo = state.customerTable.getColumnInfo();

  const headers = table.getHeaderGroups();
  const colCount = table.getVisibleLeafColumns().length;

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Customers (Infinite Scroll)</h1>
          <p class="text-muted-foreground">
            Virtualized infinite scroll using TanStack Virtual. 
            Loaded: ${adapterState.rows.length} rows
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a href="/index.html" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent">
            📄 Pagination Demo
          </a>
          <button id="refresh-btn" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent" ${
            adapterState.isFetching ? "disabled" : ""
          }>
            ${adapterState.isFetching ? "⏳" : "🔄"} Refresh
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="relative flex-1 max-w-sm">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input id="search-input" type="text" placeholder="Search customers..." value="${
            state.searchInput
          }" class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm" />
        </div>
        ${renderColumnMenu(columnInfo, table)}
      </div>

      <div class="relative w-full overflow-hidden rounded-md border">
        <div id="scroll-container" class="overflow-auto relative" style="height: ${TABLE_HEIGHT}px;">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b sticky top-0 bg-background z-10">
              ${headers
                .map(
                  (hg: HeaderGroup<CustomerRow>) => `
                <tr class="grid grid-cols-4 w-full">
                  ${hg.headers
                    .map(
                      (h: Header<CustomerRow, unknown>) => `
                    <th class="flex items-center h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap ${
                      h.column.getCanSort() ? "cursor-pointer select-none" : ""
                    }" data-sort="${h.column.id}">
                      <div class="flex items-center">
                        ${
                          typeof h.column.columnDef.header === "string"
                            ? h.column.columnDef.header
                            : h.column.id
                        }
                        ${h.column.getCanSort() ? renderSortIcon(h.column.id, table) : ""}
                      </div>
                    </th>
                  `
                    )
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </thead>
            <tbody id="virtual-tbody" class="block relative w-full [&_tr:last-child]:border-0" ${adapterState.isLoading && adapterState.rows.length === 0 ? `style="height: ${10 * ROW_HEIGHT}px;"` : ""}>
              ${
                adapterState.isLoading && adapterState.rows.length === 0
                  ? Array.from(
                      { length: 10 },
                      (_, i) => `
                <tr class="grid grid-cols-4 absolute left-0 right-0 w-full border-b" style="top: ${i * ROW_HEIGHT}px; height: ${ROW_HEIGHT}px;">
                  ${Array.from(
                    { length: colCount },
                    () =>
                      `<td class="flex items-center p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>`
                  ).join("")}
                </tr>
              `
                    ).join("")
                  : ""
              }
              ${
                adapterState.error
                  ? `<tr><td colspan="${colCount}" class="h-24 text-center text-destructive">Error: ${adapterState.error.message}</td></tr>`
                  : ""
              }
              ${
                !adapterState.isLoading &&
                !adapterState.error &&
                adapterState.rows.length === 0
                  ? `<tr><td colspan="${colCount}" class="h-24 text-center">No customers found.</td></tr>`
                  : ""
              }
            </tbody>
          </table>
        </div>
      </div>

      ${
        adapterState.isFetching && adapterState.rows.length > 0
          ? `
        <div class="flex items-center justify-center py-4">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span class="ml-2 text-sm text-muted-foreground">Loading more...</span>
        </div>
      `
          : ""
      }

      <div class="text-sm text-muted-foreground">
        ${
          table.getCanNextPage()
            ? "Scroll down to load more..."
            : `All ${adapterState.rows.length} customers loaded`
        }
      </div>
    </div>
  `;
}

function renderContent(): string {
  if (!isAuthenticated()) {
    return `
      <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div class="text-6xl mb-6">📊</div>
        <h1 class="text-4xl font-bold tracking-tight mb-4">Infinite Scroll Demo</h1>
        <p class="text-xl text-muted-foreground mb-8 max-w-md">
          A Vanilla TypeScript demo showcasing @insurup/table-adapter-core with TanStack Virtual for infinite scroll.
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

  // Preserve scroll position
  const scrollContainer = document.getElementById("scroll-container");
  const savedScrollTop = scrollContainer?.scrollTop ?? 0;

  // Preserve focus state
  const activeEl = document.activeElement as HTMLInputElement | null;
  const wasSearchFocused = activeEl?.id === "search-input";
  const selStart = wasSearchFocused ? activeEl.selectionStart : null;
  const selEnd = wasSearchFocused ? activeEl.selectionEnd : null;

  app.innerHTML = `
    <div class="min-h-screen bg-background">
      <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div class="container mx-auto px-4 flex h-14 items-center">
          <div class="mr-4 font-bold">Infinite Scroll Demo</div>
          <div class="flex flex-1 items-center justify-end space-x-2">
            <button id="toggle-theme" class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent" aria-label="Toggle theme">
              ${isDark() ? "☀️" : "🌙"}
            </button>
            ${
              isAuthenticated()
                ? `<button id="logout-btn" class="inline-flex items-center justify-center h-9 px-4 rounded-md border hover:bg-accent">Logout</button>`
                : ""
            }
          </div>
        </div>
      </header>
      <main class="container mx-auto px-4 py-6">
        ${renderContent()}
      </main>
    </div>
  `;

  attachEventListeners();

  // Setup scroll handler and render virtual rows
  if (isAuthenticated() && state.customerTable) {
    const { rows } = state.customerTable.getSnapshot();
    if (rows.length > 0) {
      // Render virtual rows FIRST to set tbody height
      renderVirtualRows();
      
      // Set up scroll handler and restore scroll position AFTER height is set
      const newScrollContainer = document.getElementById("scroll-container") as HTMLDivElement | null;
      if (newScrollContainer) {
        newScrollContainer.onscroll = handleScroll;
        // Restore scroll position (must be after renderVirtualRows sets tbody height)
        newScrollContainer.scrollTop = savedScrollTop;
      }
    }
  }

  // Restore focus
  if (wasSearchFocused) {
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement | null;
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
        state.customerTable?.setSearch({
          name: { textSearch: { value: value.trim() } },
        });
      } else {
        state.customerTable?.clearSearch();
      }
    }, 300);
  });

  document.querySelectorAll("[data-sort]").forEach((el) => {
    el.addEventListener("click", () => {
      const columnId = el.getAttribute("data-sort");
      if (columnId && state.customerTable) {
        state.customerTable
          .getTable()
          .getColumn(columnId)
          ?.getToggleSortingHandler()?.(new MouseEvent("click"));
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
    if (
      !target.closest("#column-menu-btn") &&
      !target.closest("#column-menu-dropdown") &&
      state.showColumnMenu
    ) {
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
    window.history.replaceState({}, "", "/infinite");
  }

  if (isAuthenticated() && !state.customerTable) {
    initCustomerTable();
  } else {
    render();
  }
}

init();
