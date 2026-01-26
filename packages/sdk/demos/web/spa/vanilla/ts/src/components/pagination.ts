/**
 * Pagination component for cursor-based navigation.
 */

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface PaginationState {
  pageInfo: PageInfo;
  totalCount: number | null;
  currentPage: number;
  pageSize: number;
}

export interface PaginationOptions {
  onNext: (cursor: string) => void | Promise<void>;
  onPrevious: () => void | Promise<void>;
  onFirst: () => void | Promise<void>;
}

/**
 * Render pagination controls.
 */
export function renderPagination(
  container: HTMLElement,
  state: PaginationState,
  options: PaginationOptions
): void {
  const { pageInfo, totalCount, currentPage, pageSize } = state;
  const { onNext, onPrevious, onFirst } = options;

  const start = (currentPage - 1) * pageSize + 1;
  const hasTotal = totalCount !== null;
  const end = hasTotal ? Math.min(currentPage * pageSize, totalCount) : currentPage * pageSize;
  const totalPages = hasTotal ? Math.ceil(totalCount / pageSize) : null;

  const paginationInfo = hasTotal
    ? `Showing ${start}-${end} of ${totalCount.toLocaleString()} items (Page ${currentPage} of ${totalPages})`
    : `Showing page ${currentPage}...`;

  container.innerHTML = `
    <div class="pagination-info">
      ${paginationInfo}
    </div>
    <div class="pagination-controls">
      <button class="secondary outline pagination-first" ${currentPage === 1 ? "disabled" : ""}>
        First
      </button>
      <button class="secondary outline pagination-prev" ${!pageInfo.hasPreviousPage ? "disabled" : ""}>
        Previous
      </button>
      <button class="secondary outline pagination-next" ${!pageInfo.hasNextPage ? "disabled" : ""}>
        Next
      </button>
    </div>
  `;

  // Attach event listeners
  const firstBtn = container.querySelector(".pagination-first");
  const prevBtn = container.querySelector(".pagination-prev");
  const nextBtn = container.querySelector(".pagination-next");

  firstBtn?.addEventListener("click", async () => {
    setButtonLoading(firstBtn, true);
    try {
      await onFirst();
    } finally {
      setButtonLoading(firstBtn, false);
    }
  });

  prevBtn?.addEventListener("click", async () => {
    setButtonLoading(prevBtn, true);
    try {
      await onPrevious();
    } finally {
      setButtonLoading(prevBtn, false);
    }
  });

  nextBtn?.addEventListener("click", async () => {
    if (pageInfo.endCursor) {
      setButtonLoading(nextBtn, true);
      try {
        await onNext(pageInfo.endCursor);
      } finally {
        setButtonLoading(nextBtn, false);
      }
    }
  });
}

/**
 * Set loading state on a button.
 */
function setButtonLoading(button: Element | null, loading: boolean): void {
  if (!button) return;
  if (loading) {
    button.setAttribute("aria-busy", "true");
  } else {
    button.removeAttribute("aria-busy");
  }
}

/**
 * Create a pagination state tracker.
 * Tracks cursors for cursor-based pagination to enable back navigation.
 */
export function createPaginationTracker(pageSize: number) {
  const cursors: (string | null)[] = [null];
  let currentPage = 1;

  return {
    get currentPage() {
      return currentPage;
    },

    get pageSize() {
      return pageSize;
    },

    /**
     * Get the cursor for the current page.
     */
    getCurrentCursor(): string | null {
      return cursors[currentPage - 1] ?? null;
    },

    /**
     * Get the cursor for a specific page.
     */
    getCursorForPage(page: number): string | null {
      if (page < 1 || page > cursors.length) {
        return null;
      }
      return cursors[page - 1] ?? null;
    },

    /**
     * Check if a cursor is cached for a specific page.
     */
    hasCursorForPage(page: number): boolean {
      return page >= 1 && page <= cursors.length;
    },

    /**
     * Get the number of cached pages.
     */
    get cachedPageCount(): number {
      return cursors.length;
    },

    /**
     * Move to the next page and store the cursor.
     */
    goToNext(endCursor: string): void {
      if (cursors.length === currentPage) {
        cursors.push(endCursor);
      }
      currentPage++;
    },

    /**
     * Move to the previous page.
     */
    goToPrevious(): void {
      if (currentPage > 1) {
        currentPage--;
      }
    },

    /**
     * Go to the first page.
     */
    goToFirst(): void {
      currentPage = 1;
    },

    /**
     * Go to a specific page if the cursor is cached.
     * Returns true if successful, false if cursor is not cached.
     */
    goToPage(page: number): boolean {
      if (page < 1 || page > cursors.length) {
        return false;
      }
      currentPage = page;
      return true;
    },

    /**
     * Set the current page without validation.
     * Use with caution - primarily for URL state restoration.
     */
    setPage(page: number): void {
      if (page >= 1) {
        currentPage = page;
      }
    },

    /**
     * Reset the tracker to initial state.
     */
    reset(): void {
      cursors.length = 1;
      currentPage = 1;
    },

    /**
     * Get all cached cursors for debugging/inspection.
     */
    getCursors(): readonly (string | null)[] {
      return [...cursors];
    },
  };
}
