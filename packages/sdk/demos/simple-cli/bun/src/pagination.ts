/**
 * Simple pagination component for list views.
 */

import * as p from "@clack/prompts";
import color from "picocolors";

/**
 * Page info from GraphQL-style pagination.
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

/**
 * Paginated response structure.
 */
export interface PaginatedResult<T> {
  nodes: (T | null)[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Fetch function type for paginator.
 */
export type FetchFn<T> = (cursor?: string | null) => Promise<PaginatedResult<T>>;

type PaginationAction = "next" | "prev" | "first" | "back";

/**
 * Show pagination controls and return user's choice.
 */
async function showPaginationControls(
  page: number,
  hasNextPage: boolean,
  totalCount: number,
  pageSize: number
): Promise<PaginationAction | null> {
  const options: { value: PaginationAction; label: string }[] = [];

  if (hasNextPage) {
    options.push({ value: "next", label: `${color.cyan("→")} Next page` });
  }

  if (page > 1) {
    options.push({ value: "prev", label: `${color.cyan("←")} Previous page` });
    options.push({ value: "first", label: `${color.cyan("⟲")} First page` });
  }

  options.push({ value: "back", label: color.dim("← Back to menu") });

  // Calculate approximate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  const pageInfo = totalCount > 0 ? `Page ${page} of ~${totalPages.toLocaleString()}` : `Page ${page}`;

  const result = await p.select({
    message: `${pageInfo} - What would you like to do?`,
    options,
  });

  if (p.isCancel(result)) {
    return "back";
  }

  return result;
}

/**
 * Paginator options.
 */
export interface PaginatorOptions {
  /** Number of items per page (for calculating total pages) */
  pageSize?: number;
}

/**
 * Create a simple paginator.
 */
export function createPaginator<T>(fetchFn: FetchFn<T>, options: PaginatorOptions = {}) {
  const pageSize = options.pageSize ?? 10;
  let currentPage = 1;
  const cursors: (string | null)[] = [null];

  return {
    async run(
      render: (data: PaginatedResult<T>, page: number) => void
    ): Promise<void> {
      let running = true;

      while (running) {
        const cursor = cursors[currentPage - 1];

        const spinner = p.spinner();
        spinner.start(
          currentPage === 1 ? "Loading..." : `Loading page ${currentPage}...`
        );

        let data: PaginatedResult<T>;
        try {
          data = await fetchFn(cursor);
          const countMsg =
            data.totalCount > 0
              ? `Loaded ${data.nodes.length} of ${data.totalCount.toLocaleString()}`
              : "Loaded";
          spinner.stop(color.green("✓") + " " + countMsg);
        } catch (error) {
          spinner.stop(color.red("✗") + " Failed to load");
          console.log(
            `  ${color.red(error instanceof Error ? error.message : "Unknown error")}`
          );
          running = false;
          continue;
        }

        if (data.pageInfo.hasNextPage && data.pageInfo.endCursor) {
          cursors[currentPage] = data.pageInfo.endCursor;
        }

        render(data, currentPage);

        const action = await showPaginationControls(
          currentPage,
          data.pageInfo.hasNextPage,
          data.totalCount,
          pageSize
        );

        switch (action) {
          case "next":
            currentPage++;
            break;
          case "prev":
            currentPage = Math.max(1, currentPage - 1);
            break;
          case "first":
            currentPage = 1;
            break;
          case "back":
          case null:
            running = false;
            break;
        }
      }
    },
  };
}
