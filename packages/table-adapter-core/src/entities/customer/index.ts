/**
 * @fileoverview Customer Entity Exports
 */

export {
  createCustomerTable,
  createInfiniteCustomerTable,
  type CustomerTable,
  type InfiniteCustomerTable,
} from './factory.js';

export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
} from './types.js';
