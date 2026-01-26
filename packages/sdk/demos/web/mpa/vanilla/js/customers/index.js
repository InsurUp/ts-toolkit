/**
 * Customer list page entry point.
 * @module pages/customers/list
 */

import { loadConfig } from "../js/shared/config.js";
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
} from "../js/shared/components.js";
import { requireAuth } from "../js/shared/auth.js";
import { getClient } from "../js/shared/client.js";
import { formatCustomerType, formatDate, truncate } from "../js/shared/format.js";
import { DEFAULT_PAGE_SIZE, DEBOUNCE_DELAY_MS } from "../js/shared/constants.js";
import { createListState } from "../js/shared/list-state.js";

/** @type {import('../js/shared/constants.js').ListStateManager} */
const listState = createListState();
let searchQuery = getQueryParam("q") || "";

/**
 * Initializes the customer list page.
 */
async function init() {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById("main-nav");
  if (nav) renderHeader(nav);

  const main = document.getElementById("main-content");
  if (main) await loadCustomers(main, null);
}

/**
 * Loads customers from the API.
 * @param {HTMLElement} container - The container element
 * @param {string|null} cursor - The pagination cursor
 */
async function loadCustomers(container, cursor) {
  renderLoading(container, "Loading customers...");

  try {
    const client = getClient();

    const searchOptions = searchQuery
      ? {
          or: [
            { name: { textSearch: { value: searchQuery } } },
            { identityNumber: { textSearch: { value: searchQuery } } },
            { primaryEmail: { textSearch: { value: searchQuery } } },
          ],
        }
      : undefined;

    // Fire count query without awaiting (non-blocking)
    const countPromise = client.customers.getCustomers({
      first: 1,
      search: searchOptions,
      select: ["id"],
    });

    // Await only the main data query
    const dataRes = await client.customers.getCustomers({
      first: DEFAULT_PAGE_SIZE,
      after: cursor ?? undefined,
      search: searchOptions,
      select: ["id", "name", "identityNumber", "primaryEmail", "type", "createdAt"],
      includeTotalCount: false,
    });

    if (!dataRes.isSuccess || !dataRes.data) {
      throw new Error(dataRes.message || "Failed to load customers");
    }

    const { nodes, pageInfo } = dataRes.data;
    const customers = (nodes ?? []).filter((c) => c !== null);

    // Render immediately without waiting for count
    renderCustomerList(container, customers, pageInfo, null);

    // Update pagination when count resolves
    countPromise.then((countRes) => {
      if (countRes.isSuccess && customers.length > 0) {
        const totalCount = countRes.data?.totalCount ?? null;
        const paginationContainer = container.querySelector("#pagination-container");
        if (paginationContainer) {
          const callbacks = listState.createCallbacks((cursor) => loadCustomers(container, cursor));
          renderPagination(paginationContainer, pageInfo, listState.currentPage, totalCount, DEFAULT_PAGE_SIZE, callbacks);
        }
      }
    });
  } catch (error) {
    console.error("Failed to load customers:", error);
    renderError(
      container,
      "Error Loading Customers",
      error instanceof Error ? error.message : "Unknown error",
      () => loadCustomers(container, cursor)
    );
  }
}

/**
 * Renders the customer list.
 * @param {HTMLElement} container - The container element
 * @param {Array} customers - The customer data
 * @param {Object} pageInfo - Pagination info
 * @param {number|null} totalCount - Total count of customers
 */
function renderCustomerList(container, customers, pageInfo, totalCount) {
  if (customers.length === 0 && listState.currentPage === 1 && !searchQuery) {
    renderEmptyState(container, "No Customers Found", "There are no customers in the system yet.");
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
          ${customers.length > 0 ? customers.map(renderCustomerRow).join("") : `
            <tr>
              <td colspan="6" style="text-align: center; color: var(--pico-muted-color);">
                No customers found${searchQuery ? " matching your search." : "."}
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <div id="pagination-container" class="pagination"></div>
  `;

  // Search handler with debounce
  const searchInput = container.querySelector("#search-input");
  const handleSearch = debounce(() => {
    searchQuery = searchInput?.value || "";
    listState.reset();
    setQueryParams({ q: searchQuery || null });
    loadCustomers(container, null);
  }, DEBOUNCE_DELAY_MS);
  searchInput?.addEventListener("input", handleSearch);

  // Pagination
  if (customers.length > 0) {
    const paginationContainer = container.querySelector("#pagination-container");
    const callbacks = listState.createCallbacks((cursor) => loadCustomers(container, cursor));
    renderPagination(paginationContainer, pageInfo, listState.currentPage, totalCount, DEFAULT_PAGE_SIZE, callbacks);
  }
}

/**
 * Renders a single customer row.
 * @param {Object} customer - The customer data
 * @returns {string} The HTML string for the row
 */
function renderCustomerRow(customer) {
  return `
    <tr>
      <td><a href="/customers/detail.html?id=${customer.id}">${escapeHtml(customer.name || "N/A")}</a></td>
      <td>${escapeHtml(customer.identityNumber || "-")}</td>
      <td>${escapeHtml(truncate(customer.primaryEmail, 30))}</td>
      <td>${formatCustomerType(customer.type)}</td>
      <td>${formatDate(customer.createdAt)}</td>
      <td><a href="/customers/detail.html?id=${customer.id}">View</a></td>
    </tr>
  `;
}

init();
