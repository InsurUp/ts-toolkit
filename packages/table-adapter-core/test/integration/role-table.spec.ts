/**
 * @fileoverview Role Table Integration Tests
 * @description Integration tests for the in-memory createRoleTable factory:
 * the list is loaded once and filtered / searched / sorted / paginated in memory.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { InsurUpResult, GetAllAgentRolesResult } from '@insurup/sdk';
import { createRoleTable, createInfiniteRoleTable } from '../../src/entities/role/factory.js';
import { flushPromises } from '../utils/helpers.js';
import { createSuccessResult, createClientError } from '../utils/mocks.js';

function mockRole(overrides: Partial<GetAllAgentRolesResult> = {}): GetAllAgentRolesResult {
  return {
    id: 'ROLE-1',
    name: 'Admin',
    permissions: ['read', 'write'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: null,
    ...overrides,
  } as GetAllAgentRolesResult;
}

const roles: GetAllAgentRolesResult[] = [
  mockRole({ id: 'ROLE-1', name: 'Admin', createdAt: '2024-01-01T00:00:00Z' }),
  mockRole({ id: 'ROLE-2', name: 'Manager', createdAt: '2024-02-01T00:00:00Z' }),
  mockRole({ id: 'ROLE-3', name: 'Support', createdAt: '2024-03-01T00:00:00Z' }),
  mockRole({ id: 'ROLE-4', name: 'Viewer', createdAt: '2024-04-01T00:00:00Z' }),
  mockRole({ id: 'ROLE-5', name: 'Auditor', createdAt: '2024-05-01T00:00:00Z' }),
];

let fetchAll: Mock<() => Promise<InsurUpResult<GetAllAgentRolesResult[]>>>;

beforeEach(() => {
  fetchAll = vi.fn(
    async (): Promise<InsurUpResult<GetAllAgentRolesResult[]>> => createSuccessResult(roles)
  );
});

function createTable(pageSize = 2) {
  return createRoleTable({
    columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true }), col.createdAt()],
    fetchAll,
    pagination: { type: 'cursor', pageSize },
    autoFetch: true,
  });
}

describe('createRoleTable', () => {
  it('loads the list and exposes the first page', async () => {
    const table = createTable(2);
    await flushPromises();

    const state = table.getState();
    expect(state.rows.map((r) => r.id)).toEqual(['ROLE-1', 'ROLE-2']);
    expect(state.rowCount).toBe(5);
    expect(state.pageCount).toBe(3);
    table.destroy();
  });

  it('loads the source only once across filter / sort / page changes', async () => {
    const table = createTable(2);
    await flushPromises();

    table.setFilter({ $search: 'a' });
    await flushPromises();
    table.getTable().setSorting([{ id: 'name', desc: true }]);
    await flushPromises();
    table.pagination.next();
    await flushPromises();

    expect(fetchAll).toHaveBeenCalledTimes(1);
    table.destroy();
  });

  it('filters in memory via $search', async () => {
    const table = createTable(10);
    await flushPromises();

    table.setFilter({ $search: 'aud' });
    await flushPromises();

    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-5']);
    table.destroy();
  });

  it('filters in memory via a per-field predicate', async () => {
    const table = createTable(10);
    await flushPromises();

    table.setFilter({ name: { eq: 'Manager' } });
    await flushPromises();

    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-2']);
    table.destroy();
  });

  it('clears the filter back to the full list', async () => {
    const table = createTable(10);
    await flushPromises();

    table.setFilter({ $search: 'aud' });
    await flushPromises();
    expect(table.getState().rows).toHaveLength(1);

    table.clearFilter();
    await flushPromises();
    expect(table.getState().rows).toHaveLength(5);
    table.destroy();
  });

  it('sorts in memory when the table sorting changes', async () => {
    const table = createTable(10);
    await flushPromises();

    table.getTable().setSorting([{ id: 'name', desc: false }]);
    await flushPromises();

    expect(table.getState().rows.map((r) => r.name)).toEqual([
      'Admin',
      'Auditor',
      'Manager',
      'Support',
      'Viewer',
    ]);
    table.destroy();
  });

  it('paginates in memory with prev/next', async () => {
    const table = createTable(2);
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-1', 'ROLE-2']);

    table.pagination.next();
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-3', 'ROLE-4']);

    table.pagination.next();
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-5']);
    expect(table.pagination.canGoNext()).toBe(false);

    table.pagination.previous();
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-3', 'ROLE-4']);
    table.destroy();
  });

  it('re-pulls the source on invalidate() and forced refetch()', async () => {
    const table = createTable(10);
    await flushPromises();
    expect(fetchAll).toHaveBeenCalledTimes(1);

    await table.invalidate();
    await flushPromises();
    expect(fetchAll).toHaveBeenCalledTimes(2);

    await table.refetch({ force: true });
    await flushPromises();
    expect(fetchAll).toHaveBeenCalledTimes(3);
    table.destroy();
  });

  it('surfaces a loader error as table error state', async () => {
    fetchAll.mockResolvedValueOnce(createClientError());
    const table = createTable(10);
    await flushPromises();

    expect(table.getState().isError).toBe(true);
    expect(table.getState().error).not.toBeNull();
    table.destroy();
  });
});

describe('createInfiniteRoleTable', () => {
  it('accumulates rows across pages', async () => {
    const table = createInfiniteRoleTable({
      columns: (col) => [col.id(), col.name()],
      fetchAll,
      pagination: { type: 'cursor', pageSize: 2 },
      autoFetch: true,
    });
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual(['ROLE-1', 'ROLE-2']);

    table.pagination.next();
    await flushPromises();
    expect(table.getState().rows.map((r) => r.id)).toEqual([
      'ROLE-1',
      'ROLE-2',
      'ROLE-3',
      'ROLE-4',
    ]);
    expect(fetchAll).toHaveBeenCalledTimes(1);
    table.destroy();
  });
});
