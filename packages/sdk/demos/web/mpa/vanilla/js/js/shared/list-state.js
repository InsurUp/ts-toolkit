/**
 * List state management for cursor-based pagination.
 * @module list-state
 */

/**
 * @typedef {import('./constants.js').ListStateManager} ListStateManager
 * @typedef {import('./constants.js').PaginationCallbacks} PaginationCallbacks
 */

/**
 * Creates a list state manager for cursor-based pagination.
 * Manages page numbers and cursor history for back/forward navigation.
 *
 * @returns {ListStateManager}
 *
 * @example
 * const listState = createListState();
 *
 * // On successful data load with pageInfo.endCursor
 * listState.goToNext(pageInfo.endCursor);
 *
 * // Navigate back
 * listState.goToPrevious();
 *
 * // Reset on search/filter change
 * listState.reset();
 */
export function createListState() {
  /** @type {number} */
  let currentPage = 1;

  /** @type {(string|null)[]} */
  let cursors = [null];

  return {
    /**
     * Get current page number.
     * @returns {number}
     */
    get currentPage() {
      return currentPage;
    },

    /**
     * Get cursor array (for debugging).
     * @returns {(string|null)[]}
     */
    get cursors() {
      return [...cursors];
    },

    /**
     * Reset pagination state to initial values.
     * Call this when search/filter changes.
     */
    reset() {
      currentPage = 1;
      cursors = [null];
    },

    /**
     * Navigate to next page and store cursor.
     * @param {string} cursor - The endCursor from pageInfo
     */
    goToNext(cursor) {
      if (cursors.length === currentPage) {
        cursors.push(cursor);
      }
      currentPage++;
    },

    /**
     * Navigate to previous page.
     */
    goToPrevious() {
      if (currentPage > 1) {
        currentPage--;
      }
    },

    /**
     * Navigate to first page.
     */
    goToFirst() {
      currentPage = 1;
    },

    /**
     * Get cursor for current page.
     * @returns {string|null}
     */
    getCurrentCursor() {
      return cursors[currentPage - 1] ?? null;
    },

    /**
     * Get cursor for previous page (used when going back).
     * @returns {string|null}
     */
    getPreviousCursor() {
      return currentPage > 1 ? cursors[currentPage - 2] ?? null : null;
    },

    /**
     * Create pagination callbacks for renderPagination.
     * @param {(cursor: string|null) => void} loadData - Function to load data with cursor
     * @returns {PaginationCallbacks}
     */
    createCallbacks(loadData) {
      return {
        onNext: (cursor) => {
          this.goToNext(cursor);
          loadData(cursor);
        },
        onPrevious: () => {
          this.goToPrevious();
          loadData(this.getCurrentCursor());
        },
        onFirst: () => {
          this.goToFirst();
          loadData(null);
        },
      };
    },
  };
}
