/**
 * @fileoverview Test Mocks for React Table Adapter
 * @description Mock implementations for testing the React hook
 */

import { vi, type Mock } from 'vitest';
import type { InsurUpGraphQLResult, Connection, PageInfo } from '@insurup/sdk';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';

export type CustomerTestFetchModeOptions = Extract<
  CustomerTableOptions<CustomerColumnDef[]>,
  { fetch: (...args: never[]) => unknown }
>;
type CustomerTestFetchFn = CustomerTestFetchModeOptions['fetch'];

// ============================================================================
// Mock Types
// ============================================================================

export interface MockCustomer {
  id: string;
  name: string;
  email?: string;
}

// ============================================================================
// Mock Data Factories
// ============================================================================

export function createMockPageInfo(overrides: Partial<PageInfo> = {}): PageInfo {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
    ...overrides,
  };
}

export function createMockConnection<T>(
  nodes: T[],
  pageInfo: Partial<PageInfo> = {},
  totalCount?: number
): Connection<T> {
  return {
    nodes,
    pageInfo: createMockPageInfo(pageInfo),
    totalCount: totalCount ?? nodes.length,
    edges: nodes.map((node, index) => ({
      node,
      cursor: `cursor-${index}`,
    })),
  };
}

export function createSuccessResult<T>(data: T): InsurUpGraphQLResult<T> {
  return {
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  } as InsurUpGraphQLResult<T>;
}

// ============================================================================
// Mock Fetch Function
// ============================================================================

export function createMockFetchFn(data?: Connection<MockCustomer>): Mock<CustomerTestFetchFn> {
  const defaultData = createMockConnection<MockCustomer>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ]);
  return vi
    .fn()
    .mockResolvedValue(createSuccessResult(data ?? defaultData)) as Mock<CustomerTestFetchFn>;
}

// ============================================================================
// Mock Options Factory
// ============================================================================

export function createMockOptions(
  overrides: Partial<CustomerTestFetchModeOptions> = {}
): CustomerTableOptions<CustomerColumnDef[]> {
  return {
    columns: (col) => [col.id(), col.name()],
    fetch: createMockFetchFn(),
    pagination: { type: 'cursor', pageSize: 10 },
    ...overrides,
  };
}
