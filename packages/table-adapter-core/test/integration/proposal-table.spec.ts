/**
 * @fileoverview Proposal Table Integration Tests (smoke)
 * @description Verifies wiring of the createProposalTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProposalTable } from '../../src/entities/proposal/factory.js';
import { ProposalState, ProductBranch, Channel, CustomerType } from '@insurup/sdk';
import type {
  Connection,
  InsurUpGraphQLResult,
  ProposalFieldKey,
  GetProposalsOptions,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  ProposalFetchFn,
  ProposalRowType,
  ProposalColumnDef,
} from '../../src/entities/proposal/types.js';

type FullRow = ProposalRowType<ProposalColumnDef[]>;
type ExpectedFetchFn = ProposalFetchFn<FullRow, ProposalFieldKey[]>;

function createMockProposal(overrides: Partial<FullRow> = {}): FullRow {
  return {
    id: 'PROP-001',
    productBranch: ProductBranch.Trafik,
    state: ProposalState.Active,
    insurerCustomerId: 'CUST-INS-001',
    insuredCustomerId: 'CUST-001',
    productsCount: 3,
    succeedProductsCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    successRate: 0.66,
    insuredCustomerName: 'John Doe',
    insuredCustomerType: CustomerType.Individual,
    channel: Channel.Website,
    agentUserCreatedBy: { id: 'USER-001', name: 'Agent User' },
    ...overrides,
  } as FullRow;
}

function createConnection(rows: FullRow[], hasNextPage = false): Connection<FullRow> {
  return {
    nodes: rows,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: rows.length,
    edges: rows.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createFetchMock(response: InsurUpGraphQLResult<Connection<FullRow>>): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetProposalsOptions<ProposalFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullRow>>>
    >()
    .mockResolvedValue(response);
}

describe('createProposalTable (smoke)', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createFetchMock(
      createSuccessResult(
        createConnection([
          createMockProposal({ id: 'PROP-001' }),
          createMockProposal({ id: 'PROP-002', state: ProposalState.Purchased }),
        ])
      )
    );
  });

  it('creates a table with the column builder', () => {
    const table = createProposalTable({
      columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(3);

    table.destroy();
  });

  it('extracts selected fields from column definitions', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id(), col.state(), col.insuredCustomerName(), col.productBranch()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'state', 'insuredCustomerName', 'productBranch']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('fetches and populates rows', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id(), col.state()],
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

  it('applies a default filter', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { state: { eq: ProposalState.Active } },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { state: { eq: ProposalState.Active } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('setFilter triggers a refetch with the new filter', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ state: { eq: ProposalState.Purchased } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { state: { eq: ProposalState.Purchased } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('clearFilter removes the active filter', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { state: { eq: ProposalState.Active } },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.clearFilter();
    await flushPromises();

    expect(mockFetch).toHaveBeenCalled();
    const args = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      filter?: unknown;
    };
    expect(args.filter).toBeUndefined();

    table.destroy();
  });
});
