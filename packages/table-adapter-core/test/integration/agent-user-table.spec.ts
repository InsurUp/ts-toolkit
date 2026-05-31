/**
 * @fileoverview Agent User Table Integration Tests
 * @description Smoke tests for the createAgentUserTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAgentUserTable } from '../../src/entities/agent-user/factory.js';
import type {
  Connection,
  InsurUpGraphQLResult,
  AgentUserFieldKey,
  GetAgentUsersOptions,
} from '@insurup/sdk';
import { AgentUserState } from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  AgentUserFetchFn,
  AgentUserRowType,
  AgentUserColumnDef,
} from '../../src/entities/agent-user/types.js';

// ============================================================================
// Mock Agent User Data Types
// ============================================================================

type FullAgentUserRow = AgentUserRowType<AgentUserColumnDef[]>;

type ExpectedFetchFn = AgentUserFetchFn<FullAgentUserRow, AgentUserFieldKey[]>;

// ============================================================================
// Mock Agent User Data
// ============================================================================

function createMockAgentUser(overrides: Partial<FullAgentUserRow> = {}): FullAgentUserRow {
  return {
    id: 'AU-001',
    authUserId: null,
    firstName: 'Jane',
    lastName: 'Agent',
    email: 'agent@example.com',
    state: AgentUserState.Active,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
    createdById: 'AU-000',
    updatedById: null,
    createdByName: 'System',
    updatedByName: null,
    roles: [],
    agentBranchIds: [],
    isServiceAccount: false,
    serviceAccountName: null,
    searchScore: null,
    ...overrides,
  } as FullAgentUserRow;
}

function createAgentUserConnection(
  users: FullAgentUserRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullAgentUserRow> {
  return {
    nodes: users,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: totalCount ?? users.length,
    edges: users.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createAgentUserFetchMock(
  response: InsurUpGraphQLResult<Connection<FullAgentUserRow>>
): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetAgentUsersOptions<AgentUserFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullAgentUserRow>>>
    >()
    .mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createAgentUserTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createAgentUserFetchMock(
      createSuccessResult(
        createAgentUserConnection([
          createMockAgentUser({ id: 'AU-001', email: 'one@example.com' }),
          createMockAgentUser({ id: 'AU-002', email: 'two@example.com' }),
        ])
      )
    );
  });

  it('should create an agent user table with column builder', () => {
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.email('Email')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(2);

    table.destroy();
  });

  it('should extract fields from column definitions', async () => {
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.email('Email'), col.firstName('First Name')],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'email', 'firstName']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should fetch and populate rows', async () => {
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.email()],
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
    const table = createAgentUserTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ state: { eq: AgentUserState.Active } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { state: { eq: AgentUserState.Active } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('should clear filter and refetch', async () => {
    const table = createAgentUserTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { email: { contains: 'example.com' } },
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
