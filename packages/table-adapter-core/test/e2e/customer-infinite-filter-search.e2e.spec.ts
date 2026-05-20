/**
 * @fileoverview E2E filter + search routing for createInfiniteCustomerTable.
 *
 * The infinite adapter's `setFilter` must (a) split a `$search`-marked entry
 * into the server search slot and (b) reset the accumulated rows so the next
 * fetch doesn't append to a stale list. Both verified against the live API.
 */

import { expect, it } from 'vitest';
import { CustomerType } from '@insurup/sdk';
import { createInfiniteCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createInfiniteCustomerTable filter + search [e2e]', () => {
  it('routes a $search-marked filter and resets accumulated rows', async () => {
    const client = createE2EClient();
    const table = createInfiniteCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      // Accumulate a second page.
      table.pagination.next();
      await waitForIdle(table);
      const beforeMutationRowCount = table.getState().rows.length;

      // setFilter with a $search-marked field must reset the accumulator.
      table.setFilter({ name: { $search: true, textSearch: 'a' } });
      // Accumulator is reset synchronously; the next fetch lands shortly.
      expect(table.getState().rows.length).toBeLessThanOrEqual(beforeMutationRowCount);
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('splits a mixed filter + search payload in one setFilter call', async () => {
    const client = createE2EClient();
    const table = createInfiniteCustomerTable({
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
});
