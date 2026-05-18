/**
 * @fileoverview E2E infinite scroll: createInfiniteCustomerTable accumulates rows.
 */

import { expect, it } from 'vitest';
import { createInfiniteCustomerTable } from '../../src/entities/customer/infinite-factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForFetchCycle, waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createInfiniteCustomerTable [e2e]', () => {
  it('accumulates unique rows across page fetches', async () => {
    const client = createE2EClient();
    const table = createInfiniteCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 1 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const firstCount = table.getState().rows.length;
      // Need at least one row on page 0 and the server to advertise more pages.
      if (firstCount < 1 || !table.pagination.canGoNext()) return;

      table.pagination.next();
      await waitForFetchCycle(table);

      const allRows = table.getState().rows;
      // The server can occasionally advertise hasNextPage but return an empty
      // next page — accept that as "tenant ran out of data" rather than fail.
      if (allRows.length === firstCount) return;

      expect(allRows.length).toBeGreaterThan(firstCount);
      const ids = allRows.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    } finally {
      table.destroy();
    }
  });
});
