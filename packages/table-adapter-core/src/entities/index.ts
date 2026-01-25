/**
 * @fileoverview Entities Module Exports
 * @description Entity-specific table adapters
 */

// Customer entity
export { createCustomerTable, type CustomerTable } from './customer/index.js';
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
} from './customer/index.js';
