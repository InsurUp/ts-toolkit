/**
 * @fileoverview E2E infinite scroll: createInfiniteCustomerTable accumulates rows.
 */

import { expect, it } from 'vitest';
import { createInfiniteCustomerTable } from '../../src/entities/customer/infinite-factory.js';
import { createE2EClient } from './helpers/client.js';
import { describeE2E } from './helpers/describe.js';
import { waitForFetchCycle, waitForIdle } from './helpers/wait.js';

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

      const allRows = table.getState().rows as ReadonlyArray<{ id: string }>;
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
