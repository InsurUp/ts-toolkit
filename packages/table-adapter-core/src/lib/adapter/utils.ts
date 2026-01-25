/**
 * @fileoverview Adapter Utilities
 * @description Utility functions for the BaseTableAdapter including schema conversion
 */

import type { ColumnDef } from '@tanstack/table-core';
import type { GraphQLErrors, ClientError } from '@insurup/sdk';
import { InsurUpClientErrorType, InsurUpGraphQLErrorCode } from '@insurup/sdk';
import type { InternalColumnDef } from '../types.js';
import type { TableError } from './types.js';

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
export function schemaToInternalColumns<TSchema extends Record<string, unknown>>(
  schema: TSchema
): InternalColumnDef[] {
  const columns: InternalColumnDef[] = [];

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
        render: undefined,
        isComputed: false,
      });
    } else if (isComputedColumn(config)) {
      // Computed column with multiple fields
      columns.push({
        key,
        fields: [...config.uses],
        header: config.header,
        sortable: (config as { sortable?: boolean }).sortable ?? false,
        hideable: (config as { hideable?: boolean }).hideable ?? true,
        render: (_, row) => config.render(row),
        isComputed: true,
      });
    } else if (typeof config === 'object' && config !== null) {
      // Regular column config
      const colConfig = config as {
        header: string;
        sortable?: boolean;
        hideable?: boolean;
        render?: (value: unknown, row: unknown) => unknown;
      };
      columns.push({
        key,
        fields: [key],
        header: colConfig.header,
        sortable: colConfig.sortable ?? false,
        hideable: colConfig.hideable ?? true,
        render: colConfig.render,
        isComputed: false,
      });
    }
  }

  return columns;
}

/**
 * Extract all unique fields from internal column definitions
 * Used to build the GraphQL select query
 */
export function extractFieldsFromInternalColumns(columns: InternalColumnDef[]): string[] {
  const fieldsSet = new Set<string>();
  for (const col of columns) {
    for (const field of col.fields) {
      fieldsSet.add(field);
    }
  }
  return Array.from(fieldsSet);
}

/**
 * Convert internal column definitions to TanStack ColumnDef array
 * @template TRow - The row type
 */
export function internalColumnsToColumnDefs<TRow>(
  columns: InternalColumnDef[]
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
 *
 * @param cause - The SDK error (GraphQL or Client error)
 * @returns Whether the error is retryable
 */
export function isRetryable(cause: GraphQLErrors | ClientError): boolean {
  if (cause.kind === 'client-error') {
    return (
      cause.type === InsurUpClientErrorType.Timeout ||
      cause.type === InsurUpClientErrorType.HttpRequestFailed
    );
  }

  // GraphQL errors - check the error code
  const code = cause.errors[0]?.extensions?.code;
  return (
    code === InsurUpGraphQLErrorCode.InternalError || code === InsurUpGraphQLErrorCode.UpstreamError
  );
}

/**
 * Create a TableError from an SDK error result
 * Wraps GraphQL and Client errors in a standard Error interface
 *
 * @param cause - The SDK error (GraphQL or Client error)
 * @returns A TableError with the original cause and retryable flag
 */
export function createTableError(cause: GraphQLErrors | ClientError): TableError {
  const error = new Error(cause.message) as TableError;
  error.name = 'TableError';
  error.cause = cause;
  error.retryable = isRetryable(cause);
  return error;
}
