/**
 * Policy list page with pagination, search, filtering, sorting, and column visibility.
 * Supports URL state persistence for shareable/bookmarkable table views.
 */

import { getClient } from '../../client';
import {
  renderPagination,
  createPaginationTracker,
  type PageInfo,
} from '../../components/pagination';
import { renderLoading, renderEmptyState, renderError } from '../../components/loading';
import { renderTableToolbar, type FilterConfig } from '../../components/table-toolbar';
import {
  renderSortableHeaders,
  attachSortHandlers,
  buildOrderOptions,
  type SortState,
  type SortableColumn,
} from '../../components/sortable-headers';
import type { ColumnConfig } from '../../components/column-visibility';
import {
  formatDate,
  formatCurrency,
  formatPolicyState,
  getPolicyStateBadgeClass,
  truncate,
} from '../../utils/format';
import { escapeHtml } from '../../utils/dom';
import { getTableState, setTableState } from '../../utils/url-state';
import {
  PolicyState,
  ProductBranch,
  SortEnumType,
  type Currency,
  type DateOnly,
  type DateTime,
} from '@insurup/contracts';
import type { PolicyFieldKey } from '@insurup/contracts';
import type {
  QueryPoliciesResultSearchInput,
  QueryPoliciesResultFilterInput,
} from '@insurup/contracts';

const PAGE_SIZE = 10;
const STORAGE_KEY = 'demo-policies-columns';

/** Map column IDs to SDK field names */
const COLUMN_TO_FIELDS: Record<string, readonly string[]> = {
  policyNumber: ['insuranceCompanyPolicyNumber'],
  product: ['productName'],
  customer: ['insuredCustomerName'],
  state: ['state'],
  startDate: ['startDate'],
  endDate: ['endDate'],
  premium: ['grossPremium', 'currency'],
};

/** Fields that are always required */
const REQUIRED_FIELDS = ['id'] as const;

/** Column configuration for the table */
const COLUMNS: SortableColumn[] = [
  { id: 'policyNumber', label: 'Policy Number' },
  { id: 'product', label: 'Product' },
  { id: 'customer', label: 'Customer' },
  { id: 'state', label: 'State' },
  { id: 'startDate', label: 'Start Date', sortField: 'startDate', sortable: true },
  { id: 'endDate', label: 'End Date', sortField: 'endDate', sortable: true },
  { id: 'premium', label: 'Premium', sortField: 'grossPremium', sortable: true },
  { id: 'actions', label: '' },
];

/** Column visibility configuration */
const COLUMN_CONFIG: ColumnConfig[] = [
  { id: 'policyNumber', label: 'Policy Number', defaultVisible: true },
  { id: 'product', label: 'Product', defaultVisible: true },
  { id: 'customer', label: 'Customer', defaultVisible: true },
  { id: 'state', label: 'State', defaultVisible: true },
  { id: 'startDate', label: 'Start Date', defaultVisible: true },
  { id: 'endDate', label: 'End Date', defaultVisible: true },
  { id: 'premium', label: 'Premium', defaultVisible: true },
];

/** Filter configuration */
const FILTERS: FilterConfig[] = [
  {
    id: 'state',
    label: 'State',
    options: [
      { value: '', label: 'All States' },
      { value: PolicyState.Active, label: 'Active' },
      { value: PolicyState.EndOfLife, label: 'Expired' },
      { value: PolicyState.Cancelled, label: 'Cancelled' },
    ],
  },
  {
    id: 'branch',
    label: 'Branch',
    options: [
      { value: '', label: 'All Branches' },
      { value: ProductBranch.Trafik, label: 'Traffic' },
      { value: ProductBranch.Kasko, label: 'Casco' },
      { value: ProductBranch.Dask, label: 'DASK' },
      { value: ProductBranch.Tss, label: 'Health (TSS)' },
      { value: ProductBranch.Konut, label: 'Home' },
    ],
  },
];

/** Type for policy rows displayed in the list */
interface PolicyRow {
  id: string;
  insuranceCompanyPolicyNumber: string;
  productName?: string | null;
  productBranch: ProductBranch;
  insuredCustomerName?: string | null;
  state: PolicyState;
  startDate: DateOnly;
  endDate: DateOnly;
  grossPremium?: number | null;
  currency: Currency;
  createdAt: DateTime;
}

export async function render(container: HTMLElement): Promise<void> {
  const tracker = createPaginationTracker(PAGE_SIZE);

  // Initialize state from URL
  const urlState = getTableState();

  // State
  let searchQuery = urlState.search || '';
  let stateFilter: PolicyState | null = (urlState.filters?.state as PolicyState) || null;
  let branchFilter: ProductBranch | null = (urlState.filters?.branch as ProductBranch) || null;
  let sortState: SortState = urlState.sort
    ? {
        field: urlState.sort.field,
        direction: urlState.sort.direction === 'asc' ? SortEnumType.ASC : SortEnumType.DESC,
      }
    : { field: null, direction: null };
  let visibleColumns = new Set(COLUMN_CONFIG.map((c) => c.id));
  const targetPage = urlState.page || 1;

  // Always include actions column
  visibleColumns.add('actions');

  /**
   * Sync current state to URL.
   */
  function syncToUrl(pushHistory = false): void {
    const filters: Record<string, string> = {};
    if (stateFilter) filters.state = stateFilter;
    if (branchFilter) filters.branch = branchFilter;

    setTableState(
      {
        search: searchQuery || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort:
          sortState.field && sortState.direction
            ? {
                field: sortState.field,
                direction: sortState.direction.toLowerCase() as 'asc' | 'desc',
              }
            : undefined,
        page: tracker.currentPage > 1 ? tracker.currentPage : undefined,
      },
      pushHistory
    );
  }

  /**
   * Build select fields based on visible columns.
   */
  function buildSelectFields(): PolicyFieldKey[] {
    const fields = new Set<string>(REQUIRED_FIELDS);

    for (const columnId of visibleColumns) {
      const columnFields = COLUMN_TO_FIELDS[columnId];
      if (columnFields) {
        for (const field of columnFields) {
          fields.add(field);
        }
      }
    }

    return [...fields] as PolicyFieldKey[];
  }

  /**
   * Build search input for SDK call.
   */
  function buildSearchOptions(): QueryPoliciesResultSearchInput | undefined {
    if (!searchQuery) return undefined;

    return {
      or: [
        { insuranceCompanyPolicyNumber: { textSearch: { value: searchQuery } } },
        { insuredCustomerName: { textSearch: { value: searchQuery } } },
        { productName: { textSearch: { value: searchQuery } } },
      ],
    };
  }

  /**
   * Build filter input for SDK call.
   */
  function buildFilterOptions(): QueryPoliciesResultFilterInput | undefined {
    const filters: QueryPoliciesResultFilterInput = {};
    let hasFilters = false;

    if (stateFilter) {
      filters.state = { eq: stateFilter };
      hasFilters = true;
    }

    if (branchFilter) {
      filters.productBranch = { eq: branchFilter };
      hasFilters = true;
    }

    return hasFilters ? filters : undefined;
  }

  async function loadPage(cursor: string | null = null): Promise<void> {
    // Check if we have existing content (subsequent load) or need full page loading (initial load)
    const dataTable = container.querySelector('.data-table');
    const isInitialLoad = !dataTable;

    if (isInitialLoad) {
      renderLoading(container, 'Loading policies...');
    } else {
      // Show loading overlay on existing table
      dataTable.classList.add('loading');
    }

    try {
      const client = getClient();
      const searchOptions = buildSearchOptions();
      const filterOptions = buildFilterOptions();
      const orderOptions = buildOrderOptions(sortState);

      const countPromise = client.policies.getPolicies({
        first: 1,
        search: searchOptions,
        filter: filterOptions,
        select: ['id'] as const,
      });

      const selectFields = buildSelectFields();

      const dataRes = await client.policies.getPolicies({
        first: PAGE_SIZE,
        after: cursor ?? undefined,
        search: searchOptions,
        filter: filterOptions,
        order: orderOptions,
        select: selectFields,
        includeTotalCount: false,
      });

      if (!dataRes.isSuccess || !dataRes.data) {
        throw new Error(dataRes.message || 'Failed to load policies');
      }

      const { nodes, pageInfo } = dataRes.data;
      const policies = (nodes ?? []).filter((p) => p !== null);

      renderPolicyList(container, policies, pageInfo, null, tracker);

      countPromise.then((countRes) => {
        if (countRes.isSuccess && countRes.data && policies.length > 0) {
          const paginationContainer = container.querySelector(
            '#pagination-container'
          ) as HTMLElement;
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
      console.error('Failed to load policies:', error);
      renderError(
        container,
        'Error Loading Policies',
        error instanceof Error ? error.message : 'Unknown error',
        () => loadPage(cursor)
      );
    }
  }

  function renderPolicyList<T extends { id: string }>(
    container: HTMLElement,
    policies: T[],
    pageInfo: PageInfo,
    totalCount: number | null,
    tracker: ReturnType<typeof createPaginationTracker>
  ): void {
    const hasFilters = searchQuery || stateFilter || branchFilter;

    if (policies.length === 0 && tracker.currentPage === 1 && !hasFilters) {
      renderEmptyState(container, 'No Policies Found', 'There are no policies in the system yet.');
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
        <h1>Policies</h1>
      </div>

      <div id="toolbar-container"></div>

      <div id="policy-content">
        <div class="data-table">
          <table>
            <thead>
              <tr>
                ${headersHtml}
              </tr>
            </thead>
            <tbody>
              ${
                policies.length > 0
                  ? policies.map((p) => renderPolicyRow(p as unknown as PolicyRow)).join('')
                  : `
                <tr>
                  <td colspan="${visibleColumns.size}" style="text-align: center; color: var(--pico-muted-color);">
                    No policies found${hasFilters ? ' matching your search criteria.' : '.'}
                  </td>
                </tr>
              `
              }
            </tbody>
          </table>
        </div>

        <div id="pagination-container" class="pagination"></div>
      </div>
    `;

    // Render toolbar and restore state
    const toolbarContainer = container.querySelector('#toolbar-container') as HTMLElement;
    const toolbarControls = renderTableToolbar(toolbarContainer, {
      searchPlaceholder: 'Search policies...',
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
    if (stateFilter) {
      toolbarControls.setFilterValue('state', stateFilter);
    }
    if (branchFilter) {
      toolbarControls.setFilterValue('branch', branchFilter);
    }

    // Attach sort handlers
    const table = container.querySelector('table') as HTMLElement;
    attachSortHandlers(table, sortState, handleSort);

    if (policies.length > 0) {
      const paginationContainer = container.querySelector('#pagination-container') as HTMLElement;
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

  function renderPolicyRow(policy: PolicyRow): string {
    const badgeClass = getPolicyStateBadgeClass(policy.state);

    const cells: string[] = [];

    if (visibleColumns.has('policyNumber')) {
      cells.push(`
        <td>
          <a href="#/policies/${policy.id}">
            ${escapeHtml(policy.insuranceCompanyPolicyNumber || 'N/A')}
          </a>
        </td>
      `);
    }

    if (visibleColumns.has('product')) {
      cells.push(`<td>${escapeHtml(truncate(policy.productName, 25))}</td>`);
    }

    if (visibleColumns.has('customer')) {
      cells.push(`<td>${escapeHtml(truncate(policy.insuredCustomerName, 25))}</td>`);
    }

    if (visibleColumns.has('state')) {
      cells.push(`
        <td>
          <span class="badge ${badgeClass}">
            ${formatPolicyState(policy.state)}
          </span>
        </td>
      `);
    }

    if (visibleColumns.has('startDate')) {
      cells.push(`<td>${formatDate(policy.startDate?.toString())}</td>`);
    }

    if (visibleColumns.has('endDate')) {
      cells.push(`<td>${formatDate(policy.endDate?.toString())}</td>`);
    }

    if (visibleColumns.has('premium')) {
      cells.push(`<td>${formatCurrency(policy.grossPremium, policy.currency || 'TRY')}</td>`);
    }

    if (visibleColumns.has('actions')) {
      cells.push(`
        <td>
          <a href="#/policies/${policy.id}">View</a>
        </td>
      `);
    }

    return `<tr>${cells.join('')}</tr>`;
  }

  async function handleSearch(query: string): Promise<void> {
    searchQuery = query;
    tracker.reset();
    syncToUrl();
    await loadPage(null);
  }

  async function handleFilterChange(filterId: string, value: string): Promise<void> {
    if (filterId === 'state') {
      stateFilter = value ? (value as PolicyState) : null;
    } else if (filterId === 'branch') {
      branchFilter = value ? (value as ProductBranch) : null;
    }
    tracker.reset();
    syncToUrl();
    await loadPage(null);
  }

  async function handleSort(
    field: string,
    direction: typeof SortEnumType.ASC | typeof SortEnumType.DESC | null
  ): Promise<void> {
    sortState = { field: direction ? field : null, direction };
    tracker.reset();
    syncToUrl();
    await loadPage(null);
  }

  function handleColumnsChange(columns: Set<string>): void {
    visibleColumns = new Set(columns);
    visibleColumns.add('actions'); // Always show actions
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

    renderLoading(container, 'Loading policies...');

    try {
      const client = getClient();
      const searchOptions = buildSearchOptions();
      const filterOptions = buildFilterOptions();
      const orderOptions = buildOrderOptions(sortState);

      // Fetch pages sequentially to get cursors
      const cursors: string[] = [];
      for (let i = 1; i < page; i++) {
        const afterCursor: string | undefined =
          cursors.length > 0 ? cursors[cursors.length - 1] : undefined;
        const pageRes = await client.policies.getPolicies({
          first: PAGE_SIZE,
          after: afterCursor,
          search: searchOptions,
          filter: filterOptions,
          order: orderOptions,
          select: ['id'] as const,
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
      console.error('Failed to navigate to page:', error);
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
