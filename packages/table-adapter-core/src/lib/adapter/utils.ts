/**
 * @fileoverview Adapter Utilities
 * @description Utility functions for the BaseTableAdapter including schema conversion
 */

import type { ColumnDef } from '@tanstack/table-core';
import type { ClientError, GraphQLErrors, ServerError } from '@insurup/sdk';
import { InsurUpClientErrorType, InsurUpGraphQLErrorCode } from '@insurup/sdk';
import type { AnyColumnDef } from '../types.js';
import type { TableError } from './types.js';

/**
 * Base column definition shape - used for internal processing
 * All column types (FieldColumnDef, ComputedColumnDef) extend this shape
 */
interface BaseColumnShape {
  key: string;
  fields: string[];
  header: string;
  sortable: boolean;
  hideable: boolean;
  hiddenByDefault: boolean;
  render?: (value: unknown, row: unknown) => unknown;
  isComputed: boolean;
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

// ============================================================================
// Schema Conversion Utilities
// ============================================================================

/**
 * Check if a column config is a computed column (has 'uses' property)
 */
function isComputedColumn(
  config: unknown
): config is { uses: readonly string[]; header: string; render: (row: unknown) => unknown } {
  return (
    typeof config === 'object' &&
    config !== null &&
    'uses' in config &&
    Array.isArray((config as { uses: unknown }).uses)
  );
}

/**
 * Check if a column config is a simple header string
 */
function isHeaderString(config: unknown): config is string {
  return typeof config === 'string';
}

/**
 * Convert a column schema to internal column definitions
 * @param schema - The column schema object
 * @returns Array of internal column definitions
 */
export function schemaToColumnDefs<TSchema extends Record<string, unknown>>(
  schema: TSchema
): AnyColumnDef<string>[] {
  const columns: BaseColumnShape[] = [];

  for (const [key, config] of Object.entries(schema)) {
    if (config === undefined) continue;

    if (isHeaderString(config)) {
      // Simple string header
      columns.push({
        key,
        fields: [key],
        header: config,
        sortable: false,
        hideable: true,
        hiddenByDefault: false,
        render: undefined,
        isComputed: false,
      });
    } else if (isComputedColumn(config)) {
      // Computed column with multiple fields
      const computedConfig = config as {
        uses: readonly string[];
        header: string;
        sortable?: boolean;
        hideable?: boolean;
        hiddenByDefault?: boolean;
        render: (row: unknown) => unknown;
        // TanStack Table options
        size?: number;
        minSize?: number;
        maxSize?: number;
        enableResizing?: boolean;
        sortDescFirst?: boolean;
        enablePinning?: boolean;
        meta?: Record<string, unknown>;
        footer?: string;
      };
      columns.push({
        key,
        fields: [...computedConfig.uses],
        header: computedConfig.header,
        sortable: computedConfig.sortable ?? false,
        hideable: computedConfig.hideable ?? true,
        hiddenByDefault: computedConfig.hiddenByDefault ?? false,
        render: (_, row) => computedConfig.render(row),
        isComputed: true,
        // TanStack Table options
        size: computedConfig.size,
        minSize: computedConfig.minSize,
        maxSize: computedConfig.maxSize,
        enableResizing: computedConfig.enableResizing,
        sortDescFirst: computedConfig.sortDescFirst,
        enablePinning: computedConfig.enablePinning,
        meta: computedConfig.meta,
        footer: computedConfig.footer,
      });
    } else if (typeof config === 'object' && config !== null) {
      // Regular column config
      const colConfig = config as {
        header: string;
        sortable?: boolean;
        hideable?: boolean;
        hiddenByDefault?: boolean;
        render?: (value: unknown, row: unknown) => unknown;
        // TanStack Table options
        size?: number;
        minSize?: number;
        maxSize?: number;
        enableResizing?: boolean;
        sortDescFirst?: boolean;
        enablePinning?: boolean;
        meta?: Record<string, unknown>;
        footer?: string;
      };
      columns.push({
        key,
        fields: [key],
        header: colConfig.header,
        sortable: colConfig.sortable ?? false,
        hideable: colConfig.hideable ?? true,
        hiddenByDefault: colConfig.hiddenByDefault ?? false,
        render: colConfig.render,
        isComputed: false,
        // TanStack Table options
        size: colConfig.size,
        minSize: colConfig.minSize,
        maxSize: colConfig.maxSize,
        enableResizing: colConfig.enableResizing,
        sortDescFirst: colConfig.sortDescFirst,
        enablePinning: colConfig.enablePinning,
        meta: colConfig.meta,
        footer: colConfig.footer,
      });
    }
  }

  // Cast to AnyColumnDef - at runtime these objects satisfy the shape
  return columns as unknown as AnyColumnDef<string>[];
}

/**
 * Extract all unique fields from column definitions
 * Used to build the GraphQL select query
 */
export function extractFieldsFromColumns(columns: AnyColumnDef<string>[]): string[] {
  const fieldsSet = new Set<string>();
  for (const col of columns) {
    for (const field of col.fields) {
      fieldsSet.add(field);
    }
  }
  return Array.from(fieldsSet);
}

/**
 * Convert column definitions to TanStack ColumnDef array
 * @template TRow - The row type
 */
export function columnsToTanStackColumnDefs<TRow>(
  columns: AnyColumnDef<string>[]
): ColumnDef<TRow, unknown>[] {
  return columns.map((col) => {
    const columnDef: ColumnDef<TRow, unknown> = {
      id: col.key,
      accessorKey: col.isComputed ? undefined : col.key,
      // For computed columns, pass the whole row
      accessorFn: col.isComputed ? (row: TRow) => row : undefined,
      header: col.header,
      enableSorting: col.sortable,
      enableHiding: col.hideable,
      // TanStack Table column options - pass through if defined
      ...(col.size !== undefined && { size: col.size }),
      ...(col.minSize !== undefined && { minSize: col.minSize }),
      ...(col.maxSize !== undefined && { maxSize: col.maxSize }),
      ...(col.enableResizing !== undefined && { enableResizing: col.enableResizing }),
      ...(col.sortDescFirst !== undefined && { sortDescFirst: col.sortDescFirst }),
      ...(col.enablePinning !== undefined && { enablePinning: col.enablePinning }),
      ...(col.meta !== undefined && { meta: col.meta }),
      ...(col.footer !== undefined && { footer: col.footer }),
    };

    // Add cell renderer if provided
    if (col.render) {
      columnDef.cell = ({ getValue, row }) => {
        if (col.isComputed) {
          return col.render!(undefined, row.original);
        }
        return col.render!(getValue(), row.original);
      };
    }

    return columnDef;
  });
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Determine if an error is retryable based on its type
 * - Client errors: network timeouts and HTTP request failures are retryable
 * - GraphQL errors: internal server errors and upstream errors are retryable
 * - Server errors: 5xx responses are retryable
 *
 * @param cause - The SDK error (GraphQL, Client, or Server error)
 * @returns Whether the error is retryable
 */
export function isRetryable(cause: GraphQLErrors | ClientError | ServerError): boolean {
  if (cause.kind === 'client-error') {
    return (
      cause.type === InsurUpClientErrorType.Timeout ||
      cause.type === InsurUpClientErrorType.HttpRequestFailed
    );
  }

  if (cause.kind === 'server-error') {
    return cause.status >= 500;
  }

  // GraphQL errors - check the error code
  const code = cause.errors[0]?.extensions?.code;
  return (
    code === InsurUpGraphQLErrorCode.InternalError || code === InsurUpGraphQLErrorCode.UpstreamError
  );
}

/**
 * Create a TableError from an SDK error result
 * Wraps GraphQL, Client, and Server errors in a standard Error interface
 *
 * @param cause - The SDK error (GraphQL, Client, or Server error)
 * @returns A TableError with the original cause and retryable flag
 */
export function createTableError(
  cause: GraphQLErrors | ClientError | ServerError
): TableError {
  const error = new Error(cause.message) as TableError;
  error.name = 'TableError';
  error.cause = cause;
  error.retryable = isRetryable(cause);
  return error;
}
