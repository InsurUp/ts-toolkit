/**
 * Shared UI components for the MPA demo.
 * @module components
 */

import { getAuthStatus, logout } from "./auth.js";
import { STORAGE_KEYS } from "./constants.js";

// ============ Header ============

/**
 * Renders the navigation header with auth status and theme toggle.
 *
 * @param {HTMLElement} container - The nav container element
 *
 * @example
 * const nav = document.getElementById("main-nav");
 * if (nav) renderHeader(nav);
 */
export function renderHeader(container) {
  const authStatus = getAuthStatus();

  const navLinks = authStatus.isAuthenticated
    ? `
      <li><a href="/customers/">Customers</a></li>
      <li><a href="/policies/">Policies</a></li>
      <li><a href="/profile.html">Profile</a></li>
      <li><a href="#" id="logout-link" class="secondary">Logout</a></li>
    `
    : `<li><a href="/login.html" role="button">Login</a></li>`;

  const expiryInfo = authStatus.expiresAt ? formatExpiry(authStatus.expiresAt) : "";
  const statusHtml = authStatus.isAuthenticated
    ? `<div class="auth-status">
        <span class="status-dot authenticated"></span>
        <span>Authenticated${expiryInfo}</span>
      </div>`
    : `<div class="auth-status">
        <span class="status-dot unauthenticated"></span>
        <span>Not authenticated</span>
      </div>`;

  container.innerHTML = `
    <a href="/" class="nav-brand">InsurUp SDK</a>
    <ul class="nav-links">${navLinks}</ul>
    <div style="display: flex; align-items: center; gap: 1rem;">
      ${statusHtml}
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme">🌙</button>
    </div>
  `;

  container.querySelector("#logout-link")?.addEventListener("click", handleLogout);
  const themeToggle = container.querySelector("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    updateThemeIcon(themeToggle);
  }
}

function handleLogout(e) {
  e.preventDefault();
  logout();
  window.location.href = "/";
}

/**
 * Toggles between light and dark theme.
 */
function toggleTheme() {
  const html = document.documentElement;
  const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  updateThemeIcon(document.querySelector("#theme-toggle"));
}

/**
 * Updates the theme toggle button icon based on current theme.
 * @param {Element|null} button - The theme toggle button
 */
function updateThemeIcon(button) {
  if (!button) return;
  const theme = document.documentElement.getAttribute("data-theme");
  button.textContent = theme === "dark" ? "☀️" : "🌙";
}

/**
 * Initializes the theme from localStorage.
 * Call this on page load to restore the user's theme preference.
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
}

function formatExpiry(expiresAt) {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return " (expired)";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return ` (${hours}h ${minutes % 60}m)`;
  if (minutes > 0) return ` (${minutes}m)`;
  return " (< 1m)";
}

// ============ Loading States ============

/**
 * Renders a loading spinner with an optional message.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {string} [message="Loading..."] - The loading message to display
 *
 * @example
 * renderLoading(container, "Loading customers...");
 */
export function renderLoading(container, message = "Loading...") {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner large"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Renders an empty state message when no data is available.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {string} title - The title of the empty state
 * @param {string} [message] - An optional description message
 *
 * @example
 * renderEmptyState(container, "No Customers", "Create your first customer to get started.");
 */
export function renderEmptyState(container, title, message) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ""}
    </div>
  `;
}

/**
 * Renders an error state with optional retry functionality.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {string} title - The error title
 * @param {string} message - The error message/description
 * @param {(() => void)} [retryAction] - Optional callback for retry button
 *
 * @example
 * renderError(
 *   container,
 *   "Error Loading Data",
 *   "Network request failed",
 *   () => loadData()
 * );
 */
export function renderError(container, title, message, retryAction) {
  container.innerHTML = `
    <article>
      <header><h3>${title}</h3></header>
      <p>${message}</p>
      ${retryAction ? '<button id="retry-btn">Retry</button>' : ""}
    </article>
  `;
  if (retryAction) {
    container.querySelector("#retry-btn")?.addEventListener("click", retryAction);
  }
}

// ============ Toast Notifications ============

/**
 * Shows a toast notification message.
 *
 * Requires a `#toast-container` element in the DOM.
 *
 * @param {string} message - The message to display
 * @param {"success"|"error"|"info"} [type="info"] - The toast type (affects styling)
 * @param {number} [duration=5000] - How long to show the toast (in ms)
 *
 * @example
 * showToast("Operation completed", "success");
 * showToast("Something went wrong", "error", 8000);
 */
export function showToast(message, type = "info", duration = 5000) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toast-out 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Shows a success toast notification.
 * @param {string} message - The success message
 */
export function showSuccess(message) {
  showToast(message, "success");
}

/**
 * Shows an error toast notification.
 * @param {string} message - The error message
 */
export function showError(message) {
  showToast(message, "error");
}

/**
 * Shows an info toast notification.
 * @param {string} message - The info message
 */
export function showInfo(message) {
  showToast(message, "info");
}

// ============ DOM Utilities ============

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string|undefined|null} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Creates a debounced version of a function.
 * The function will only be called after the specified delay has passed
 * since the last invocation.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn - The function to debounce
 * @param {number} [delay=300] - The delay in milliseconds
 * @returns {T} The debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * // Only the last call within 300ms will execute
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this one runs
 */
export function debounce(fn, delay = 300) {
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timeoutId;

  return /** @type {T} */ (
    function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    }
  );
}

// ============ Pagination ============

/**
 * @typedef {import('./constants.js').PageInfo} PageInfo
 * @typedef {import('./constants.js').PaginationCallbacks} PaginationCallbacks
 */

/**
 * Renders cursor-based pagination controls.
 *
 * @param {HTMLElement} container - The container element for pagination controls
 * @param {PageInfo} pageInfo - The pagination info from the API response
 * @param {number} currentPage - The current page number (1-indexed)
 * @param {number|null} totalCount - Total count of items (null if unknown)
 * @param {number} pageSize - Number of items per page
 * @param {PaginationCallbacks} callbacks - Pagination event callbacks
 *
 * @example
 * const callbacks = listState.createCallbacks((cursor) => loadData(cursor));
 * renderPagination(paginationEl, pageInfo, listState.currentPage, totalCount, 10, callbacks);
 */
export function renderPagination(container, pageInfo, currentPage, totalCount, pageSize, callbacks) {
  const start = (currentPage - 1) * pageSize + 1;
  const hasTotal = totalCount !== null;
  const end = hasTotal ? Math.min(currentPage * pageSize, totalCount) : currentPage * pageSize;
  const totalPages = hasTotal ? Math.ceil(totalCount / pageSize) : null;

  const info = hasTotal
    ? `Showing ${start}-${end} of ${totalCount.toLocaleString()} (Page ${currentPage} of ${totalPages})`
    : `Page ${currentPage}`;

  container.innerHTML = `
    <div class="pagination-info">${info}</div>
    <div class="pagination-controls">
      <button class="secondary outline pagination-first" ${currentPage === 1 ? "disabled" : ""}>First</button>
      <button class="secondary outline pagination-prev" ${!pageInfo.hasPreviousPage ? "disabled" : ""}>Previous</button>
      <button class="secondary outline pagination-next" ${!pageInfo.hasNextPage ? "disabled" : ""}>Next</button>
    </div>
  `;

  container.querySelector(".pagination-first")?.addEventListener("click", () => callbacks.onFirst());
  container.querySelector(".pagination-prev")?.addEventListener("click", () => callbacks.onPrevious());
  container.querySelector(".pagination-next")?.addEventListener("click", () => {
    if (pageInfo.endCursor) callbacks.onNext(pageInfo.endCursor);
  });
}

// ============ URL State ============

/**
 * Gets a query parameter from the current URL.
 *
 * @param {string} key - The query parameter key
 * @returns {string|null} The parameter value or null if not found
 *
 * @example
 * const searchQuery = getQueryParam("q") || "";
 * const page = parseInt(getQueryParam("page") || "1", 10);
 */
export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Updates query parameters in the URL without page reload.
 *
 * Uses `history.replaceState` to update the URL.
 * Null/undefined/empty values will remove the parameter.
 *
 * @param {Record<string, string|number|null|undefined>} params - Parameters to set
 *
 * @example
 * setQueryParams({ q: searchQuery, page: currentPage });
 * setQueryParams({ q: null }); // Removes 'q' parameter
 */
export function setQueryParams(params) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  history.replaceState(null, "", url.toString());
}
