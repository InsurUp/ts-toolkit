/**
 * @fileoverview E2E filter + search: the unified setFilter surface against the
 * real API. Goal of this file is *wire coverage* — every operator slot that
 * the refactor touched (renamed filter ops, new search ops, shorthand
 * normalization, score/boost, searchScore field/sort) gets at least one
 * request that lands without a server error.
 *
 * Assertions stay on the request-accepted side (no error, isSuccess) rather
 * than on specific result counts: the local tenant's data shape is unknown
 * and the tests need to be stable across reseeds.
 */

import { expect, it } from 'vitest';
import {
  CustomerType,
  SortEnumType,
  type QueryCustomerModelUnifiedFilterInput,
} from '@insurup/sdk';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createCustomerTable filter + search [e2e]', () => {
  // --------------------------------------------------------------------------
  // Filter side: plain ops + the renamed `not*` operators
  // --------------------------------------------------------------------------

  it('filters customers by enum (type=Individual)', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.type('Type')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 10 },
      defaultFilter: { type: { eq: CustomerType.Individual } },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      for (const row of state.rows) {
        expect(row.type).toBe(CustomerType.Individual);
      }
    } finally {
      table.destroy();
    }
  });

  it('clears the filter and refetches', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.type('Type')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      defaultFilter: { type: { eq: CustomerType.Foreign } },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      table.clearFilter();
      await waitForIdle(table);

      expect(table.getFilter()).toBeUndefined();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  const filterOpCases: ReadonlyArray<[string, QueryCustomerModelUnifiedFilterInput]> = [
    ['contains', { name: { contains: 'a' } }],
    ['notContains', { name: { notContains: 'zzzunlikely' } }],
    ['startsWith', { name: { startsWith: 'a' } }],
    ['notStartsWith', { name: { notStartsWith: 'zzz' } }],
    ['endsWith', { name: { endsWith: 'a' } }],
    ['notEndsWith', { name: { notEndsWith: 'zzz' } }],
  ];

  it.each(filterOpCases)(
    'accepts the renamed filter op `%s` against the live server',
    async (_label, filter) => {
      const client = createE2EClient();
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
        pagination: { type: 'cursor', pageSize: 3 },
        defaultFilter: filter,
      });
      try {
        await table.fetch();
        await waitForIdle(table);
        expect(table.getState().error).toBeNull();
        expect(table.getState().isSuccess).toBe(true);
      } finally {
        table.destroy();
      }
    }
  );

  // --------------------------------------------------------------------------
  // Search side: every operator slot with shorthand normalization
  // --------------------------------------------------------------------------

  // Per-op coverage of the unified search surface. Each entry is just the
  // value for `name`; the test wires it through `setFilter({ name: … })`.
  const searchOpCases: ReadonlyArray<[string, QueryCustomerModelUnifiedFilterInput['name']]> = [
    ['textSearch shorthand', { $search: true, textSearch: 'a' }],
    ['wildcard shorthand', { $search: true, wildcard: 'a' }],
    ['autocomplete shorthand', { $search: true, autocomplete: 'a' }],
    ['contains shorthand (search)', { $search: true, contains: 'a' }],
    ['notContains shorthand (search)', { $search: true, notContains: 'zzz' }],
    ['startsWith shorthand (search)', { $search: true, startsWith: 'a' }],
    ['notStartsWith shorthand (search)', { $search: true, notStartsWith: 'zzz' }],
    ['endsWith shorthand (search)', { $search: true, endsWith: 'a' }],
    ['notEndsWith shorthand (search)', { $search: true, notEndsWith: 'zzz' }],
    ['eq long form (SearchTextInput)', { $search: true, eq: { value: 'NoOneNamedThis' } }],
    ['in shorthand (string[])', { $search: true, in: ['Alice', 'Bob'] }],
    ['nin shorthand (string[])', { $search: true, nin: ['Zzz'] }],
  ];

  it.each(searchOpCases)('routes %s through the server search slot', async (_label, nameValue) => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({ name: nameValue });
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  // --------------------------------------------------------------------------
  // Search score: boost / constant flow through to the server
  // --------------------------------------------------------------------------

  it('accepts SearchScoreInput.boost on a search clause', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        name: {
          $search: true,
          textSearch: { value: 'a', score: { boost: 2 } },
        },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('accepts SearchScoreInput.constant on a search clause', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        name: {
          $search: true,
          textSearch: { value: 'a', score: { constant: 5 } },
        },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  // --------------------------------------------------------------------------
  // searchScore: selectable in columns, sortable by SortEnumType
  // --------------------------------------------------------------------------

  it('selects `searchScore` as a column when a search clause is active', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name'), col.searchScore()],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({ name: { $search: true, textSearch: 'a' } });
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      for (const row of state.rows) {
        expect(row).toHaveProperty('searchScore');
      }
    } finally {
      table.destroy();
    }
  });

  it('sorts by searchScore DESC alongside an active search', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name'), col.searchScore()],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      tableOptions: {
        state: { sorting: [{ id: 'searchScore', desc: true }] },
      },
      defaultFilter: { name: { $search: true, textSearch: 'a' } },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);

      // If the tenant has 2+ matches, scores should be non-increasing.
      const scores = state.rows
        .map((r) => r.searchScore)
        .filter((s): s is number => typeof s === 'number');
      if (scores.length >= 2) {
        for (let i = 1; i < scores.length; i++) {
          expect(scores[i]!).toBeLessThanOrEqual(scores[i - 1]!);
        }
      }
    } finally {
      table.destroy();
    }
  });

  // --------------------------------------------------------------------------
  // Mixed filter + search: one setFilter call splits across both server slots
  // --------------------------------------------------------------------------

  it('routes filter and search-marked fields in a single setFilter call', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name'), col.type('Type')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        type: { eq: CustomerType.Individual },
        name: { $search: true, textSearch: 'a' },
      });
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      for (const row of state.rows) {
        expect(row.type).toBe(CustomerType.Individual);
      }
    } finally {
      table.destroy();
    }
  });

  // --------------------------------------------------------------------------
  // SDK-layer parity: the same operator surface works through the raw SDK
  // (not via the table adapter) — proves the normalizer + new operator names
  // land at the wire even when the consumer skips the adapter.
  // --------------------------------------------------------------------------

  it('SDK getCustomers accepts unified filter (filter + $search-marked) directly', async () => {
    const client = createE2EClient();
    const result = await client.customers.getCustomers({
      first: 3,
      select: ['id', 'name'],
      filter: {
        // Plain filter — SDK routes to the server `filter:` slot
        identityNumber: { notContains: 'zzz' },
        // $search-marked — SDK routes to the server `search:` slot, shorthand normalized
        name: { $search: true, textSearch: 'a' },
      },
    });
    expect(result.isSuccess).toBe(true);
  });

  it('SDK getCustomers sorts by searchScore via SortEnumType', async () => {
    const client = createE2EClient();
    const result = await client.customers.getCustomers({
      first: 3,
      select: ['id', 'name', 'searchScore'],
      filter: { name: { $search: true, textSearch: 'a' } },
      order: [{ searchScore: SortEnumType.DESC }],
    });
    expect(result.isSuccess).toBe(true);
  });
});
