/**
 * Header component with navigation and auth status.
 */

import { getAuthStatus, logout } from "../auth";
import { navigate } from "../utils/router";

/**
 * Render the header navigation.
 */
export function renderHeader(container: HTMLElement): void {
  const authStatus = getAuthStatus();

  const navLinks = authStatus.isAuthenticated
    ? `
      <li><a href="#/customers">Customers</a></li>
      <li><a href="#/policies">Policies</a></li>
      <li><a href="#/profile">Profile</a></li>
      <li>
        <a href="#" id="logout-link" class="secondary">Logout</a>
      </li>
    `
    : `
      <li><a href="#/login" role="button">Login</a></li>
    `;

  const expiryInfo = authStatus.expiresAt
    ? formatExpiry(authStatus.expiresAt)
    : "";

  const statusHtml = authStatus.isAuthenticated
    ? `
      <div class="auth-status">
        <span class="status-dot authenticated"></span>
        <span>Authenticated${expiryInfo}</span>
      </div>
    `
    : `
      <div class="auth-status">
        <span class="status-dot unauthenticated"></span>
        <span>Not authenticated</span>
      </div>
    `;

  container.innerHTML = `
    <a href="#/" class="nav-brand">InsurUp SDK</a>
    <ul class="nav-links">
      ${navLinks}
    </ul>
    <div style="display: flex; align-items: center; gap: 1rem;">
      ${statusHtml}
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme">
        🌙
      </button>
    </div>
  `;

  // Attach event listeners
  const logoutLink = container.querySelector("#logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
  }

  const themeToggle = container.querySelector("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    updateThemeIcon(themeToggle as HTMLButtonElement);
  }
}

/**
 * Handle logout click.
 */
function handleLogout(e: Event): void {
  e.preventDefault();
  logout();
  navigate("/");
  // Refresh the page to update header
  window.location.reload();
}

/**
 * Toggle between light and dark theme.
 */
function toggleTheme(): void {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  const button = document.querySelector("#theme-toggle") as HTMLButtonElement;
  if (button) {
    updateThemeIcon(button);
  }
}

/**
 * Update the theme toggle icon.
 */
function updateThemeIcon(button: HTMLButtonElement): void {
  const theme = document.documentElement.getAttribute("data-theme");
  button.textContent = theme === "dark" ? "☀️" : "🌙";
}

/**
 * Initialize theme from localStorage.
 */
export function initTheme(): void {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
}

/**
 * Format expiry time for display.
 */
function formatExpiry(expiresAt: Date): string {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return " (expired)";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return ` (${hours}h ${minutes % 60}m)`;
  } else if (minutes > 0) {
    return ` (${minutes}m)`;
  } else {
    return " (< 1m)";
  }
}
