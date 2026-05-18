/**
 * Sortable headers component for table sorting.
 */

import { SortEnumType } from '@insurup/contracts';

export type SortDirection = typeof SortEnumType.ASC | typeof SortEnumType.DESC | null;

export interface SortableColumn {
  id: string;
  label: string;
  sortField?: string; // The field name used for sorting (if different from id)
  sortable?: boolean;
}

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

export interface SortableHeadersOptions {
  columns: SortableColumn[];
  visibleColumns: Set<string>;
  currentSort: SortState;
  onSort: (field: string, direction: SortDirection) => void | Promise<void>;
}

/**
 * Get the next sort direction in the cycle: null -> ASC -> DESC -> null
 */
function getNextSortDirection(current: SortDirection): SortDirection {
  if (current === null) return SortEnumType.ASC;
  if (current === SortEnumType.ASC) return SortEnumType.DESC;
  return null;
}

/**
 * Get sort indicator arrow.
 */
function getSortIndicator(direction: SortDirection): string {
  if (direction === SortEnumType.ASC) return ' ↑';
  if (direction === SortEnumType.DESC) return ' ↓';
  return '';
}

/**
 * Render sortable table headers.
 */
export function renderSortableHeaders(options: SortableHeadersOptions): string {
  const { columns, visibleColumns, currentSort } = options;

  return columns
    .filter((col) => visibleColumns.has(col.id))
    .map((col) => {
      const sortField = col.sortField ?? col.id;
      const isSortable = col.sortable !== false && col.sortField !== undefined;
      const isCurrentSort = currentSort.field === sortField;
      const direction = isCurrentSort ? currentSort.direction : null;
      const indicator = getSortIndicator(direction);

      if (isSortable) {
        return `
          <th class="sort-header ${isCurrentSort ? 'sorted' : ''}" 
              data-sort-field="${sortField}"
              role="columnheader"
              aria-sort="${direction === SortEnumType.ASC ? 'ascending' : direction === SortEnumType.DESC ? 'descending' : 'none'}">
            <span class="sort-header-content">
              ${col.label}${indicator}
            </span>
          </th>
        `;
      }

      return `<th>${col.label}</th>`;
    })
    .join('');
}

/**
 * Attach sort event handlers to the table.
 */
export function attachSortHandlers(
  table: HTMLElement,
  currentSort: SortState,
  onSort: (field: string, direction: SortDirection) => void | Promise<void>
): void {
  const headers = table.querySelectorAll('.sort-header');

  headers.forEach((header) => {
    header.addEventListener('click', async () => {
      const sortField = (header as HTMLElement).dataset.sortField!;
      const isCurrentField = currentSort.field === sortField;
      const currentDirection = isCurrentField ? currentSort.direction : null;
      const nextDirection = getNextSortDirection(currentDirection);

      await onSort(sortField, nextDirection);
    });
  });
}

/**
 * Build order options for SDK call.
 */
export function buildOrderOptions<T extends string>(
  sortState: SortState
): Array<Record<T, typeof SortEnumType.ASC | typeof SortEnumType.DESC>> | undefined {
  if (!sortState.field || !sortState.direction) {
    return undefined;
  }

  return [{ [sortState.field]: sortState.direction }] as Array<
    Record<T, typeof SortEnumType.ASC | typeof SortEnumType.DESC>
  >;
}
