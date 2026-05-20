/**
 * @fileoverview Customer Table Types
 * @description Type definitions for the customer table adapter
 */

import type {
  GetCustomersOptions,
  CustomerFieldKey,
  QueryCustomerModel,
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
  QueryCustomerModelUnifiedFilterInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

// Re-export filter and search types for convenience
export type {
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
  QueryCustomerModelUnifiedFilterInput,
} from '@insurup/sdk';

/**
 * Column definition for customer tables
 */
export type CustomerColumnDef = AnyColumnDef<CustomerFieldKey>;

/**
 * Extract fields from customer column definitions
 * @template TColumns - The column definitions array
 */
export type CustomerExtractFields<TColumns extends readonly CustomerColumnDef[]> =
  EntityExtractFields<TColumns, CustomerFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type CustomerRowType<TColumns extends readonly CustomerColumnDef[]> = PickFields<
  QueryCustomerModel,
  readonly CustomerExtractFields<TColumns>[]
>;

/**
 * Fetch function type for customer queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type CustomerFetchFn<
  TRow = QueryCustomerModel,
  TFields extends CustomerFieldKey[] = CustomerFieldKey[],
> = EntityFetchFn<TRow, GetCustomersOptions<TFields>>;

/**
 * Filter input type for customer queries (SDK-level, server `filter:` slot)
 */
export type CustomerFilterInput = QueryCustomerModelFilterInput;

/**
 * Search input type for customer queries (SDK-level, server `search:` slot)
 */
export type CustomerSearchInput = QueryCustomerModelSearchInput;

/**
 * Unified filter input for the table adapter's `setFilter` / `defaultFilter`.
 * Per-field; fields tagged with `$search: true` are routed to the server's
 * search slot.
 */
export type CustomerUnifiedFilterInput = QueryCustomerModelUnifiedFilterInput;

/**
 * Options for createCustomerTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type CustomerTableOptions<TColumns extends CustomerColumnDef[]> = EntityTableOptions<
  QueryCustomerModel,
  CustomerFieldKey,
  TColumns,
  CustomerRowType<TColumns>,
  CustomerFetchFn<CustomerRowType<TColumns>, CustomerExtractFields<TColumns>[]>,
  CustomerUnifiedFilterInput,
  CursorPaginationOptions
>;
