/**
 * Table toolbar component - container for search, filters, and column visibility.
 */

import { renderSearchBar } from './search-bar';
import { renderColumnVisibility, type ColumnConfig } from './column-visibility';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value?: string;
}

export interface TableToolbarOptions {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  columns?: ColumnConfig[];
  storageKey?: string;
  onSearch: (query: string) => void | Promise<void>;
  onFilterChange?: (filterId: string, value: string) => void | Promise<void>;
  onColumnsChange?: (visibleColumns: Set<string>) => void;
}

export interface TableToolbarControls {
  getSearchValue: () => string;
  setSearchValue: (value: string) => void;
  getFilterValue: (filterId: string) => string;
  setFilterValue: (filterId: string, value: string) => void;
  getVisibleColumns: () => Set<string>;
}

/**
 * Render a table toolbar with search, filters, and column visibility controls.
 */
export function renderTableToolbar(
  container: HTMLElement,
  options: TableToolbarOptions
): TableToolbarControls {
  const {
    searchPlaceholder = 'Search...',
    filters = [],
    columns = [],
    storageKey,
    onSearch,
    onFilterChange,
    onColumnsChange,
  } = options;

  // Build filters HTML
  const filtersHtml = filters
    .map(
      (filter) => `
      <div class="filter-group">
        <label for="filter-${filter.id}" style="margin: 0; font-size: 0.875rem;">${filter.label}:</label>
        <select id="filter-${filter.id}" style="width: auto; margin: 0;">
          ${filter.options.map((opt) => `<option value="${opt.value}" ${filter.value === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
        </select>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div id="search-container"></div>
        ${filtersHtml}
      </div>
      <div class="toolbar-right">
        <div id="column-visibility-container"></div>
      </div>
    </div>
  `;

  // Render search bar
  const searchContainer = container.querySelector('#search-container') as HTMLElement;
  const searchControls = renderSearchBar(searchContainer, {
    placeholder: searchPlaceholder,
    onSearch,
  });

  // Render column visibility if columns provided
  let columnVisibilityControls: ReturnType<typeof renderColumnVisibility> | null = null;
  if (columns.length > 0) {
    const columnContainer = container.querySelector('#column-visibility-container') as HTMLElement;
    columnVisibilityControls = renderColumnVisibility(columnContainer, {
      columns,
      storageKey,
      onChange: onColumnsChange,
    });
  }

  // Set up filter change handlers
  filters.forEach((filter) => {
    const select = container.querySelector(`#filter-${filter.id}`) as HTMLSelectElement;
    if (select && onFilterChange) {
      select.addEventListener('change', () => {
        onFilterChange(filter.id, select.value);
      });
    }
  });

  return {
    getSearchValue: () => searchControls.getValue(),
    setSearchValue: (value: string) => searchControls.setValue(value),
    getFilterValue: (filterId: string) => {
      const select = container.querySelector(`#filter-${filterId}`) as HTMLSelectElement;
      return select?.value ?? '';
    },
    setFilterValue: (filterId: string, value: string) => {
      const select = container.querySelector(`#filter-${filterId}`) as HTMLSelectElement;
      if (select) {
        select.value = value;
      }
    },
    getVisibleColumns: () => columnVisibilityControls?.getVisibleColumns() ?? new Set(),
  };
}
