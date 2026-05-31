/**
 * @fileoverview File Policy Transfer Table Integration Tests
 * @description Smoke tests for the createFilePolicyTransferTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFilePolicyTransferTable } from '../../src/entities/file-policy-transfer/factory.js';
import type {
  Connection,
  InsurUpGraphQLResult,
  FilePolicyTransferFieldKey,
  GetFilePolicyTransfersOptions,
} from '@insurup/sdk';
import { FilePolicyTransferSourceType } from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  FilePolicyTransferFetchFn,
  FilePolicyTransferRowType,
  FilePolicyTransferColumnDef,
} from '../../src/entities/file-policy-transfer/types.js';

// ============================================================================
// Types
// ============================================================================

type FullFilePolicyTransferRow = FilePolicyTransferRowType<FilePolicyTransferColumnDef[]>;
type ExpectedFetchFn = FilePolicyTransferFetchFn<
  FullFilePolicyTransferRow,
  FilePolicyTransferFieldKey[]
>;

// ============================================================================
// Mock data
// ============================================================================

function createMockFilePolicyTransfer(
  overrides: Partial<FullFilePolicyTransferRow> = {}
): FullFilePolicyTransferRow {
  return {
    id: 'FPT-001',
    sourceType: FilePolicyTransferSourceType.InsuranceCompany,
    insuranceCompanyId: 1,
    insuranceCompanyName: 'Acme Insurance',
    insuranceCompanyLogo: null,
    fileName: 'transfers.csv',
    createdAt: '2024-01-01T00:00:00Z',
    createdByName: 'Test User',
    totalPolicyCount: 10,
    succeededPolicyCount: 7,
    failedPolicyCount: 1,
    skippedPolicyCount: 2,
    ...overrides,
  } as FullFilePolicyTransferRow;
}

function createFilePolicyTransferConnection(
  rows: FullFilePolicyTransferRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullFilePolicyTransferRow> {
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

function createFilePolicyTransferFetchMock(
  response: InsurUpGraphQLResult<Connection<FullFilePolicyTransferRow>>
): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetFilePolicyTransfersOptions<FilePolicyTransferFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullFilePolicyTransferRow>>>
    >()
    .mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createFilePolicyTransferTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createFilePolicyTransferFetchMock(
      createSuccessResult(
        createFilePolicyTransferConnection([
          createMockFilePolicyTransfer({ id: 'FPT-001', fileName: 'a.csv' }),
          createMockFilePolicyTransfer({ id: 'FPT-002', fileName: 'b.csv' }),
        ])
      )
    );
  });

  it('should create a table with column builder', () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName('File')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(2);

    table.destroy();
  });

  it('should select fields based on column definitions', async () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName(), col.createdAt()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'fileName', 'createdAt']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should fetch and populate rows', async () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName()],
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

  it('should apply default filter on fetch', async () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { fileName: { contains: 'transfer' } },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { fileName: { contains: 'transfer' } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should set filter and refetch', async () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ insuranceCompanyId: { eq: 1 } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { insuranceCompanyId: { eq: 1 } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should clear filter and refetch', async () => {
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { fileName: { contains: 'csv' } },
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
