/**
 * Policy list page entry point.
 */

import { loadConfig } from "../shared/config";
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
} from "../shared/components";
import { requireAuth } from "../shared/auth";
import { getClient } from "../shared/client";
import { formatDate, formatCurrency, formatPolicyState, getPolicyStateBadgeClass, truncate } from "../shared/format";
import { PolicyState, type Currency } from "@insurup/contracts";

import type { DateOnly, DateTime } from "@insurup/contracts";

const PAGE_SIZE = 10;

interface PolicyRow {
  id: string;
  insuranceCompanyPolicyNumber: string;
  productName: string | null | undefined;
  insuredCustomerName: string | null | undefined;
  state: PolicyState;
  startDate: DateOnly;
  endDate: DateOnly;
  grossPremium: number | null | undefined;
  currency: Currency;
  createdAt: DateTime;
}

let currentPage = 1;
let cursors: (string | null)[] = [null];
let searchQuery = getQueryParam("q") || "";
let stateFilter = getQueryParam("state") || "";

async function init(): Promise<void> {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById("main-nav");
  if (nav) renderHeader(nav);

  const main = document.getElementById("main-content");
  if (main) await loadPolicies(main, null);
}

async function loadPolicies(container: HTMLElement, cursor: string | null): Promise<void> {
  renderLoading(container, "Loading policies...");

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

    const filterOptions = stateFilter ? { state: { eq: stateFilter as PolicyState } } : undefined;

    // Fire count query without awaiting (non-blocking)
    const countPromise = client.policies.getPolicies({
      first: 1,
      search: searchOptions,
      filter: filterOptions,
      select: ["id"] as const,
    });

    // Await only the main data query
    const dataRes = await client.policies.getPolicies({
      first: PAGE_SIZE,
      after: cursor ?? undefined,
      search: searchOptions,
      filter: filterOptions,
      select: [
        "id",
        "insuranceCompanyPolicyNumber",
        "productName",
        "insuredCustomerName",
        "state",
        "startDate",
        "endDate",
        "grossPremium",
        "currency",
        "createdAt",
      ] as const,
      includeTotalCount: false,
    });

    if (!dataRes.isSuccess || !dataRes.data) {
      throw new Error(dataRes.message || "Failed to load policies");
    }

    const { nodes, pageInfo } = dataRes.data;
    const policies: PolicyRow[] = (nodes ?? [])
      .filter((p) => p !== null)
      .map((p) => ({
        id: p.id,
        insuranceCompanyPolicyNumber: p.insuranceCompanyPolicyNumber,
        productName: p.productName,
        insuredCustomerName: p.insuredCustomerName,
        state: p.state,
        startDate: p.startDate,
        endDate: p.endDate,
        grossPremium: p.grossPremium,
        currency: p.currency,
        createdAt: p.createdAt,
      }));

    // Render immediately without waiting for count
    renderPolicyList(container, policies, pageInfo, null);

    // Update pagination when count resolves
    countPromise.then((countRes) => {
      if (countRes.isSuccess && policies.length > 0) {
        const totalCount = countRes.data?.totalCount ?? null;
        const paginationContainer = container.querySelector("#pagination-container") as HTMLElement;
        if (paginationContainer) {
          renderPagination(paginationContainer, pageInfo, currentPage, totalCount, PAGE_SIZE, {
            onNext: (nextCursor) => {
              if (cursors.length === currentPage) {
                cursors.push(nextCursor);
              }
              currentPage++;
              loadPolicies(container, nextCursor);
            },
            onPrevious: () => {
              if (currentPage > 1) {
                currentPage--;
                loadPolicies(container, cursors[currentPage - 1] ?? null);
              }
            },
            onFirst: () => {
              currentPage = 1;
              loadPolicies(container, null);
            },
          });
        }
      }
    });
  } catch (error) {
    console.error("Failed to load policies:", error);
    renderError(
      container,
      "Error Loading Policies",
      error instanceof Error ? error.message : "Unknown error",
      () => loadPolicies(container, cursor)
    );
  }
}

function renderPolicyList(
  container: HTMLElement,
  policies: PolicyRow[],
  pageInfo: PageInfo,
  totalCount: number | null
): void {
  const hasFilters = searchQuery || stateFilter;

  if (policies.length === 0 && currentPage === 1 && !hasFilters) {
    renderEmptyState(container, "No Policies Found", "There are no policies in the system yet.");
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
          <option value="${PolicyState.Active}" ${stateFilter === PolicyState.Active ? "selected" : ""}>Active</option>
          <option value="${PolicyState.EndOfLife}" ${stateFilter === PolicyState.EndOfLife ? "selected" : ""}>Expired</option>
          <option value="${PolicyState.Cancelled}" ${stateFilter === PolicyState.Cancelled ? "selected" : ""}>Cancelled</option>
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
          ${policies.length > 0 ? policies.map(renderPolicyRow).join("") : `
            <tr>
              <td colspan="9" style="text-align: center; color: var(--pico-muted-color);">
                No policies found${hasFilters ? " matching your criteria." : "."}
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <div id="pagination-container" class="pagination"></div>
  `;

  // Search handler
  const searchInput = container.querySelector("#search-input") as HTMLInputElement;
  let debounceTimeout: ReturnType<typeof setTimeout>;
  searchInput?.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchQuery = searchInput.value;
      currentPage = 1;
      cursors = [null];
      setQueryParams({ q: searchQuery || null, state: stateFilter || null });
      loadPolicies(container, null);
    }, 300);
  });

  // State filter handler
  const stateSelect = container.querySelector("#state-filter") as HTMLSelectElement;
  stateSelect?.addEventListener("change", () => {
    stateFilter = stateSelect.value;
    currentPage = 1;
    cursors = [null];
    setQueryParams({ q: searchQuery || null, state: stateFilter || null });
    loadPolicies(container, null);
  });

  // Pagination
  if (policies.length > 0) {
    const paginationContainer = container.querySelector("#pagination-container") as HTMLElement;
    renderPagination(paginationContainer, pageInfo, currentPage, totalCount, PAGE_SIZE, {
      onNext: (nextCursor) => {
        if (cursors.length === currentPage) {
          cursors.push(nextCursor);
        }
        currentPage++;
        loadPolicies(container, nextCursor);
      },
      onPrevious: () => {
        if (currentPage > 1) {
          currentPage--;
          loadPolicies(container, cursors[currentPage - 1] ?? null);
        }
      },
      onFirst: () => {
        currentPage = 1;
        loadPolicies(container, null);
      },
    });
  }
}

function renderPolicyRow(policy: PolicyRow): string {
  const badgeClass = getPolicyStateBadgeClass(policy.state);
  return `
    <tr>
      <td><a href="/policies/detail.html?id=${policy.id}">${escapeHtml(policy.insuranceCompanyPolicyNumber || "N/A")}</a></td>
      <td>${escapeHtml(truncate(policy.productName, 25))}</td>
      <td>${escapeHtml(truncate(policy.insuredCustomerName, 25))}</td>
      <td><span class="badge ${badgeClass}">${formatPolicyState(policy.state)}</span></td>
      <td>${formatDate(policy.startDate)}</td>
      <td>${formatDate(policy.endDate)}</td>
      <td>${formatCurrency(policy.grossPremium, policy.currency || "TRY")}</td>
      <td>${formatDate(policy.createdAt)}</td>
      <td><a href="/policies/detail.html?id=${policy.id}">View</a></td>
    </tr>
  `;
}

init();
