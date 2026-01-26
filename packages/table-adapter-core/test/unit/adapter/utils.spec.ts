/**
 * @fileoverview Adapter Utilities Tests
 * @description Unit tests for the adapter utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  schemaToInternalColumns,
  extractFieldsFromInternalColumns,
  internalColumnsToColumnDefs,
  isRetryable,
  createTableError,
} from '../../../src/lib/adapter/utils.js';
import { InsurUpClientErrorType, InsurUpGraphQLErrorCode } from '@insurup/sdk';
import type { GraphQLErrors, ClientError } from '@insurup/sdk';
import type { InternalColumnDef } from '../../../src/lib/types.js';

describe('schemaToInternalColumns', () => {
  it('should convert simple header string', () => {
    const schema = { name: 'Name' };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: 'name',
      fields: ['name'],
      header: 'Name',
      sortable: false,
      hideable: true,
      isComputed: false,
    });
  });

  it('should convert full config object', () => {
    const schema = {
      name: {
        header: 'Customer Name',
        sortable: true,
        hideable: false,
      },
    };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: 'name',
      fields: ['name'],
      header: 'Customer Name',
      sortable: true,
      hideable: false,
      isComputed: false,
    });
  });

  it('should convert config object with render function', () => {
    const renderFn = (value: unknown) => String(value).toUpperCase();
    const schema = {
      name: {
        header: 'Name',
        render: renderFn,
      },
    };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(1);
    expect(result[0].render).toBeDefined();
  });

  it('should convert computed columns with uses array', () => {
    const schema = {
      location: {
        uses: ['cityText', 'districtText'],
        header: 'Location',
        render: (row: { cityText: string; districtText: string }) =>
          `${row.cityText}, ${row.districtText}`,
      },
    };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: 'location',
      fields: ['cityText', 'districtText'],
      header: 'Location',
      isComputed: true,
    });
  });

  it('should skip undefined values', () => {
    const schema = {
      name: 'Name',
      email: undefined,
      type: 'Type',
    };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.key)).toEqual(['name', 'type']);
  });

  it('should convert multiple columns', () => {
    const schema = {
      id: 'ID',
      name: { header: 'Name', sortable: true },
      email: 'Email',
    };
    const result = schemaToInternalColumns(schema);

    expect(result).toHaveLength(3);
    expect(result[0].key).toBe('id');
    expect(result[1].key).toBe('name');
    expect(result[2].key).toBe('email');
  });

  it('should use default sortable and hideable values', () => {
    const schema = { name: { header: 'Name' } };
    const result = schemaToInternalColumns(schema);

    expect(result[0].sortable).toBe(false);
    expect(result[0].hideable).toBe(true);
  });
});

describe('extractFieldsFromInternalColumns', () => {
  it('should extract fields from simple columns', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'id',
        fields: ['id'],
        header: 'ID',
        sortable: false,
        hideable: true,
        isComputed: false,
      },
      {
        key: 'name',
        fields: ['name'],
        header: 'Name',
        sortable: false,
        hideable: true,
        isComputed: false,
      },
    ];

    const result = extractFieldsFromInternalColumns(columns);
    expect(result).toEqual(['id', 'name']);
  });

  it('should extract fields from computed columns', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'location',
        fields: ['cityText', 'districtText'],
        header: 'Location',
        sortable: false,
        hideable: true,
        isComputed: true,
      },
    ];

    const result = extractFieldsFromInternalColumns(columns);
    expect(result).toEqual(['cityText', 'districtText']);
  });

  it('should deduplicate fields', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'name',
        fields: ['name'],
        header: 'Name',
        sortable: false,
        hideable: true,
        isComputed: false,
      },
      {
        key: 'computed',
        fields: ['name', 'email'],
        header: 'Computed',
        sortable: false,
        hideable: true,
        isComputed: true,
      },
    ];

    const result = extractFieldsFromInternalColumns(columns);
    expect(result).toEqual(['name', 'email']);
  });

  it('should return empty array for empty columns', () => {
    const result = extractFieldsFromInternalColumns([]);
    expect(result).toEqual([]);
  });
});

describe('internalColumnsToColumnDefs', () => {
  it('should create TanStack ColumnDef with correct properties', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'name',
        fields: ['name'],
        header: 'Name',
        sortable: true,
        hideable: false,
        isComputed: false,
      },
    ];

    const result = internalColumnsToColumnDefs(columns);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableHiding: false,
    });
  });

  it('should use accessorFn for computed columns', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'location',
        fields: ['cityText', 'districtText'],
        header: 'Location',
        sortable: false,
        hideable: true,
        isComputed: true,
      },
    ];

    const result = internalColumnsToColumnDefs(columns);

    expect(result[0].accessorKey).toBeUndefined();
    expect(result[0].accessorFn).toBeDefined();

    // Test accessorFn returns the row
    const row = { cityText: 'City', districtText: 'District' };
    expect(result[0].accessorFn!(row, 0)).toBe(row);
  });

  it('should wrap cell renderer for regular columns', () => {
    const renderFn = vi.fn((value: unknown) => String(value).toUpperCase());
    const columns: InternalColumnDef[] = [
      {
        key: 'name',
        fields: ['name'],
        header: 'Name',
        sortable: false,
        hideable: true,
        render: renderFn,
        isComputed: false,
      },
    ];

    const result = internalColumnsToColumnDefs(columns);

    expect(result[0].cell).toBeDefined();
  });

  it('should wrap cell renderer for computed columns', () => {
    const renderFn = vi.fn(
      (_: unknown, row: { cityText: string }) => `Location: ${row.cityText}`
    );
    const columns: InternalColumnDef[] = [
      {
        key: 'location',
        fields: ['cityText'],
        header: 'Location',
        sortable: false,
        hideable: true,
        render: renderFn,
        isComputed: true,
      },
    ];

    const result = internalColumnsToColumnDefs(columns);

    expect(result[0].cell).toBeDefined();
  });

  it('should not add cell property when no render function', () => {
    const columns: InternalColumnDef[] = [
      {
        key: 'name',
        fields: ['name'],
        header: 'Name',
        sortable: false,
        hideable: true,
        isComputed: false,
      },
    ];

    const result = internalColumnsToColumnDefs(columns);

    expect(result[0].cell).toBeUndefined();
  });
});

describe('isRetryable', () => {
  describe('client errors', () => {
    it('should return true for Timeout errors', () => {
      const error: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Timeout',
        type: InsurUpClientErrorType.Timeout,
      };

      expect(isRetryable(error)).toBe(true);
    });

    it('should return true for HttpRequestFailed errors', () => {
      const error: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Network error',
        type: InsurUpClientErrorType.HttpRequestFailed,
      };

      expect(isRetryable(error)).toBe(true);
    });

    it('should return false for Unknown client errors', () => {
      const error: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Unknown error',
        type: InsurUpClientErrorType.Unknown,
      };

      expect(isRetryable(error)).toBe(false);
    });

    it('should return false for JsonDeserialization errors', () => {
      const error: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Parse error',
        type: InsurUpClientErrorType.JsonDeserialization,
      };

      expect(isRetryable(error)).toBe(false);
    });
  });

  describe('GraphQL errors', () => {
    it('should return true for InternalError', () => {
      const error: GraphQLErrors = {
        kind: 'graphql-error',
        isSuccess: false,
        message: 'Internal server error',
        errors: [
          {
            message: 'Internal error',
            extensions: { code: InsurUpGraphQLErrorCode.InternalError },
          },
        ],
      };

      expect(isRetryable(error)).toBe(true);
    });

    it('should return true for UpstreamError', () => {
      const error: GraphQLErrors = {
        kind: 'graphql-error',
        isSuccess: false,
        message: 'Upstream service error',
        errors: [
          {
            message: 'Upstream error',
            extensions: { code: InsurUpGraphQLErrorCode.UpstreamError },
          },
        ],
      };

      expect(isRetryable(error)).toBe(true);
    });

    it('should return false for ValidationFailed', () => {
      const error: GraphQLErrors = {
        kind: 'graphql-error',
        isSuccess: false,
        message: 'Validation failed',
        errors: [
          {
            message: 'Invalid input',
            extensions: { code: InsurUpGraphQLErrorCode.ValidationFailed },
          },
        ],
      };

      expect(isRetryable(error)).toBe(false);
    });

    it('should return false for Unknown GraphQL errors', () => {
      const error: GraphQLErrors = {
        kind: 'graphql-error',
        isSuccess: false,
        message: 'Unknown error',
        errors: [
          {
            message: 'Unknown',
            extensions: { code: InsurUpGraphQLErrorCode.Unknown },
          },
        ],
      };

      expect(isRetryable(error)).toBe(false);
    });
  });
});

describe('createTableError', () => {
  it('should create Error with correct message', () => {
    const cause: ClientError = {
      kind: 'client-error',
      isSuccess: false,
      message: 'Test error message',
      type: InsurUpClientErrorType.Unknown,
    };

    const result = createTableError(cause);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Test error message');
  });

  it('should set name to TableError', () => {
    const cause: ClientError = {
      kind: 'client-error',
      isSuccess: false,
      message: 'Error',
      type: InsurUpClientErrorType.Unknown,
    };

    const result = createTableError(cause);

    expect(result.name).toBe('TableError');
  });

  it('should preserve cause property', () => {
    const cause: ClientError = {
      kind: 'client-error',
      isSuccess: false,
      message: 'Error',
      type: InsurUpClientErrorType.Timeout,
    };

    const result = createTableError(cause);

    expect(result.cause).toBe(cause);
  });

  it('should set retryable to true for retryable errors', () => {
    const cause: ClientError = {
      kind: 'client-error',
      isSuccess: false,
      message: 'Timeout',
      type: InsurUpClientErrorType.Timeout,
    };

    const result = createTableError(cause);

    expect(result.retryable).toBe(true);
  });

  it('should set retryable to false for non-retryable errors', () => {
    const cause: ClientError = {
      kind: 'client-error',
      isSuccess: false,
      message: 'Parse error',
      type: InsurUpClientErrorType.JsonDeserialization,
    };

    const result = createTableError(cause);

    expect(result.retryable).toBe(false);
  });

  it('should work with GraphQL errors', () => {
    const cause: GraphQLErrors = {
      kind: 'graphql-error',
      isSuccess: false,
      message: 'GraphQL error',
      errors: [
        {
          message: 'Internal error',
          extensions: { code: InsurUpGraphQLErrorCode.InternalError },
        },
      ],
    };

    const result = createTableError(cause);

    expect(result.message).toBe('GraphQL error');
    expect(result.cause).toBe(cause);
    expect(result.retryable).toBe(true);
  });
});
