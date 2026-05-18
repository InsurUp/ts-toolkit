/**
 * URL state management for table state persistence.
 * Allows storing search, filters, sort, and pagination in the URL query string.
 */

export interface TableState {
  search?: string;
  filters?: Record<string, string>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  page?: number;
}

/**
 * Parse the query string from the current hash URL.
 * Hash format: #/path?query=params
 */
function parseHashQuery(): URLSearchParams {
  const hash = window.location.hash.slice(1); // Remove #
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) {
    return new URLSearchParams();
  }
  return new URLSearchParams(hash.slice(queryIndex + 1));
}

/**
 * Get the path portion of the hash (without query string).
 */
function getHashPath(): string {
  const hash = window.location.hash.slice(1) || '/';
  const queryIndex = hash.indexOf('?');
  return queryIndex === -1 ? hash : hash.slice(0, queryIndex);
}

/**
 * Read table state from URL query parameters.
 */
export function getTableState(): TableState {
  const params = parseHashQuery();
  const state: TableState = {};

  // Search
  const search = params.get('q');
  if (search) {
    state.search = search;
  }

  // Sort (format: field:direction)
  const sort = params.get('sort');
  if (sort) {
    const [field, direction] = sort.split(':');
    if (field && (direction === 'asc' || direction === 'desc')) {
      state.sort = { field, direction };
    }
  }

  // Page
  const page = params.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      state.page = pageNum;
    }
  }

  // Filters (all other params that aren't q, sort, or page)
  const filters: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key !== 'q' && key !== 'sort' && key !== 'page' && value) {
      filters[key] = value;
    }
  }
  if (Object.keys(filters).length > 0) {
    state.filters = filters;
  }

  return state;
}

/**
 * Update URL with table state.
 * Uses replaceState by default to avoid polluting browser history.
 * Set pushHistory=true for significant navigation (like page changes).
 */
export function setTableState(state: Partial<TableState>, pushHistory = false): void {
  const params = new URLSearchParams();

  // Get current state and merge with new state
  const currentState = getTableState();
  const mergedState: TableState = { ...currentState, ...state };

  // Handle explicit undefined to clear values
  if (state.search === undefined && 'search' in state) {
    delete mergedState.search;
  }
  if (state.sort === undefined && 'sort' in state) {
    delete mergedState.sort;
  }
  if (state.page === undefined && 'page' in state) {
    delete mergedState.page;
  }
  if (state.filters === undefined && 'filters' in state) {
    delete mergedState.filters;
  }

  // Build query params
  if (mergedState.search) {
    params.set('q', mergedState.search);
  }

  if (mergedState.sort) {
    params.set('sort', `${mergedState.sort.field}:${mergedState.sort.direction}`);
  }

  if (mergedState.page && mergedState.page > 1) {
    params.set('page', mergedState.page.toString());
  }

  if (mergedState.filters) {
    for (const [key, value] of Object.entries(mergedState.filters)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  // Build new URL
  const path = getHashPath();
  const queryString = params.toString();
  const newHash = queryString ? `${path}?${queryString}` : path;
  const newUrl = `${window.location.pathname}${window.location.search}#${newHash}`;

  if (pushHistory) {
    history.pushState(null, '', newUrl);
  } else {
    history.replaceState(null, '', newUrl);
  }
}

/**
 * Clear all table state from URL.
 */
export function clearTableState(): void {
  const path = getHashPath();
  const newUrl = `${window.location.pathname}${window.location.search}#${path}`;
  history.replaceState(null, '', newUrl);
}

/**
 * Update a single filter value.
 */
export function setFilter(key: string, value: string | null): void {
  const currentState = getTableState();
  const filters = { ...currentState.filters };

  if (value) {
    filters[key] = value;
  } else {
    delete filters[key];
  }

  // Reset page when filter changes
  setTableState({ filters, page: 1 });
}

/**
 * Update search query.
 */
export function setSearch(query: string): void {
  // Reset page when search changes
  setTableState({ search: query || undefined, page: 1 });
}

/**
 * Update sort state.
 */
export function setSort(field: string | null, direction: 'asc' | 'desc' | null): void {
  // Reset page when sort changes
  setTableState({
    sort: field && direction ? { field, direction } : undefined,
    page: 1,
  });
}

/**
 * Update page number.
 * Uses pushState to enable back/forward navigation.
 */
export function setPage(page: number): void {
  setTableState({ page }, true);
}
