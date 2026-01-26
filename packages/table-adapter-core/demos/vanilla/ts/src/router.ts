import { appState } from "./state";
import { renderApp } from "./components/app.js";
import { initCustomerTable } from "./components/customer-table/init.js";

export function navigateTo(page: "home" | "customers"): void {
  appState.currentPage = page;
  const path = page === "home" ? "/" : `/${page}`;
  window.history.pushState({}, "", path);

  if (page === "customers" && !appState.customerTable) {
    initCustomerTable();
  } else {
    renderApp();
  }
}
