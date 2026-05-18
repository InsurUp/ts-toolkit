/**
 * @fileoverview Table Factory Utilities
 * @description Common utilities for creating entity-specific table adapters
 */

import type {
  InsurUpGraphQLResult,
  Connection,
  ClientError,
  InsurUpClientOptions,
  DeepFieldKeys,
  PickFields,
} from '@insurup/sdk';
import { DefaultInsurUpClient, InsurUpClientErrorType } from '@insurup/sdk';
import { BaseTableAdapter } from '../adapter/base-adapter.js';
import type {
  FetchFn,
  FetchRequestOptions,
  ColumnBuilder,
  ComputedColumnConfig,
  FieldColumnDef,
  ComputedColumnDef,
} from '../types.js';
import type { TableApiConfig, TableApi } from './types.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/types.js';
import { buildTableApi } from './create-table-api-from-adapter.js';

/**
 * Create a fetch function for client mode
 *
 * Wraps the SDK client initialization and error handling in a reusable way.
 * Only the actual API call method differs per entity.
 *
 * @template TRow - The row type
 * @template TQueryOptions - The query options type
 * @param apiCall - Function that makes the actual API call (e.g., client.customers.getCustomers)
 * @returns A fetch function compatible with the table adapter
 *
 * @example
 * ```typescript
 * const fetchFn = createClientFetchFn<TRow, GetCustomersOptions<TFields>>(
 *   (vars) => client.customers.getCustomers(vars)
 * )
 * ```
 */
export function createClientFetchFn<TRow, TQueryOptions>(
  apiCall: FetchFn<TRow, TQueryOptions>
): FetchFn<TRow, TQueryOptions> {
  return async (
    vars: TQueryOptions,
    requestOptions?: FetchRequestOptions
  ): Promise<InsurUpGraphQLResult<Connection<TRow>>> => {
    try {
      return await apiCall(vars, requestOptions);
    } catch (error) {
      const clientError: ClientError = {
        isSuccess: false,
        kind: 'client-error',
        type: InsurUpClientErrorType.Unknown,
        message: error instanceof Error ? error.message : 'Failed to initialize InsurUp client',
        error,
      };
      return clientError;
    }
  };
}

/**
 * Create a fetch function from client configuration
 *
 * @template TRow - The row type
 * @template TQueryOptions - The query options type
 * @param clientConfig - SDK client configuration
 * @param createApiCall - Factory that creates the API call from an SDK client
 * @returns The fetch function
 */
export function createFetchFnFromClient<TRow, TQueryOptions>(
  clientConfig: { baseUrl: string; tokenProvider: () => string },
  createApiCall: (client: DefaultInsurUpClient) => FetchFn<TRow, TQueryOptions>
): FetchFn<TRow, TQueryOptions> {
  const client = new DefaultInsurUpClient(clientConfig);
  return createClientFetchFn<TRow, TQueryOptions>(createApiCall(client));
}

// ============================================================================
// Generic Fetch Function Factory
// ============================================================================

/** Options with a custom fetch function */
type WithFetch<TOptions> = { fetch: FetchFn<unknown, TOptions>; client?: never };

/** Options with SDK client configuration */
type WithClient = { fetch?: never; client: InsurUpClientOptions };

/**
 * Create a fetch function from either a custom fetch or client configuration
 *
 * This is a generic utility that handles the common pattern of supporting
 * both custom fetch functions and SDK client modes.
 *
 * @template TRow - The row type
 * @template TOptions - The query options type
 * @param options - Options containing either fetch or client
 * @param clientMethod - Factory that creates the API call from an SDK client (required for client mode)
 * @returns The fetch function
 *
 * @example
 * ```typescript
 * const fetchFn = getFetchFn<TRow, GetCustomersOptions<TFields>>(
 *   options,
 *   (client) => (vars, requestOptions) =>
 *     client.customers.getCustomers({ ...vars, ...requestOptions })
 * )
 * ```
 */
export function getFetchFn<TRow, TOptions>(
  options: WithFetch<TOptions> | WithClient,
  clientMethod?: (
    client: DefaultInsurUpClient
  ) => (vars: TOptions, requestOptions?: FetchRequestOptions) => Promise<unknown>
): FetchFn<TRow, TOptions> {
  if ('fetch' in options && options.fetch) {
    return options.fetch as FetchFn<TRow, TOptions>;
  }
  if ('client' in options && options.client && clientMethod) {
    const client = new DefaultInsurUpClient(options.client);
    return createClientFetchFn<TRow, TOptions>(clientMethod(client) as FetchFn<TRow, TOptions>);
  }
  throw new Error('Either fetch function or client configuration must be provided');
}

// ============================================================================
// Generic Column Builder
// ============================================================================

/**
 * Create a generic Proxy-based column builder for any entity
 *
 * This factory creates a column builder that provides type-safe methods
 * for each field of the entity, plus a `computed` method for multi-field columns.
 *
 * @template TEntity - The entity type (e.g., QueryCustomerModel)
 * @template TFieldKey - The field key type (e.g., CustomerFieldKey)
 * @returns A column builder with methods for each field
 *
 * @example
 * ```typescript
 * const columnBuilder = createColumnBuilder<QueryCustomerModel, CustomerFieldKey>()
 * const columns = [
 *   columnBuilder.id(),
 *   columnBuilder.name('Customer Name'),
 *   columnBuilder.computed({
 *     uses: ['cityText', 'districtText'] as const,
 *     header: 'Location',
 *     render: row => `${row.cityText}, ${row.districtText}`
 *   })
 * ]
 * ```
 */
export function createColumnBuilder<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
>(): ColumnBuilder<TEntity, TFieldKey> {
  const handler: ProxyHandler<object> = {
    get(_target, prop: string) {
      // Handle the 'computed' method specially
      if (prop === 'computed') {
        return <const TFields extends readonly TFieldKey[]>(
          config: ComputedColumnConfig<TEntity, TFields>
        ): ComputedColumnDef<TFields> => ({
          key: `computed_${config.uses.join('_')}`,
          fields: [...config.uses],
          header: config.header,
          sortable: config.sortable ?? false,
          hideable: config.hideable ?? true,
          hiddenByDefault: config.hiddenByDefault ?? false,
          render: (_, row) => config.render(row as PickFields<TEntity, TFields>),
          isComputed: true,
          // TanStack Table column options
          size: config.size,
          minSize: config.minSize,
          maxSize: config.maxSize,
          enableResizing: config.enableResizing,
          sortDescFirst: config.sortDescFirst,
          enablePinning: config.enablePinning,
          meta: config.meta,
          footer: config.footer,
          // Brand properties for type extraction
          __fields: config.uses,
          __field: undefined,
        });
      }

      // For any other property, return a function that creates a field column
      const fieldKey = prop as TFieldKey;

      return (
        configOrHeader?:
          | string
          | {
              header: string;
              sortable?: boolean;
              hideable?: boolean;
              hiddenByDefault?: boolean;
              render?: (value: unknown, row: unknown) => unknown;
              // TanStack Table column options
              size?: number;
              minSize?: number;
              maxSize?: number;
              enableResizing?: boolean;
              sortDescFirst?: boolean;
              enablePinning?: boolean;
              meta?: Record<string, unknown>;
              footer?: string;
            }
      ): FieldColumnDef<typeof fieldKey & string> => {
        // No args - use field name as header
        if (configOrHeader === undefined) {
          return {
            key: fieldKey as string,
            fields: [fieldKey as string],
            header: fieldKey as string,
            sortable: false,
            hideable: true,
            hiddenByDefault: false,
            render: undefined,
            isComputed: false,
            // TanStack Table column options (undefined = use table defaults)
            size: undefined,
            minSize: undefined,
            maxSize: undefined,
            enableResizing: undefined,
            sortDescFirst: undefined,
            enablePinning: undefined,
            meta: undefined,
            footer: undefined,
            // Brand properties for type extraction
            __field: fieldKey as typeof fieldKey & string,
            __fields: undefined,
          };
        }

        // String - use as header
        if (typeof configOrHeader === 'string') {
          return {
            key: fieldKey as string,
            fields: [fieldKey as string],
            header: configOrHeader,
            sortable: false,
            hideable: true,
            hiddenByDefault: false,
            render: undefined,
            isComputed: false,
            // TanStack Table column options (undefined = use table defaults)
            size: undefined,
            minSize: undefined,
            maxSize: undefined,
            enableResizing: undefined,
            sortDescFirst: undefined,
            enablePinning: undefined,
            meta: undefined,
            footer: undefined,
            // Brand properties for type extraction
            __field: fieldKey as typeof fieldKey & string,
            __fields: undefined,
          };
        }

        // Full config object
        return {
          key: fieldKey as string,
          fields: [fieldKey as string],
          header: configOrHeader.header,
          sortable: configOrHeader.sortable ?? false,
          hideable: configOrHeader.hideable ?? true,
          hiddenByDefault: configOrHeader.hiddenByDefault ?? false,
          render: configOrHeader.render,
          isComputed: false,
          // TanStack Table column options
          size: configOrHeader.size,
          minSize: configOrHeader.minSize,
          maxSize: configOrHeader.maxSize,
          enableResizing: configOrHeader.enableResizing,
          sortDescFirst: configOrHeader.sortDescFirst,
          enablePinning: configOrHeader.enablePinning,
          meta: configOrHeader.meta,
          footer: configOrHeader.footer,
          // Brand properties for type extraction
          __field: fieldKey as typeof fieldKey & string,
          __fields: undefined,
        };
      };
    },
  };

  return new Proxy({}, handler) as ColumnBuilder<TEntity, TFieldKey>;
}

// ============================================================================
// ============================================================================
// Table API Factory
// ============================================================================

/**
 * Create the standard table API that wraps BaseTableAdapter
 *
 * This factory creates a consistent public API for all entity table factories.
 * It wraps the internal BaseTableAdapter with a clean, documented interface.
 *
 * @template TEntity - The full entity type
 * @template TRow - The row type with selected fields
 * @template TQueryOptions - The SDK query options type
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @param config - Configuration including fetchFn, columns, etc.
 * @returns Standard table API object
 *
 * @example
 * ```typescript
 * const api = createTableApi<
 *   QueryCustomerModel,
 *   CustomerSchemaRowType<TSchema>,
 *   GetCustomersOptions<TFields>,
 *   QueryCustomerModelSortInput,
 *   QueryCustomerModelFilterInput,
 *   QueryCustomerModelSearchInput,
 *   CursorPaginationOptions
 * >({
 *   fetchFn,
 *   buildQueryOptions,
 *   columns: internalColumns,
 *   pagination: { type: 'cursor', pageSize: options.pageSize ?? 20 },
 *   defaultFilter: options.defaultFilter,
 *   defaultSearch: options.defaultSearch,
 *   sortingConverters,
 *   queryKeyPrefix: 'customers',
 * })
 * ```
 */
export function createTableApi<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
>(
  config: TableApiConfig<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  return buildTableApi(BaseTableAdapter, config);
}
