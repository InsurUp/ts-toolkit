/**
 * @fileoverview Test Mocks
 * @description Mock implementations for testing the table adapter
 */

import type { InsurUpGraphQLResult, Connection, PageInfo } from '@insurup/sdk';
import { InsurUpClientErrorType, InsurUpGraphQLErrorCode } from '@insurup/sdk';
import type { InternalColumnDef } from '../../src/lib/types.js';

// ============================================================================
// Mock Types
// ============================================================================

/** Mock entity type for testing */
export interface MockEntity {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
  cityText?: string;
  districtText?: string;
}

/** Mock sort input type */
export interface MockSortInput {
  id?: 'ASC' | 'DESC';
  name?: 'ASC' | 'DESC';
  email?: 'ASC' | 'DESC';
  type?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
}

/** Mock filter input type */
export interface MockFilterInput {
  name?: { contains?: string; eq?: string };
  type?: { eq?: string };
  status?: { eq?: string };
}

/** Mock search input type */
export interface MockSearchInput {
  query?: string;
  fields?: string[];
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Create a mock entity
 */
export function createMockEntity(overrides: Partial<MockEntity> = {}): MockEntity {
  return {
    id: 'MOCK-001',
    name: 'Test Entity',
    email: 'test@example.com',
    type: 'Individual',
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create an array of mock entities
 */
export function createMockEntities(count: number): MockEntity[] {
  return Array.from({ length: count }, (_, i) =>
    createMockEntity({
      id: `MOCK-${String(i + 1).padStart(3, '0')}`,
      name: `Test Entity ${i + 1}`,
      email: `test${i + 1}@example.com`,
    })
  );
}

/**
 * Create a mock PageInfo
 */
export function createMockPageInfo(overrides: Partial<PageInfo> = {}): PageInfo {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
    ...overrides,
  };
}

/**
 * Create a mock Connection response
 */
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

/**
 * Create a successful GraphQL result
 */
export function createSuccessResult<T>(data: T): InsurUpGraphQLResult<T> {
  return {
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  };
}

/**
 * Create a client error result
 */
export function createClientError(
  type: InsurUpClientErrorType = InsurUpClientErrorType.Unknown,
  message = 'Client error'
): InsurUpGraphQLResult<never> {
  return {
    kind: 'client-error',
    isSuccess: false,
    message,
    type,
  };
}

/**
 * Create a GraphQL error result
 */
export function createGraphQLError(
  code: InsurUpGraphQLErrorCode = InsurUpGraphQLErrorCode.Unknown,
  message = 'GraphQL error'
): InsurUpGraphQLResult<never> {
  return {
    kind: 'graphql-error',
    isSuccess: false,
    message,
    errors: [
      {
        message,
        extensions: {
          code,
        },
      },
    ],
  };
}

// ============================================================================
// Mock Column Definitions
// ============================================================================

/**
 * Create mock internal column definitions
 */
export function createMockColumns(): InternalColumnDef[] {
  return [
    {
      key: 'id',
      fields: ['id'],
      header: 'ID',
      sortable: true,
      hideable: false,
      render: undefined,
      isComputed: false,
    },
    {
      key: 'name',
      fields: ['name'],
      header: 'Name',
      sortable: true,
      hideable: true,
      render: undefined,
      isComputed: false,
    },
    {
      key: 'email',
      fields: ['email'],
      header: 'Email',
      sortable: false,
      hideable: true,
      render: (value) => String(value).toLowerCase(),
      isComputed: false,
    },
  ];
}

/**
 * Create mock internal column definitions with computed column
 */
export function createMockColumnsWithComputed(): InternalColumnDef[] {
  return [
    ...createMockColumns(),
    {
      key: 'location',
      fields: ['cityText', 'districtText'],
      header: 'Location',
      sortable: false,
      hideable: true,
      render: (_, row) => {
        const entity = row as MockEntity;
        return `${entity.cityText}, ${entity.districtText}`;
      },
      isComputed: true,
    },
  ];
}

// ============================================================================
// Mock Fetch Function
// ============================================================================

/**
 * Create a mock fetch function that returns successful results
 */
export function createMockFetchFn<TRow = MockEntity>(
  responseData?: Connection<TRow>
): jest.Mock<Promise<InsurUpGraphQLResult<Connection<TRow>>>> {
  const defaultData = createMockConnection(createMockEntities(10) as TRow[]);
  const mockFn = vi.fn().mockResolvedValue(createSuccessResult(responseData ?? defaultData));
  return mockFn;
}

/**
 * Create a mock fetch function that returns an error
 */
export function createMockErrorFetchFn(
  error: InsurUpGraphQLResult<never> = createClientError()
): jest.Mock<Promise<InsurUpGraphQLResult<never>>> {
  return vi.fn().mockResolvedValue(error);
}

// ============================================================================
// Mock Sorting Converters
// ============================================================================

import { createSortingConverters } from '../../src/lib/sorting/converters.js';

export const mockSortingConverters = createSortingConverters<MockSortInput>();
