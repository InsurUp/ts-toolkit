/**
 * @fileoverview E2E sorting: TanStack sort state → SDK order param → server result.
 */

import { expect, it } from 'vitest';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient } from './helpers/client.js';
import { describeE2E } from './helpers/describe.js';
import { waitForIdle } from './helpers/wait.js';

interface HasValueOf {
  valueOf(): number;
}

function isMonotonic(values: ReadonlyArray<HasValueOf>, direction: 'asc' | 'desc'): boolean {
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const cur = values[i];
    if (prev === undefined || cur === undefined) continue;
    const a = prev.valueOf();
    const b = cur.valueOf();
    if (direction === 'asc' ? b < a : b > a) return false;
  }
  return true;
}

describeE2E('createCustomerTable sorting [e2e]', () => {
  it('sorts by createdAt descending then ascending', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.createdAt('Created')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 10 },
      tableOptions: {
        state: { sorting: [{ id: 'createdAt', desc: true }] },
      },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const desc = table.getState().rows.map((r) => r.createdAt);
      if (desc.length < 2) return; // Not enough data to test ordering.
      expect(isMonotonic(desc, 'desc')).toBe(true);

      table.getTable().setSorting([{ id: 'createdAt', desc: false }]);
      await waitForIdle(table);

      const asc = table.getState().rows.map((r) => r.createdAt);
      if (asc.length < 2) return;
      expect(isMonotonic(asc, 'asc')).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
