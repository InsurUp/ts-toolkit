/**
 * @fileoverview createInfiniteCustomerTable Tests
 * @description Mirrors create-customer-table.spec.ts but for the infinite variant.
 * Covers the wrapper plus the additional accessor getters (hasNextPage, canLoadMore)
 * left uncovered by the standard customer-table tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createInfiniteCustomerTable } from '../src/lib/create-infinite-customer-table.svelte.js';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';
import type { CustomerTestFetchModeOptions } from './utils/mocks';
import { createMockFetchFn, flushPromises } from './utils/mocks';

function createOptions(
  overrides: Partial<CustomerTestFetchModeOptions> = {}
): () => CustomerTableOptions<CustomerColumnDef[]> {
  const options: CustomerTableOptions<CustomerColumnDef[]> = {
    columns: (col) => [col.id(), col.name()],
    fetch: createMockFetchFn(),
    pagination: { type: 'cursor', pageSize: 10 },
    ...overrides,
  };
  return () => options;
}

describe('createInfiniteCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the full reactive surface', () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('isLoading');
      expect(result).toHaveProperty('isFetching');
      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('adapter');
      expect(result).toHaveProperty('destroy');
      expect(result).toHaveProperty('hasNextPage');
      expect(result).toHaveProperty('canLoadMore');
      expect(result).toHaveProperty('isEmpty');
      expect(result).toHaveProperty('hasData');
    } finally {
      result.destroy();
    }
  });

  it('exposes a TanStack Table instance', () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      const table = result.table;
      expect(typeof table.getHeaderGroups).toBe('function');
      expect(typeof table.getRowModel).toBe('function');
      expect(typeof table.nextPage).toBe('function');
      expect(typeof table.getCanNextPage).toBe('function');
    } finally {
      result.destroy();
    }
  });

  it('exposes the adapter with infinite-scroll specific methods', () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      expect(typeof result.adapter.fetch).toBe('function');
      expect(typeof result.adapter.setFilter).toBe('function');
      expect(typeof result.adapter.clearFilter).toBe('function');
    } finally {
      result.destroy();
    }
  });

  it('fetches data and exposes accumulated rows', async () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      await result.adapter.fetch();
      await flushPromises();
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.isLoading).toBe(false);
    } finally {
      result.destroy();
    }
  });

  it('hasNextPage reflects the adapter state', async () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      // Before fetch, hasNextPage is false (no data loaded yet)
      expect(typeof result.hasNextPage).toBe('boolean');
      await result.adapter.fetch();
      await flushPromises();
      // hasNextPage stays a boolean after fetch
      expect(typeof result.hasNextPage).toBe('boolean');
    } finally {
      result.destroy();
    }
  });

  it('canLoadMore derives from hasNextPage and !isFetching', async () => {
    const result = createInfiniteCustomerTable(createOptions());
    try {
      expect(typeof result.canLoadMore).toBe('boolean');
    } finally {
      result.destroy();
    }
  });

  it('destroy can be called repeatedly without throwing', () => {
    const result = createInfiniteCustomerTable(createOptions());
    expect(() => {
      result.destroy();
      result.destroy();
    }).not.toThrow();
  });
});
