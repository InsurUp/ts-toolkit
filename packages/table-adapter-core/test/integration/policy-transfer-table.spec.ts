/**
 * @fileoverview Policy Transfer Table Integration Tests
 * @description Smoke tests for the createPolicyTransferTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPolicyTransferTable } from '../../src/entities/policy-transfer/factory.js';
import type {
  Connection,
  InsurUpGraphQLResult,
  PolicyTransferFieldKey,
  GetPolicyTransfersOptions,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  PolicyTransferFetchFn,
  PolicyTransferRowType,
  PolicyTransferColumnDef,
} from '../../src/entities/policy-transfer/types.js';

// ============================================================================
// Mock Policy Transfer Data Types
// ============================================================================

type FullPolicyTransferRow = PolicyTransferRowType<PolicyTransferColumnDef[]>;
type ExpectedFetchFn = PolicyTransferFetchFn<FullPolicyTransferRow, PolicyTransferFieldKey[]>;

// ============================================================================
// Mock Policy Transfer Data
// ============================================================================

function createMockPolicyTransfer(
  overrides: Partial<FullPolicyTransferRow> = {}
): FullPolicyTransferRow {
  return {
    id: 'PT-001',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00Z',
    succeededPolicyCount: 42,
    failedPolicyCount: 2,
    skippedPolicyCount: 1,
    ...overrides,
  } as FullPolicyTransferRow;
}

function createPolicyTransferConnection(
  rows: FullPolicyTransferRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullPolicyTransferRow> {
  return {
    nodes: rows,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: totalCount ?? rows.length,
    edges: rows.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createPolicyTransferFetchMock(
  response: InsurUpGraphQLResult<Connection<FullPolicyTransferRow>>
): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetPolicyTransfersOptions<PolicyTransferFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullPolicyTransferRow>>>
    >()
    .mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createPolicyTransferTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createPolicyTransferFetchMock(
      createSuccessResult(
        createPolicyTransferConnection([
          createMockPolicyTransfer({ id: 'PT-001', succeededPolicyCount: 10 }),
          createMockPolicyTransfer({ id: 'PT-002', succeededPolicyCount: 20 }),
        ])
      )
    );
  });

  it('should create a policy transfer table with column builder', () => {
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.startDate('Start')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(2);

    table.destroy();
  });

  it('should extract fields from column definitions', async () => {
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.startDate(), col.succeededPolicyCount()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'startDate', 'succeededPolicyCount']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should fetch and populate rows', async () => {
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.succeededPolicyCount()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    await flushPromises();

    const state = table.getState();
    expect(state.rows).toHaveLength(2);
    expect(state.isSuccess).toBe(true);

    table.destroy();
  });

  it('should set filter and refetch', async () => {
    const table = createPolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ succeededPolicyCount: { eq: 10 } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { succeededPolicyCount: { eq: 10 } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should clear filter and refetch', async () => {
    const table = createPolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { succeededPolicyCount: { gt: 5 } },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.clearFilter();
    await flushPromises();

    expect(table.getFilter()).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: undefined,
      }),
      expect.any(Object)
    );

    table.destroy();
  });
});
