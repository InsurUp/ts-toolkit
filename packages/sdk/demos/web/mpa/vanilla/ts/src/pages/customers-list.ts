/**
 * Customer list page entry point.
 */

import { loadConfig } from '../shared/config';
import {
  renderHeader,
  initTheme,
  renderLoading,
  renderError,
  renderEmptyState,
  renderPagination,
  escapeHtml,
  getQueryParam,
  setQueryParams,
  type PageInfo,
} from '../shared/components';
import { requireAuth } from '../shared/auth';
import { getClient } from '../shared/client';
import { formatCustomerType, formatDate, truncate } from '../shared/format';
import type { CustomerType, DateTime } from '@insurup/contracts';
import type { QueryCustomerModelUnifiedFilterInput } from '@insurup/sdk';

const PAGE_SIZE = 10;

interface CustomerRow {
  id: string;
  name: string | null | undefined;
  identityNumber: string | null | undefined;
  primaryEmail: string | null | undefined;
  type: CustomerType;
  createdAt: DateTime;
}

let currentPage = 1;
let cursors: (string | null)[] = [null];
let searchQuery = getQueryParam('q') || '';

async function init(): Promise<void> {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) await loadCustomers(main, null);
}

async function loadCustomers(container: HTMLElement, cursor: string | null): Promise<void> {
  renderLoading(container, 'Loading customers...');

  try {
    const client = getClient();

    const filterOptions: QueryCustomerModelUnifiedFilterInput | undefined = searchQuery
      ? {
          or: [
            { name: { $search: true, textSearch: { value: searchQuery } } },
            { identityNumber: { $search: true, textSearch: { value: searchQuery } } },
            { primaryEmail: { $search: true, textSearch: { value: searchQuery } } },
          ],
        }
      : undefined;

    // Fire count query without awaiting (non-blocking)
    const countPromise = client.customers.getCustomers({
      first: 1,
      filter: filterOptions,
      select: ['id'] as const,
    });

    // Await only the main data query
    const dataRes = await client.customers.getCustomers({
      first: PAGE_SIZE,
      after: cursor ?? undefined,
      filter: filterOptions,
      select: ['id', 'name', 'identityNumber', 'primaryEmail', 'type', 'createdAt'] as const,
      includeTotalCount: false,
    });

    if (!dataRes.isSuccess || !dataRes.data) {
      throw new Error(dataRes.message || 'Failed to load customers');
    }

    const { nodes, pageInfo } = dataRes.data;
    const customers: CustomerRow[] = (nodes ?? [])
      .filter((c) => c !== null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        identityNumber: c.identityNumber,
        primaryEmail: c.primaryEmail,
        type: c.type,
        createdAt: c.createdAt,
      }));

    // Render immediately without waiting for count
    renderCustomerList(container, customers, pageInfo, null);

    // Update pagination when count resolves
    countPromise.then((countRes) => {
      if (countRes.isSuccess && customers.length > 0) {
        const totalCount = countRes.data?.totalCount ?? null;
        const paginationContainer = container.querySelector('#pagination-container') as HTMLElement;
        if (paginationContainer) {
          renderPagination(paginationContainer, pageInfo, currentPage, totalCount, PAGE_SIZE, {
            onNext: (nextCursor) => {
              if (cursors.length === currentPage) {
                cursors.push(nextCursor);
              }
              currentPage++;
              loadCustomers(container, nextCursor);
            },
            onPrevious: () => {
              if (currentPage > 1) {
                currentPage--;
                loadCustomers(container, cursors[currentPage - 1] ?? null);
              }
            },
            onFirst: () => {
              currentPage = 1;
              loadCustomers(container, null);
            },
          });
        }
      }
    });
  } catch (error) {
    console.error('Failed to load customers:', error);
    renderError(
      container,
      'Error Loading Customers',
      error instanceof Error ? error.message : 'Unknown error',
      () => loadCustomers(container, cursor)
    );
  }
}

function renderCustomerList(
  container: HTMLElement,
  customers: CustomerRow[],
  pageInfo: PageInfo,
  totalCount: number | null
): void {
  if (customers.length === 0 && currentPage === 1 && !searchQuery) {
    renderEmptyState(container, 'No Customers Found', 'There are no customers in the system yet.');
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1>Customers</h1>
      <a href="/customers/create.html" role="button">Create Customer</a>
    </div>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <input type="search" id="search-input" placeholder="Search customers..." value="${escapeHtml(searchQuery)}" />
      </div>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Identity Number</th>
            <th>Email</th>
            <th>Type</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${
            customers.length > 0
              ? customers.map(renderCustomerRow).join('')
              : `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--pico-muted-color);">
                No customers found${searchQuery ? ' matching your search.' : '.'}
              </td>
            </tr>
          `
          }
        </tbody>
      </table>
    </div>

    <div id="pagination-container" class="pagination"></div>
  `;

  // Search handler
  const searchInput = container.querySelector('#search-input') as HTMLInputElement;
  let debounceTimeout: ReturnType<typeof setTimeout>;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchQuery = searchInput.value;
      currentPage = 1;
      cursors = [null];
      setQueryParams({ q: searchQuery || null });
      loadCustomers(container, null);
    }, 300);
  });

  // Pagination
  if (customers.length > 0) {
    const paginationContainer = container.querySelector('#pagination-container') as HTMLElement;
    renderPagination(paginationContainer, pageInfo, currentPage, totalCount, PAGE_SIZE, {
      onNext: (nextCursor) => {
        if (cursors.length === currentPage) {
          cursors.push(nextCursor);
        }
        currentPage++;
        loadCustomers(container, nextCursor);
      },
      onPrevious: () => {
        if (currentPage > 1) {
          currentPage--;
          loadCustomers(container, cursors[currentPage - 1] ?? null);
        }
      },
      onFirst: () => {
        currentPage = 1;
        loadCustomers(container, null);
      },
    });
  }
}

function renderCustomerRow(customer: CustomerRow): string {
  return `
    <tr>
      <td><a href="/customers/detail.html?id=${customer.id}">${escapeHtml(customer.name || 'N/A')}</a></td>
      <td>${escapeHtml(customer.identityNumber || '-')}</td>
      <td>${escapeHtml(truncate(customer.primaryEmail, 30))}</td>
      <td>${formatCustomerType(customer.type)}</td>
      <td>${formatDate(customer.createdAt)}</td>
      <td><a href="/customers/detail.html?id=${customer.id}">View</a></td>
    </tr>
  `;
}

init();
