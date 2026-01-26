import { createCustomerTable, type AdapterState, type CustomerRowType, type FieldColumnDef } from "@insurup/table-adapter-core";
import type { Table } from "@tanstack/table-core";

// Define the column types for type inference
export type CustomerColumns = [
  FieldColumnDef<"id">,
  FieldColumnDef<"name">,
  FieldColumnDef<"type">,
  FieldColumnDef<"primaryEmail">,
  FieldColumnDef<"primaryPhoneNumber">,
  FieldColumnDef<"createdAt">
];

export type CustomerRow = CustomerRowType<CustomerColumns>;

// App state - mutable singleton
export const appState = {
  customerTable: null as ReturnType<typeof createCustomerTable<CustomerColumns>> | null,
  tanstackTable: null as Table<CustomerRow> | null,
  currentState: null as AdapterState<CustomerRow> | null,
  currentPage: "home" as "home" | "customers",
  searchInput: "",
  searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
};
