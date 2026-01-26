/**
 * @fileoverview Test Mocks for Vue Table Adapter
 * @description Mock implementations for testing the Vue composable
 */

import type { InsurUpGraphQLResult, Connection, PageInfo } from '@insurup/sdk';

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
  };
}

// ============================================================================
// Mock Fetch Function
// ============================================================================

export function createMockFetchFn(
  data?: Connection<MockCustomer>
): ReturnType<typeof vi.fn> {
  const defaultData = createMockConnection<MockCustomer>([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ]);

  return vi.fn().mockResolvedValue(createSuccessResult(data ?? defaultData));
}

// ============================================================================
// Mock Options Factory
// ============================================================================

export function createMockOptions(overrides: Record<string, unknown> = {}) {
  return {
    columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
    fetch: createMockFetchFn(),
    pageSize: 10,
    ...overrides,
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
