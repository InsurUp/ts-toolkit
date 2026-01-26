import { startLogin, logout } from "$lib/auth/oauth";
import { appState } from "../state";
import { setTheme, isDarkTheme } from "../theme";
import { navigateTo } from "../router";
import { renderHeader } from "./header";
import { renderHome } from "./home";
import { renderCustomerTable } from "./customer-table";

export function renderApp(): void {
  const app = document.getElementById("app");
  if (!app) return;

  // Preserve focus state before re-render
  const activeElement = document.activeElement as HTMLInputElement | null;
  const wasSearchFocused = activeElement?.id === "search-input";
  const selectionStart = wasSearchFocused ? activeElement.selectionStart : null;
  const selectionEnd = wasSearchFocused ? activeElement.selectionEnd : null;

  app.innerHTML = `
    <div class="min-h-screen bg-background">
      ${renderHeader()}
      <main class="container mx-auto px-4 py-6">
        ${appState.currentPage === "home" ? renderHome() : renderCustomerTable()}
      </main>
    </div>
  `;

  attachEventListeners();

  // Restore focus after re-render
  if (wasSearchFocused) {
    const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        searchInput.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}

function attachEventListeners(): void {
  // Navigation
  document.getElementById("nav-home")?.addEventListener("click", () => navigateTo("home"));
  document.getElementById("nav-customers")?.addEventListener("click", () => navigateTo("customers"));
  document.getElementById("go-customers")?.addEventListener("click", () => navigateTo("customers"));

  // Auth
  document.getElementById("login-btn")?.addEventListener("click", () => startLogin());
  document.getElementById("login-btn-home")?.addEventListener("click", () => startLogin());
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    logout();
    navigateTo("home");
  });

  // Theme
  document.getElementById("toggle-theme")?.addEventListener("click", () => {
    setTheme(!isDarkTheme());
    renderApp();
  });

  // Table controls
  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    appState.customerTable?.invalidate();
  });

  document.getElementById("search-input")?.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    appState.searchInput = value;
    
    // Debounce search to avoid excessive API calls
    if (appState.searchDebounceTimer) clearTimeout(appState.searchDebounceTimer);
    appState.searchDebounceTimer = setTimeout(() => {
      if (value.trim()) {
        appState.customerTable?.setSearch({
          name: { textSearch: { value: value.trim() } },
        });
      } else {
        appState.customerTable?.clearSearch();
      }
    }, 300);
  });

  document.getElementById("prev-page")?.addEventListener("click", () => {
    appState.tanstackTable?.previousPage();
  });

  document.getElementById("next-page")?.addEventListener("click", () => {
    appState.tanstackTable?.nextPage();
  });

  // Sort columns
  document.querySelectorAll("[data-sort-column]").forEach((el) => {
    el.addEventListener("click", () => {
      const columnId = el.getAttribute("data-sort-column");
      if (columnId && appState.tanstackTable) {
        const column = appState.tanstackTable.getColumn(columnId);
        column?.getToggleSortingHandler()?.(new MouseEvent("click"));
      }
    });
  });
}
