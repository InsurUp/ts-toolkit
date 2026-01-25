/**
 * Customer list page with pagination, search, filtering, sorting, and column visibility.
 * Supports URL state persistence for shareable/bookmarkable table views.
 */

import { getClient } from "../../client";
import { renderPagination, createPaginationTracker, type PageInfo } from "../../components/pagination";
import { renderLoading, renderEmptyState, renderError } from "../../components/loading";
import { renderTableToolbar, type FilterConfig } from "../../components/table-toolbar";
import {
  renderSortableHeaders,
  attachSortHandlers,
  buildOrderOptions,
  type SortState,
  type SortableColumn,
} from "../../components/sortable-headers";
import type { ColumnConfig } from "../../components/column-visibility";
import { formatDate, formatCustomerType, truncate } from "../../utils/format";
import { escapeHtml } from "../../utils/dom";
import { getTableState, setTableState } from "../../utils/url-state";
import { CustomerType, SortEnumType } from "@insurup/contracts";
import type { CustomerFieldKey } from "@insurup/contracts";
import type { QueryCustomerModelSearchInput, QueryCustomerModelFilterInput } from "@insurup/contracts";

const PAGE_SIZE = 10;
const STORAGE_KEY = "demo-customers-columns";

/** Map column IDs to SDK field names */
const COLUMN_TO_FIELDS: Record<string, readonly string[]> = {
  name: ["name"],
  type: ["type"],
  identity: ["identityNumber", "taxNumber"],
  email: ["primaryEmail"],
  createdAt: ["createdAt"],
};

/** Fields that are always required */
const REQUIRED_FIELDS = ["id"] as const;

/** Column configuration for the table */
const COLUMNS: SortableColumn[] = [
  { id: "name", label: "Name", sortField: "name", sortable: true },
  { id: "type", label: "Type" },
  { id: "identity", label: "Identity/Tax Number" },
  { id: "email", label: "Email" },
  { id: "createdAt", label: "Created", sortField: "createdAt", sortable: true },
  { id: "actions", label: "" },
];

/** Column visibility configuration */
const COLUMN_CONFIG: ColumnConfig[] = [
  { id: "name", label: "Name", defaultVisible: true },
  { id: "type", label: "Type", defaultVisible: true },
  { id: "identity", label: "Identity/Tax Number", defaultVisible: true },
  { id: "email", label: "Email", defaultVisible: true },
  { id: "createdAt", label: "Created", defaultVisible: true },
];

/** Filter configuration */
const FILTERS: FilterConfig[] = [
  {
    id: "type",
    label: "Type",
    options: [
      { value: "", label: "All Types" },
      { value: CustomerType.Individual, label: "Individual" },
      { value: CustomerType.Company, label: "Company" },
      { value: CustomerType.Foreign, label: "Foreign" },
    ],
  },
];

/** Type for customer rows displayed in the list */
interface CustomerRow {
  id: string;
  name?: string | null;
  identityNumber?: string | null;
  taxNumber?: string | null;
  primaryEmail?: string | null;
  type: CustomerType;
  createdAt: { toString(): string };
}

export async function render(container: HTMLElement): Promise<void> {
  const tracker = createPaginationTracker(PAGE_SIZE);

  // Initialize state from URL
  const urlState = getTableState();

  // State
  let searchQuery = urlState.search || "";
  let typeFilter: CustomerType | null = (urlState.filters?.type as CustomerType) || null;
  let sortState: SortState = urlState.sort
    ? { field: urlState.sort.field, direction: urlState.sort.direction === "asc" ? SortEnumType.ASC : SortEnumType.DESC }
    : { field: null, direction: null };
  let visibleColumns = new Set(COLUMN_CONFIG.map((c) => c.id));
  const targetPage = urlState.page || 1;

  // Always include actions column
  visibleColumns.add("actions");

  /**
   * Sync current state to URL.
   */
  function syncToUrl(pushHistory = false): void {
    setTableState(
      {
        search: searchQuery || undefined,
        filters: typeFilter ? { type: typeFilter } : undefined,
        sort: sortState.field && sortState.direction
          ? { field: sortState.field, direction: sortState.direction.toLowerCase() as "asc" | "desc" }
          : undefined,
        page: tracker.currentPage > 1 ? tracker.currentPage : undefined,
      },
      pushHistory
    );
  }

  /**
   * Build select fields based on visible columns.
   */
  function buildSelectFields(): CustomerFieldKey[] {
    const fields = new Set<string>(REQUIRED_FIELDS);

    for (const columnId of visibleColumns) {
      const columnFields = COLUMN_TO_FIELDS[columnId];
      if (columnFields) {
        for (const field of columnFields) {
          fields.add(field);
        }
      }
    }

    return [...fields] as CustomerFieldKey[];
  }

  /**
   * Build search input for SDK call.
   */
  function buildSearchOptions(): QueryCustomerModelSearchInput | undefined {
    if (!searchQuery) return undefined;

    return {
      or: [
        { name: { textSearch: { value: searchQuery } } },
        { primaryEmail: { textSearch: { value: searchQuery } } },
        { identityNumber: { textSearch: { value: searchQuery } } },
        { taxNumber: { textSearch: { value: searchQuery } } },
      ],
    };
  }

  /**
   * Build filter input for SDK call.
   */
  function buildFilterOptions(): QueryCustomerModelFilterInput | undefined {
    if (!typeFilter) return undefined;
    return { type: { eq: typeFilter } };
  }

  async function loadPage(cursor: string | null = null): Promise<void> {
    // Check if we have existing content (subsequent load) or need full page loading (initial load)
    const dataTable = container.querySelector(".data-table");
    const isInitialLoad = !dataTable;

    if (isInitialLoad) {
      renderLoading(container, "Loading customers...");
    } else {
      // Show loading overlay on existing table
      dataTable.classList.add("loading");
    }

    try {
      const client = getClient();
      const searchOptions = buildSearchOptions();
      const filterOptions = buildFilterOptions();
      const orderOptions = buildOrderOptions(sortState);

      const countPromise = client.customers.getCustomers({
        first: 1,
        search: searchOptions,
        filter: filterOptions,
        select: ["id"] as const,
      });

      const selectFields = buildSelectFields();

      const dataRes = await client.customers.getCustomers({
        first: PAGE_SIZE,
        after: cursor ?? undefined,
        search: searchOptions,
        filter: filterOptions,
        order: orderOptions,
        select: selectFields,
        includeTotalCount: false,
      });

      if (!dataRes.isSuccess || !dataRes.data) {
        throw new Error(dataRes.message || "Failed to load customers");
      }

      const { nodes, pageInfo } = dataRes.data;
      const customers = (nodes ?? []).filter((c) => c !== null);

      renderCustomerList(container, customers, pageInfo, null, tracker);

      countPromise.then((countRes) => {
        if (countRes.isSuccess && countRes.data) {
          const paginationContainer = container.querySelector("#pagination-container") as HTMLElement;
          if (paginationContainer) {
            renderPagination(
              paginationContainer,
              {
                pageInfo,
                totalCount: countRes.data.totalCount,
                currentPage: tracker.currentPage,
                pageSize: PAGE_SIZE,
              },
              {
                onNext: async (cursor) => {
                  tracker.goToNext(cursor);
                  syncToUrl(true);
                  await loadPage(cursor);
                },
                onPrevious: async () => {
                  tracker.goToPrevious();
                  syncToUrl(true);
                  await loadPage(tracker.getCurrentCursor());
                },
                onFirst: async () => {
                  tracker.goToFirst();
                  syncToUrl(true);
                  await loadPage(null);
                },
              }
            );
          }
        }
      });
    } catch (error) {
      console.error("Failed to load customers:", error);
      renderError(
        container,
        "Error Loading Customers",
        error instanceof Error ? error.message : "Unknown error",
        () => loadPage(cursor)
      );
    }
  }

  function renderCustomerList<T extends { id: string }>(
    container: HTMLElement,
    customers: T[],
    pageInfo: PageInfo,
    totalCount: number | null,
    tracker: ReturnType<typeof createPaginationTracker>
  ): void {
    const hasFilters = searchQuery || typeFilter;

    if (customers.length === 0 && tracker.currentPage === 1 && !hasFilters) {
      renderEmptyState(
        container,
        "No Customers Found",
        "There are no customers in the system yet.",
        '<a href="#/customers/create" role="button">Create Customer</a>'
      );
      return;
    }

    const headersHtml = renderSortableHeaders({
      columns: COLUMNS,
      visibleColumns,
      currentSort: sortState,
      onSort: handleSort,
    });

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1>Customers</h1>
        <a href="#/customers/create" role="button">Create Customer</a>
      </div>

      <div id="toolbar-container"></div>

      <div id="customer-content">
        <div class="data-table">
          <table>
            <thead>
              <tr>
                ${headersHtml}
              </tr>
            </thead>
            <tbody id="customer-table-body">
              ${customers.length > 0 ? customers.map((c) => renderCustomerRow(c as unknown as CustomerRow)).join("") : `
                <tr>
                  <td colspan="${visibleColumns.size}" style="text-align: center; color: var(--pico-muted-color);">
                    No customers found${hasFilters ? " matching your search criteria." : "."}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <div id="pagination-container" class="pagination"></div>
      </div>
    `;

    // Render toolbar and restore state
    const toolbarContainer = container.querySelector("#toolbar-container") as HTMLElement;
    const toolbarControls = renderTableToolbar(toolbarContainer, {
      searchPlaceholder: "Search customers...",
      filters: FILTERS,
      columns: COLUMN_CONFIG,
      storageKey: STORAGE_KEY,
      onSearch: handleSearch,
      onFilterChange: handleFilterChange,
      onColumnsChange: handleColumnsChange,
    });

    // Restore search and filter values after render
    if (searchQuery) {
      toolbarControls.setSearchValue(searchQuery);
    }
    if (typeFilter) {
      toolbarControls.setFilterValue("type", typeFilter);
    }

    // Attach sort handlers
    const table = container.querySelector("table") as HTMLElement;
    attachSortHandlers(table, sortState, handleSort);

    if (customers.length > 0) {
      const paginationContainer = container.querySelector("#pagination-container") as HTMLElement;
      renderPagination(
        paginationContainer,
        {
          pageInfo,
          totalCount,
          currentPage: tracker.currentPage,
          pageSize: PAGE_SIZE,
        },
        {
          onNext: async (cursor) => {
            tracker.goToNext(cursor);
            syncToUrl(true);
            await loadPage(cursor);
          },
          onPrevious: async () => {
            tracker.goToPrevious();
            syncToUrl(true);
            await loadPage(tracker.getCurrentCursor());
          },
          onFirst: async () => {
            tracker.goToFirst();
            syncToUrl(true);
            await loadPage(null);
          },
        }
      );
    }
  }

  function renderCustomerRow(customer: CustomerRow): string {
    const identityOrTax = customer.identityNumber || customer.taxNumber || "-";

    const cells: string[] = [];

    if (visibleColumns.has("name")) {
      cells.push(`
        <td>
          <a href="#/customers/${customer.id}">
            ${escapeHtml(customer.name || "Unnamed")}
          </a>
        </td>
      `);
    }

    if (visibleColumns.has("type")) {
      cells.push(`
        <td>
          <span class="badge ${customer.type === CustomerType.Company ? "primary" : ""}">
            ${formatCustomerType(customer.type)}
          </span>
        </td>
      `);
    }

    if (visibleColumns.has("identity")) {
      cells.push(`<td>${escapeHtml(identityOrTax)}</td>`);
    }

    if (visibleColumns.has("email")) {
      cells.push(`<td>${escapeHtml(truncate(customer.primaryEmail, 30))}</td>`);
    }

    if (visibleColumns.has("createdAt")) {
      cells.push(`<td>${formatDate(customer.createdAt?.toString())}</td>`);
    }

    if (visibleColumns.has("actions")) {
      cells.push(`
        <td>
          <a href="#/customers/${customer.id}">View</a>
        </td>
      `);
    }

    return `<tr>${cells.join("")}</tr>`;
  }

  async function handleSearch(query: string): Promise<void> {
    searchQuery = query;
    tracker.reset();
    syncToUrl();
    await loadPage(null);
  }

  async function handleFilterChange(filterId: string, value: string): Promise<void> {
    if (filterId === "type") {
      typeFilter = value ? (value as CustomerType) : null;
      tracker.reset();
      syncToUrl();
      await loadPage(null);
    }
  }

  async function handleSort(field: string, direction: typeof SortEnumType.ASC | typeof SortEnumType.DESC | null): Promise<void> {
    sortState = { field: direction ? field : null, direction };
    tracker.reset();
    syncToUrl();
    await loadPage(null);
  }

  function handleColumnsChange(columns: Set<string>): void {
    visibleColumns = new Set(columns);
    visibleColumns.add("actions"); // Always show actions
    // Re-render without reloading data - we'll need to trigger a re-render
    // For now, just reload the page
    loadPage(tracker.getCurrentCursor());
  }

  /**
   * Navigate to a specific page by fetching cursors sequentially.
   */
  async function navigateToPage(page: number): Promise<void> {
    if (page <= 1) {
      await loadPage(null);
      return;
    }

    renderLoading(container, "Loading customers...");

    try {
      const client = getClient();
      const searchOptions = buildSearchOptions();
      const filterOptions = buildFilterOptions();
      const orderOptions = buildOrderOptions(sortState);

      // Fetch pages sequentially to get cursors
      const cursors: string[] = [];
      for (let i = 1; i < page; i++) {
        const afterCursor: string | undefined = cursors.length > 0 ? cursors[cursors.length - 1] : undefined;
        const pageRes = await client.customers.getCustomers({
          first: PAGE_SIZE,
          after: afterCursor,
          search: searchOptions,
          filter: filterOptions,
          order: orderOptions,
          select: ["id"] as const,
        });

        if (!pageRes.isSuccess || !pageRes.data?.pageInfo.endCursor) {
          // Page doesn't exist, go to first page
          tracker.reset();
          syncToUrl();
          await loadPage(null);
          return;
        }

        const nextCursor = pageRes.data.pageInfo.endCursor;
        cursors.push(nextCursor);
        tracker.goToNext(nextCursor);
      }

      // Now load the target page
      const finalCursor = cursors.length > 0 ? cursors[cursors.length - 1] : null;
      await loadPage(finalCursor);
    } catch (error) {
      console.error("Failed to navigate to page:", error);
      tracker.reset();
      syncToUrl();
      await loadPage(null);
    }
  }

  // Initial load - handle target page from URL
  if (targetPage > 1) {
    await navigateToPage(targetPage);
  } else {
    await loadPage(null);
  }
}
