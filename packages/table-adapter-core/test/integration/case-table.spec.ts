/**
 * @fileoverview Case Table Integration Tests
 * @description Integration tests for the createCaseTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCaseTable } from '../../src/entities/case/factory.js';
import {
  CaseStatus,
  CaseType,
  type Connection,
  type InsurUpGraphQLResult,
  type CaseFieldKey,
  type GetCasesOptions,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type { CaseFetchFn, CaseRowType, CaseColumnDef } from '../../src/entities/case/types.js';

// ============================================================================
// Mock Case Data Types
// ============================================================================

type FullCaseRow = CaseRowType<CaseColumnDef[]>;
type ExpectedFetchFn = CaseFetchFn<FullCaseRow, CaseFieldKey[]>;

// ============================================================================
// Mock Case Data
// ============================================================================

function createMockCase(overrides: Partial<FullCaseRow> = {}): FullCaseRow {
  return {
    id: 'CASE-001',
    ref: 'REF-001',
    type: 'SALE_OPPORTUNITY',
    status: 'OPEN',
    mainState: 'OPEN',
    subState: 'OPEN_INITIAL',
    createdAt: '2024-01-01T00:00:00Z',
    createdByName: 'Agent Smith',
    createdById: 'USER-001',
    policyCount: 0,
    proposalCount: 0,
    customerName: 'John Doe',
    customerId: 'CUST-001',
    ...overrides,
  } as FullCaseRow;
}

function createCaseConnection(
  cases: FullCaseRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullCaseRow> {
  return {
    nodes: cases,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: totalCount ?? cases.length,
    edges: cases.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createCaseFetchMock(
  response: InsurUpGraphQLResult<Connection<FullCaseRow>>
): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetCasesOptions<CaseFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullCaseRow>>>
    >()
    .mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createCaseTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createCaseFetchMock(
      createSuccessResult(
        createCaseConnection([
          createMockCase({ id: 'CASE-001', ref: 'REF-001' }),
          createMockCase({ id: 'CASE-002', ref: 'REF-002' }),
        ])
      )
    );
  });

  it('creates a case table with column builder', () => {
    const table = createCaseTable({
      columns: (col) => [col.id(), col.ref('Reference')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(2);

    table.destroy();
  });

  it('extracts fields from column definitions', async () => {
    const table = createCaseTable({
      columns: (col) => [col.id(), col.ref('Ref'), col.type('Type'), col.status('Status')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'ref', 'type', 'status']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('fetches and populates rows', async () => {
    const table = createCaseTable({
      columns: (col) => [col.id(), col.ref('Ref')],
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

  it('applies default filter and refetches when filter changes', async () => {
    const table = createCaseTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { type: { eq: CaseType.SaleOpportunity } },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { type: { eq: CaseType.SaleOpportunity } },
      }),
      expect.any(Object)
    );

    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ status: { eq: CaseStatus.Open } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { status: { eq: CaseStatus.Open } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('clears filter and refetches', async () => {
    const table = createCaseTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { type: { eq: CaseType.SaleOpportunity } },
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

  it('forwards a $search-marked default filter through to the SDK call', async () => {
    const table = createCaseTable({
      columns: (col) => [col.id(), col.ref()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { ref: { $search: true, textSearch: { value: 'REF-001' } } },
    });

    await table.fetch();

    // The adapter forwards the unified shape to the SDK; the SDK performs
    // the wire-level split internally.
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { ref: { $search: true, textSearch: { value: 'REF-001' } } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });
});
