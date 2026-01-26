import { createCustomerTable } from "@insurup/table-adapter-core";
import { createTable, type TableOptionsResolved } from "@tanstack/table-core";
import { getClient } from "$lib/client";
import { appState, type CustomerRow } from "../../state";
import { renderApp } from "../app.js";

export function initCustomerTable(): void {
  const client = getClient();

  appState.customerTable = createCustomerTable({
    columns: (col) => [
      col.id({ header: "ID", sortable: true }),
      col.name({ header: "Name", sortable: true }),
      col.type({ header: "Type", sortable: true }),
      col.primaryEmail({ header: "Email" }),
      col.primaryPhoneNumber({ header: "Phone" }),
      col.createdAt({ header: "Created", sortable: true }),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pageSize: 10,
    autoFetch: true,
    onError: (error) => {
      console.error("Failed to load customers:", error.message);
    },
    // Pass table-core required state via tableOptions
    tableOptions: {
      enableSorting: true,
      state: {
        columnPinning: { left: [], right: [] },
        columnVisibility: {},
        columnOrder: [],
      },
    },
  });

  // Create TanStack Table instance - tableOptions now includes everything needed
  const tableOptions = appState.customerTable.getTableOptions();
  appState.tanstackTable = createTable({
    ...tableOptions,
    onStateChange: () => {
      // State changes are handled by the adapter
    },
    renderFallbackValue: null,
  } as TableOptionsResolved<CustomerRow>);

  // Initial state
  appState.currentState = appState.customerTable.getSnapshot();

  // Subscribe to state changes
  appState.customerTable.subscribe(() => {
    appState.currentState = appState.customerTable!.getSnapshot();
    appState.tanstackTable!.setOptions((prev) => ({
      ...prev,
      ...appState.customerTable!.getTableOptions(),
    }));
    renderApp();
  });

  renderApp();
}
