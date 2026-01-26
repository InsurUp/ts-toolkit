import "./style.css";
import { isAuthenticated, handleCallback } from "$lib/auth/oauth";
import { appState } from "./state";
import { getInitialTheme, setTheme } from "./theme";
import { renderApp } from "./components/app";
import { initCustomerTable } from "./components/customer-table/init";

// Initialize theme
setTheme(getInitialTheme());

// Handle OAuth callback
async function handleOAuthCallback(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (code && state) {
    try {
      await handleCallback(code, state);
      window.history.replaceState({}, "", "/");
      renderApp();
    } catch (error) {
      console.error("Login failed:", error);
      window.history.replaceState({}, "", "/");
      renderApp();
    }
  }
}

// Initialize app
function init(): void {
  // Check for OAuth callback
  if (window.location.pathname === "/callback") {
    handleOAuthCallback();
    return;
  }

  // Check initial route
  if (window.location.pathname === "/customers" && isAuthenticated()) {
    appState.currentPage = "customers";
    initCustomerTable();
  } else {
    renderApp();
  }
}

// Start the app
init();
