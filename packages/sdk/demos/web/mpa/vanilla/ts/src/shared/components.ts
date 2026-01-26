/**
 * Shared UI components for the MPA demo.
 */

import { getAuthStatus, logout } from "./auth";

// ============ Header ============

export function renderHeader(container: HTMLElement): void {
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
  const themeToggle = container.querySelector("#theme-toggle") as HTMLButtonElement;
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    updateThemeIcon(themeToggle);
  }
}

function handleLogout(e: Event): void {
  e.preventDefault();
  logout();
  window.location.href = "/";
}

function toggleTheme(): void {
  const html = document.documentElement;
  const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(document.querySelector("#theme-toggle") as HTMLButtonElement);
}

function updateThemeIcon(button: HTMLButtonElement): void {
  const theme = document.documentElement.getAttribute("data-theme");
  button.textContent = theme === "dark" ? "☀️" : "🌙";
}

export function initTheme(): void {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
}

function formatExpiry(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return " (expired)";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return ` (${hours}h ${minutes % 60}m)`;
  if (minutes > 0) return ` (${minutes}m)`;
  return " (< 1m)";
}

// ============ Loading States ============

export function renderLoading(container: HTMLElement, message = "Loading..."): void {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner large"></div>
      <p>${message}</p>
    </div>
  `;
}

export function renderEmptyState(container: HTMLElement, title: string, message?: string): void {
  container.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ""}
    </div>
  `;
}

export function renderError(
  container: HTMLElement,
  title: string,
  message: string,
  retryAction?: () => void
): void {
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

type ToastType = "success" | "error" | "info";

export function showToast(message: string, type: ToastType = "info", duration = 5000): void {
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

export function showSuccess(message: string): void {
  showToast(message, "success");
}

export function showError(message: string): void {
  showToast(message, "error");
}

export function showInfo(message: string): void {
  showToast(message, "info");
}

// ============ DOM Utilities ============

export function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============ Pagination ============

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string | null;
}

export interface PaginationOptions {
  onNext: (cursor: string) => void;
  onPrevious: () => void;
  onFirst: () => void;
}

export function renderPagination(
  container: HTMLElement,
  pageInfo: PageInfo,
  currentPage: number,
  totalCount: number | null,
  pageSize: number,
  options: PaginationOptions
): void {
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

  container.querySelector(".pagination-first")?.addEventListener("click", () => options.onFirst());
  container.querySelector(".pagination-prev")?.addEventListener("click", () => options.onPrevious());
  container.querySelector(".pagination-next")?.addEventListener("click", () => {
    if (pageInfo.endCursor) options.onNext(pageInfo.endCursor);
  });
}

// ============ URL State ============

export function getQueryParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

export function setQueryParams(params: Record<string, string | number | null | undefined>): void {
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
