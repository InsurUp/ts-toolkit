/**
 * @fileoverview Shared Types for Generic Table Adapter
 * @description Builder-based column types with automatic type inference for cell renderers
 */

import type {
  DeepFieldKeys,
  InsurUpClientOptions,
  InsurUpGraphQLResult,
  Connection,
  PickFields,
} from '@insurup/sdk';
import type { TableOptionsResolved } from '@tanstack/table-core';
import type { ErrorCallbacks } from './adapter/types.js';

// Re-export SDK types for convenience
export type {
  DeepFieldKeys,
  InsurUpGraphQLResult,
  Connection,
  PageInfo,
  InsurUpClientOptions,
  PickFields,
} from '@insurup/sdk';

// Re-export error types from adapter
export type { TableError, ErrorCallbacks, AdapterState } from './adapter/types.js';

// ============================================================================
// Column Configuration Types
// ============================================================================

/**
 * Extract the value type for a field path from an entity
 * For nested paths like 'agentBranch.id', this extracts the nested type
 */
export type FieldValueType<TEntity, TField extends DeepFieldKeys<TEntity>> =
  PickFields<TEntity, readonly [TField]> extends { [K in TField & string]: infer V } ? V : unknown;

/**
 * Configuration for a single-field column (used with builder)
 * @template TEntity - The entity type
 * @template TField - The specific field key
 * @template TFieldType - The type of the field value (inferred)
 */
export interface ColumnConfig<TEntity, TField extends DeepFieldKeys<TEntity>, TFieldType> {
  /** Column header text */
  header: string;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Column visibility */
  hideable?: boolean;
  /**
   * Custom cell renderer - receives the typed field value.
   *
   * **Typing Note:** The `row` parameter is typed conservatively to only include this column's
   * field. At runtime, additional fields from other columns exist but are not typed here to
   * prevent accessing fields that might not be selected. For type-safe access to multiple
   * fields, use `col.computed()` instead.
   *
   * @param value - The field value, fully typed
   * @param row - The row with only this field selected (conservative typing for safety)
   * @returns Cell content (string, number, or React element)
   *
   * @example
   * ```typescript
   * // Single field - use value directly
   * col.name({ header: 'Name', render: (value) => value.toUpperCase() })
   *
   * // Need multiple fields? Use computed column instead:
   * col.computed({
   *   uses: ['firstName', 'lastName'] as const,
   *   header: 'Full Name',
   *   render: (row) => `${row.firstName} ${row.lastName}`
   * })
   * ```
   */
  render?: (value: TFieldType, row: PickFields<TEntity, readonly [TField]>) => unknown;
}

/**
 * Configuration for a computed column using multiple fields.
 *
 * Use computed columns when you need type-safe access to multiple fields in the render function.
 * The `row` parameter will be typed with exactly the fields declared in `uses`.
 *
 * @template TEntity - The entity type
 * @template TFields - Array of field keys to fetch
 *
 * @example
 * ```typescript
 * col.computed({
 *   uses: ['cityText', 'districtText'] as const,  // Note: 'as const' for proper inference
 *   header: 'Location',
 *   render: (row) => `${row.cityText}, ${row.districtText}`
 *   //       ^ row is typed as { cityText: string; districtText: string }
 * })
 * ```
 */
export interface ComputedColumnConfig<TEntity, TFields extends readonly DeepFieldKeys<TEntity>[]> {
  /** Array of fields this computed column depends on */
  uses: TFields;
  /** Column header text */
  header: string;
  /** Enable sorting for this column (sorts by first field) */
  sortable?: boolean;
  /** Column visibility */
  hideable?: boolean;
  /**
   * Custom cell renderer - receives the row with the declared fields.
   *
   * **Typing Note:** The `row` parameter includes exactly the fields specified in `uses`.
   * At runtime, additional fields from other columns may exist but are not typed here
   * to ensure you only access fields that are guaranteed to be selected.
   *
   * @param row - The row with the declared `uses` fields (type-safe)
   * @returns Cell content (string, number, or React element)
   */
  render: (row: PickFields<TEntity, TFields>) => unknown;
}

// ============================================================================
// Branded Column Definition Types (for field inference)
// ============================================================================

/**
 * Base internal column definition used by the adapter
 */
interface BaseInternalColumnDef {
  /** Field key (or computed column id) */
  key: string;
  /** Fields to fetch from GraphQL */
  fields: string[];
  /** Column header */
  header: string;
  /** Whether sorting is enabled */
  sortable: boolean;
  /** Whether hiding is enabled */
  hideable: boolean;
  /** Cell render function (if any) */
  render?: (value: unknown, row: unknown) => unknown;
  /** Whether this is a computed column */
  isComputed: boolean;
}

/**
 * Field column definition - carries the field key in the type
 * @template TField - The field key
 */
export interface FieldColumnDef<TField extends string> extends BaseInternalColumnDef {
  /** Brand for field column - carries the field key for type extraction */
  readonly __field: TField;
  readonly __fields?: never;
}

/**
 * Computed column definition - carries the field keys in the type
 * @template TFields - The field keys tuple
 */
export interface ComputedColumnDef<
  TFields extends readonly string[],
> extends BaseInternalColumnDef {
  /** Brand for computed column - carries the field keys for type extraction */
  readonly __fields: TFields;
  readonly __field?: never;
}

/**
 * Any column definition (field or computed)
 */
export type ColumnDef<
  TField extends string = string,
  TFields extends readonly string[] = readonly string[],
> = FieldColumnDef<TField> | ComputedColumnDef<TFields>;

/**
 * Legacy alias for internal column def (unbranded)
 */
export type InternalColumnDef = BaseInternalColumnDef;

/**
 * Extract fields from a column definition
 */
export type ExtractFieldFromColumnDef<T> =
  T extends FieldColumnDef<infer K>
    ? K
    : T extends ComputedColumnDef<infer TFields>
      ? TFields[number]
      : never;

/**
 * Extract all fields from an array of column definitions
 */
export type ExtractFieldsFromColumnDefs<T extends readonly unknown[]> = ExtractFieldFromColumnDef<
  T[number]
>;

// ============================================================================
// Builder Types
// ============================================================================

/**
 * Column builder type - provides methods for each field
 * Returns branded column defs that carry field type information
 * @template TEntity - The entity type
 * @template TFieldKey - The field key type
 */
export type ColumnBuilder<TEntity, TFieldKey extends DeepFieldKeys<TEntity>> = {
  /**
   * Create a column for a specific field
   * Overloaded to accept: nothing, string header, or full config
   */
  [K in TFieldKey]: {
    /** Default column (uses field name as header) */
    (): FieldColumnDef<K & string>;
    /** Column with custom header */
    (header: string): FieldColumnDef<K & string>;
    /** Column with full configuration */
    (config: ColumnConfig<TEntity, K, FieldValueType<TEntity, K>>): FieldColumnDef<K & string>;
  };
} & {
  /**
   * Create a computed column from multiple fields
   * @template TFields - The fields to use
   */
  computed: <const TFields extends readonly TFieldKey[]>(
    config: ComputedColumnConfig<TEntity, TFields>
  ) => ComputedColumnDef<{ [I in keyof TFields]: TFields[I] & string }>;
};

/**
 * Any column def that can be returned by the builder
 */
export type AnyColumnDef<TFieldKey extends string = string> =
  | FieldColumnDef<TFieldKey>
  | ComputedColumnDef<readonly TFieldKey[]>;

/**
 * Column definition function type (passed to options.columns)
 * The return type is generic to capture the specific column defs
 * @template TEntity - The entity type
 * @template TFieldKey - The field key type
 * @template TColumns - The column definitions array type (inferred)
 */
export type ColumnDefinitionFn<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[] = AnyColumnDef<TFieldKey & string>[],
> = (col: ColumnBuilder<TEntity, TFieldKey>) => TColumns;

// ============================================================================
// Fetch and Query Builder Types
// ============================================================================

/**
 * Request options passed to fetch functions for cancellation support
 * Compatible with SDK's RequestOptions interface
 */
export interface FetchRequestOptions {
  /** AbortSignal for request cancellation (from TanStack Query) */
  signal?: AbortSignal;
}

/**
 * Function that fetches paginated data with selected fields
 * @template TRow - The row type (entity with only selected fields)
 * @template TQueryOptions - The query options type for the SDK method
 *
 * @example
 * ```typescript
 * // Basic usage (signal is optional)
 * fetch: (options) => client.customers.getCustomers(options)
 *
 * // With cancellation support
 * fetch: (options, requestOptions) =>
 *   client.customers.getCustomers({ ...options, ...requestOptions })
 * ```
 */
export type FetchFn<TRow, TQueryOptions> = (
  options: TQueryOptions,
  requestOptions?: FetchRequestOptions
) => Promise<InsurUpGraphQLResult<Connection<TRow>>>;

/**
 * Parameters passed to the query options builder
 * @template TEntity - The entity type
 * @template TSortInput - The SDK sort input type (e.g., QueryCustomerModelSortInput)
 * @template TFilterInput - The SDK filter input type (e.g., QueryCustomerModelFilterInput)
 * @template TSearchInput - The SDK search input type (e.g., QueryCustomerModelSearchInput)
 */
export interface QueryOptionsBuilderArgs<
  TEntity,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
> {
  /** Number of items to fetch */
  first: number;
  /** Cursor for pagination */
  after: string | undefined;
  /** Sort configuration using SDK's sort input type */
  order: TSortInput[] | undefined;
  /** Fields to select */
  select: DeepFieldKeys<TEntity>[];
  /** Filter criteria using SDK's filter input type */
  filter: TFilterInput | undefined;
  /** Search criteria using SDK's search input type */
  search: TSearchInput | undefined;
}

/**
 * Function that builds query options from params
 * @template TEntity - The entity type
 * @template TQueryOptions - The query options type for the SDK method
 * @template TSortInput - The SDK sort input type (e.g., QueryCustomerModelSortInput)
 * @template TFilterInput - The SDK filter input type (e.g., QueryCustomerModelFilterInput)
 * @template TSearchInput - The SDK search input type (e.g., QueryCustomerModelSearchInput)
 */
export type QueryOptionsBuilder<
  TEntity,
  TQueryOptions,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
> = (
  params: QueryOptionsBuilderArgs<TEntity, TSortInput, TFilterInput, TSearchInput>
) => TQueryOptions;

// ============================================================================
// Table Adapter Options (Builder-Based)
// ============================================================================

/**
 * Base options shared by all table adapters (builder-based)
 * @template TEntity - The entity type
 * @template TFieldKey - The field key type
 * @template TColumns - The column definitions (for field extraction)
 * @template TRow - The row type (inferred from columns)
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 */
export interface TableAdapterOptionsBase<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TFilterInput = unknown,
  TSearchInput = unknown,
> extends ErrorCallbacks<TRow> {
  /** Column definitions using builder function */
  columns: (col: ColumnBuilder<TEntity, TFieldKey>) => TColumns;
  /** Number of items per page (default: 20) */
  pageSize?: number;
  /** Default sorting state */
  defaultSort?: Array<{ id: string; desc: boolean }>;
  /** Default filter criteria */
  defaultFilter?: TFilterInput;
  /** Default search criteria */
  defaultSearch?: TSearchInput;
  /** Time until data is considered stale (ms, default: 30000) */
  staleTime?: number;
  /** Time until inactive data is garbage collected (ms, default: 300000) */
  gcTime?: number;
  /**
   * Optional TanStack Table options to pass through.
   * Use this for client-side features like row selection, column visibility,
   * column pinning, etc. These options are merged into getTableOptions() output.
   *
   * @example
   * ```typescript
   * tableOptions: {
   *   enableRowSelection: true,
   *   enableMultiRowSelection: true,
   *   getRowId: (row) => row.id,
   * }
   * ```
   */
  tableOptions?: Partial<Omit<TableOptionsResolved<TRow>, 'data' | 'columns' | 'getCoreRowModel'>>;
  /**
   * Automatically fetch data when the table is created.
   * When true, the initial fetch is triggered immediately on construction.
   * @default false
   */
  autoFetch?: boolean;
}

/**
 * Options using InsurUp SDK client mode
 */
export interface TableAdapterClientModeOptions<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TFilterInput = unknown,
  TSearchInput = unknown,
> extends TableAdapterOptionsBase<TEntity, TFieldKey, TColumns, TRow, TFilterInput, TSearchInput> {
  /** InsurUp client configuration */
  client: InsurUpClientOptions;
  fetch?: never;
}

/**
 * Options using custom fetch function mode
 */
export interface TableAdapterFetchModeOptions<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TFetchFn = unknown,
  TFilterInput = unknown,
  TSearchInput = unknown,
> extends TableAdapterOptionsBase<TEntity, TFieldKey, TColumns, TRow, TFilterInput, TSearchInput> {
  /** Custom fetch function */
  fetch: TFetchFn;
  client?: never;
}

/**
 * Union of ClientModeOptions and FetchModeOptions
 */
export type TableAdapterOptions<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TFetchFn = unknown,
  TFilterInput = unknown,
  TSearchInput = unknown,
> =
  | TableAdapterClientModeOptions<TEntity, TFieldKey, TColumns, TRow, TFilterInput, TSearchInput>
  | TableAdapterFetchModeOptions<
      TEntity,
      TFieldKey,
      TColumns,
      TRow,
      TFetchFn,
      TFilterInput,
      TSearchInput
    >;

// ============================================================================
// Generic Entity Types (for easy entity creation)
// ============================================================================

/**
 * Extract fields from columns with type narrowing to entity's field keys
 * @template TColumns - The column definitions array
 * @template TFieldKey - The entity's field key type
 */
export type EntityExtractFields<
  TColumns extends readonly AnyColumnDef<string>[],
  TFieldKey extends string,
> = ExtractFieldsFromColumnDefs<TColumns> & TFieldKey;

/**
 * Generic row type using SDK's PickFields
 * Derives the row type from column definitions automatically
 * @template TEntity - The entity model type
 * @template TColumns - The column definitions array
 */
export type EntityRowType<TEntity, TColumns extends readonly AnyColumnDef<string>[]> = PickFields<
  TEntity,
  readonly ExtractFieldsFromColumnDefs<TColumns>[]
>;

/**
 * Generic fetch function type for entities
 * Alias for FetchFn with clearer naming for entity usage
 * @template TRow - The row type (entity with selected fields)
 * @template TQueryOptions - The SDK query options type
 */
export type EntityFetchFn<TRow, TQueryOptions> = FetchFn<TRow, TQueryOptions>;

/**
 * Generic table options for entities
 * Alias for TableAdapterOptions with clearer naming for entity usage
 */
export type EntityTableOptions<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TFetchFn = unknown,
  TFilterInput = unknown,
  TSearchInput = unknown,
> = TableAdapterOptions<TEntity, TFieldKey, TColumns, TRow, TFetchFn, TFilterInput, TSearchInput>;
