/**
 * @fileoverview Customer Entity Exports
 */

export { createCustomerTable, type CustomerTable } from './factory.js';

export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
  // Re-export SDK types for convenience
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
} from './types.js';
