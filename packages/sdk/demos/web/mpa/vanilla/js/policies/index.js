/**
 * Policy list page entry point.
 * @module pages/policies/list
 */

import { loadConfig } from '../js/shared/config.js';
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
  debounce,
} from '../js/shared/components.js';
import { requireAuth } from '../js/shared/auth.js';
import { getClient } from '../js/shared/client.js';
import {
  formatDate,
  formatCurrency,
  formatPolicyState,
  getPolicyStateBadgeClass,
  truncate,
} from '../js/shared/format.js';
import { Currency, PolicyState } from '@insurup/contracts';
import { DEFAULT_PAGE_SIZE, DEBOUNCE_DELAY_MS } from '../js/shared/constants.js';
import { createListState } from '../js/shared/list-state.js';

/** @type {import('../js/shared/constants.js').ListStateManager} */
const listState = createListState();
let searchQuery = getQueryParam('q') || '';
let stateFilter = getQueryParam('state') || '';

/**
 * Initializes the policy list page.
 */
async function init() {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) await loadPolicies(main, null);
}

/**
 * Loads policies from the API.
 * @param {HTMLElement} container - The container element
 * @param {string|null} cursor - The pagination cursor
 */
async function loadPolicies(container, cursor) {
  renderLoading(container, 'Loading policies...');

  try {
    const client = getClient();

    const searchOptions = searchQuery
      ? {
          or: [
            { insuranceCompanyPolicyNumber: { textSearch: { value: searchQuery } } },
            { insuredCustomerName: { textSearch: { value: searchQuery } } },
            { productName: { textSearch: { value: searchQuery } } },
          ],
        }
      : undefined;

    const filterOptions = stateFilter ? { state: { eq: stateFilter } } : undefined;

    // Fire count query without awaiting (non-blocking)
    const countPromise = client.policies.getPolicies({
      first: 1,
      search: searchOptions,
      filter: filterOptions,
      select: ['id'],
    });

    // Await only the main data query
    const dataRes = await client.policies.getPolicies({
      first: DEFAULT_PAGE_SIZE,
      after: cursor ?? undefined,
      search: searchOptions,
      filter: filterOptions,
      select: [
        'id',
        'insuranceCompanyPolicyNumber',
        'productName',
        'insuredCustomerName',
        'state',
        'startDate',
        'endDate',
        'grossPremium',
        'currency',
        'createdAt',
      ],
      includeTotalCount: false,
    });

    if (!dataRes.isSuccess || !dataRes.data) {
      throw new Error(dataRes.message || 'Failed to load policies');
    }

    const { nodes, pageInfo } = dataRes.data;
    const policies = (nodes ?? []).filter((p) => p !== null);

    // Render immediately without waiting for count
    renderPolicyList(container, policies, pageInfo, null);

    // Update pagination when count resolves
    countPromise.then((countRes) => {
      if (countRes.isSuccess && policies.length > 0) {
        const totalCount = countRes.data?.totalCount ?? null;
        const paginationContainer = container.querySelector('#pagination-container');
        if (paginationContainer) {
          const callbacks = listState.createCallbacks((cursor) => loadPolicies(container, cursor));
          renderPagination(
            paginationContainer,
            pageInfo,
            listState.currentPage,
            totalCount,
            DEFAULT_PAGE_SIZE,
            callbacks
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
      () => loadPolicies(container, cursor)
    );
  }
}

/**
 * Renders the policy list.
 * @param {HTMLElement} container - The container element
 * @param {Array} policies - The policy data
 * @param {Object} pageInfo - Pagination info
 * @param {number|null} totalCount - Total count of policies
 */
function renderPolicyList(container, policies, pageInfo, totalCount) {
  const hasFilters = searchQuery || stateFilter;

  if (policies.length === 0 && listState.currentPage === 1 && !hasFilters) {
    renderEmptyState(container, 'No Policies Found', 'There are no policies in the system yet.');
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1>Policies</h1>
    </div>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <input type="search" id="search-input" placeholder="Search policies..." value="${escapeHtml(searchQuery)}" />
        <select id="state-filter">
          <option value="">All States</option>
          <option value="${PolicyState.Active}" ${stateFilter === PolicyState.Active ? 'selected' : ''}>Active</option>
          <option value="${PolicyState.EndOfLife}" ${stateFilter === PolicyState.EndOfLife ? 'selected' : ''}>Expired</option>
          <option value="${PolicyState.Cancelled}" ${stateFilter === PolicyState.Cancelled ? 'selected' : ''}>Cancelled</option>
        </select>
      </div>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Policy Number</th>
            <th>Product</th>
            <th>Customer</th>
            <th>State</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Premium</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${
            policies.length > 0
              ? policies.map(renderPolicyRow).join('')
              : `
            <tr>
              <td colspan="9" style="text-align: center; color: var(--pico-muted-color);">
                No policies found${hasFilters ? ' matching your criteria.' : '.'}
              </td>
            </tr>
          `
          }
        </tbody>
      </table>
    </div>

    <div id="pagination-container" class="pagination"></div>
  `;

  // Search handler with debounce
  const searchInput = container.querySelector('#search-input');
  const handleSearch = debounce(() => {
    searchQuery = searchInput?.value || '';
    listState.reset();
    setQueryParams({ q: searchQuery || null, state: stateFilter || null });
    loadPolicies(container, null);
  }, DEBOUNCE_DELAY_MS);
  searchInput?.addEventListener('input', handleSearch);

  // State filter handler
  const stateSelect = container.querySelector('#state-filter');
  stateSelect?.addEventListener('change', () => {
    stateFilter = stateSelect.value;
    listState.reset();
    setQueryParams({ q: searchQuery || null, state: stateFilter || null });
    loadPolicies(container, null);
  });

  // Pagination
  if (policies.length > 0) {
    const paginationContainer = container.querySelector('#pagination-container');
    const callbacks = listState.createCallbacks((cursor) => loadPolicies(container, cursor));
    renderPagination(
      paginationContainer,
      pageInfo,
      listState.currentPage,
      totalCount,
      DEFAULT_PAGE_SIZE,
      callbacks
    );
  }
}

/**
 * Renders a single policy row.
 * @param {Object} policy - The policy data
 * @returns {string} The HTML string for the row
 */
function renderPolicyRow(policy) {
  const badgeClass = getPolicyStateBadgeClass(policy.state);
  return `
    <tr>
      <td><a href="/policies/detail.html?id=${policy.id}">${escapeHtml(policy.insuranceCompanyPolicyNumber || 'N/A')}</a></td>
      <td>${escapeHtml(truncate(policy.productName, 25))}</td>
      <td>${escapeHtml(truncate(policy.insuredCustomerName, 25))}</td>
      <td><span class="badge ${badgeClass}">${formatPolicyState(policy.state)}</span></td>
      <td>${formatDate(policy.startDate)}</td>
      <td>${formatDate(policy.endDate)}</td>
      <td>${formatCurrency(policy.grossPremium, policy.currency || Currency.TurkishLira)}</td>
      <td>${formatDate(policy.createdAt)}</td>
      <td><a href="/policies/detail.html?id=${policy.id}">View</a></td>
    </tr>
  `;
}

init();
