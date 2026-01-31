/**
 * @fileoverview Factory Utilities Tests
 * @description Unit tests for the factory utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createColumnBuilder,
  getFetchFn,
  createClientFetchFn,
  createTableApi,
} from '../../../src/lib/factory/utils.js';
import { createSortingConverters } from '../../../src/lib/sorting/converters.js';
import type { InsurUpGraphQLResult, Connection } from '@insurup/sdk';
import { InsurUpClientErrorType } from '@insurup/sdk';
import type { AnyColumnDef } from '../../../src/lib/types.js';

// ============================================================================
// Mock Types
// ============================================================================

interface MockEntity {
  id: string;
  name: string;
  email: string;
  cityText?: string;
  districtText?: string;
}

type MockFieldKey = keyof MockEntity;

interface MockSortInput {
  id?: 'ASC' | 'DESC';
  name?: 'ASC' | 'DESC';
}

interface MockQueryOptions {
  first: number;
  after?: string | null;
  order?: MockSortInput[];
  select?: string[];
  filter?: unknown;
  search?: unknown;
}

// ============================================================================
// Test Helpers
// ============================================================================

function createSuccessResult<T>(data: T): InsurUpGraphQLResult<T> {
  return {
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  } as InsurUpGraphQLResult<T>;
}

function createMockConnection(nodes: MockEntity[]): Connection<MockEntity> {
  return {
    nodes,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: nodes.length,
    edges: nodes.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('createColumnBuilder', () => {
  it('should create a column builder with proxy methods', () => {
    const col = createColumnBuilder<MockEntity, MockFieldKey>();

    // Should have methods for each field
    expect(typeof col.id).toBe('function');
    expect(typeof col.name).toBe('function');
    expect(typeof col.email).toBe('function');
    expect(typeof col.computed).toBe('function');
  });

  describe('field methods', () => {
    it('should create field column with no arguments (uses field name as header)', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.id();

      expect(column).toMatchObject({
        key: 'id',
        fields: ['id'],
        header: 'id',
        sortable: false,
        hideable: true,
        isComputed: false,
      });
      expect(column.__field).toBe('id');
    });

    it('should create field column with string header', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.name('Customer Name');

      expect(column).toMatchObject({
        key: 'name',
        fields: ['name'],
        header: 'Customer Name',
        sortable: false,
        hideable: true,
        isComputed: false,
      });
      expect(column.__field).toBe('name');
    });

    it('should create field column with full config object', () => {
      const renderFn = (value: string) => value.toUpperCase();
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.email({
        header: 'Email Address',
        sortable: true,
        hideable: false,
        render: renderFn,
      });

      expect(column).toMatchObject({
        key: 'email',
        fields: ['email'],
        header: 'Email Address',
        sortable: true,
        hideable: false,
        isComputed: false,
      });
      expect(column.render).toBeDefined();
      expect(column.__field).toBe('email');
    });

    it('should use default sortable and hideable values', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.name({ header: 'Name' });

      expect(column.sortable).toBe(false);
      expect(column.hideable).toBe(true);
    });
  });

  describe('computed method', () => {
    it('should create computed column with multiple fields', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.computed({
        uses: ['cityText', 'districtText'] as const,
        header: 'Location',
        render: (row) => `${row.cityText}, ${row.districtText}`,
      });

      expect(column).toMatchObject({
        fields: ['cityText', 'districtText'],
        header: 'Location',
        sortable: false,
        hideable: true,
        isComputed: true,
      });
      expect(column.key).toContain('computed_');
      expect(column.__fields).toEqual(['cityText', 'districtText']);
    });

    it('should allow sortable computed columns', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.computed({
        uses: ['name'] as const,
        header: 'Display Name',
        sortable: true,
        render: (row) => row.name.toUpperCase(),
      });

      expect(column.sortable).toBe(true);
    });

    it('should allow non-hideable computed columns', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();
      const column = col.computed({
        uses: ['id', 'name'] as const,
        header: 'Combined',
        hideable: false,
        render: (row) => `${row.id}: ${row.name}`,
      });

      expect(column.hideable).toBe(false);
    });
  });

  describe('proxy behavior', () => {
    it('should handle any field name dynamically', () => {
      const col = createColumnBuilder<MockEntity, MockFieldKey>();

      // Access any property - proxy should create a function
      const anyFieldFn = (col as Record<string, unknown>)['anyCustomField'];
      expect(typeof anyFieldFn).toBe('function');
    });
  });
});

describe('getFetchFn', () => {
  it('should return custom fetch when provided', () => {
    const customFetch = vi.fn().mockResolvedValue(createSuccessResult(createMockConnection([])));

    const result = getFetchFn({ fetch: customFetch });

    expect(result).toBe(customFetch);
  });

  it('should throw error when neither fetch nor client is provided', () => {
    // Test runtime validation by passing an invalid config through unknown
    const invalidConfig = {} as unknown as Parameters<typeof getFetchFn>[0];
    expect(() => getFetchFn(invalidConfig)).toThrow(
      'Either fetch function or client configuration must be provided'
    );
  });

  it('should throw error when client is provided but no clientMethod', () => {
    // When client is provided without a clientMethod, it should throw
    expect(() =>
      getFetchFn({
        client: { baseUrl: 'https://test.api.com' },
      })
    ).toThrow('Either fetch function or client configuration must be provided');
  });
});

describe('createClientFetchFn', () => {
  it('should wrap successful API call', async () => {
    const mockData = createMockConnection([{ id: '1', name: 'Test', email: 'test@example.com' }]);
    const apiCall = vi.fn().mockResolvedValue(createSuccessResult(mockData));

    const fetchFn = createClientFetchFn(apiCall);
    const result = await fetchFn({ first: 10 });

    expect(apiCall).toHaveBeenCalledWith({ first: 10 }, undefined);
    expect(result.isSuccess).toBe(true);
  });

  it('should catch and wrap errors', async () => {
    const error = new Error('API call failed');
    const apiCall = vi.fn().mockRejectedValue(error);

    const fetchFn = createClientFetchFn(apiCall);
    const result = await fetchFn({ first: 10 });

    expect(result.isSuccess).toBe(false);
    expect(result.kind).toBe('client-error');
    if (result.kind === 'client-error') {
      expect(result.type).toBe(InsurUpClientErrorType.Unknown);
      expect(result.message).toBe('API call failed');
    }
  });

  it('should handle non-Error thrown values', async () => {
    const apiCall = vi.fn().mockRejectedValue('String error');

    const fetchFn = createClientFetchFn(apiCall);
    const result = await fetchFn({ first: 10 });

    expect(result.isSuccess).toBe(false);
    if (result.kind === 'client-error') {
      expect(result.message).toBe('Failed to initialize InsurUp client');
    }
  });

  it('should pass request options to API call', async () => {
    const apiCall = vi.fn().mockResolvedValue(createSuccessResult(createMockConnection([])));
    const signal = new AbortController().signal;

    const fetchFn = createClientFetchFn(apiCall);
    await fetchFn({ first: 10 }, { signal });

    expect(apiCall).toHaveBeenCalledWith({ first: 10 }, { signal });
  });
});

describe('createTableApi', () => {
  const sortingConverters = createSortingConverters<MockSortInput>();

  function createMockFetchFn() {
    return vi.fn().mockResolvedValue(
      createSuccessResult(
        createMockConnection([{ id: '1', name: 'Test', email: 'test@example.com' }])
      )
    );
  }

  function createMockColumns(): AnyColumnDef<keyof MockEntity>[] {
    return [
      {
        key: 'id',
        fields: ['id'],
        header: 'ID',
        sortable: false,
        hideable: true,
        hiddenByDefault: false,
        isComputed: false,
      },
    ] as AnyColumnDef<keyof MockEntity>[];
  }

  it('should create table API with all methods', () => {
    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
    });

    // Check all API methods exist
    expect(api.columns).toBeDefined();
    expect(typeof api.getState).toBe('function');
    expect(typeof api.getTableOptions).toBe('function');
    expect(typeof api.subscribe).toBe('function');
    expect(typeof api.getSnapshot).toBe('function');
    expect(typeof api.getServerSnapshot).toBe('function');
    expect(typeof api.fetch).toBe('function');
    expect(typeof api.invalidate).toBe('function');
    expect(typeof api.refetch).toBe('function');
    expect(typeof api.destroy).toBe('function');
    expect(typeof api.setPageSize).toBe('function');
    expect(typeof api.setFilter).toBe('function');
    expect(typeof api.getFilter).toBe('function');
    expect(typeof api.clearFilter).toBe('function');
    expect(typeof api.setSearch).toBe('function');
    expect(typeof api.getSearch).toBe('function');
    expect(typeof api.clearSearch).toBe('function');

    api.destroy();
  });

  it('should return frozen columns', () => {
    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
    });

    const columns = api.columns;

    // Columns should be frozen
    expect(Object.isFrozen(columns)).toBe(true);
    expect(Object.isFrozen(columns[0])).toBe(true);

    api.destroy();
  });

  it('should return same columns reference on multiple accesses', () => {
    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
    });

    const columns1 = api.columns;
    const columns2 = api.columns;

    expect(columns1).toBe(columns2);

    api.destroy();
  });

  it('should delegate methods to adapter', async () => {
    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
    });

    // Test state methods
    const state = api.getState();
    expect(state).toHaveProperty('rows');
    expect(state).toHaveProperty('isLoading');

    const snapshot = api.getSnapshot();
    expect(snapshot).toEqual(state);

    const serverSnapshot = api.getServerSnapshot();
    expect(serverSnapshot.isLoading).toBe(true);

    // Test subscription
    const listener = vi.fn();
    const unsubscribe = api.subscribe(listener);
    expect(typeof unsubscribe).toBe('function');

    api.destroy();
  });

  it('should pass through error callbacks', async () => {
    const onError = vi.fn();
    const onSuccess = vi.fn();
    const onSettled = vi.fn();

    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
      onError,
      onSuccess,
      onSettled,
    });

    await api.fetch();
    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onSuccess).toHaveBeenCalled();
    expect(onSettled).toHaveBeenCalled();

    api.destroy();
  });

  it('should auto-fetch when autoFetch is true', async () => {
    const fetchFn = createMockFetchFn();
    const api = createTableApi<MockEntity, MockEntity, MockQueryOptions, MockSortInput>({
      fetchFn,
      buildQueryOptions: (params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select,
        filter: params.filter,
        search: params.search,
      }),
      columns: createMockColumns(),
      pagination: { type: 'cursor', pageSize: 10 },
      sortingConverters,
      queryKeyPrefix: 'test',
      autoFetch: true,
    });

    // Wait for auto-fetch
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fetchFn).toHaveBeenCalled();

    api.destroy();
  });
});
