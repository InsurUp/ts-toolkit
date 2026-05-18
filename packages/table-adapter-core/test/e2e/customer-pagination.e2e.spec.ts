/**
 * @fileoverview E2E pagination: cursor next/previous against the real API.
 */

import { expect, it } from 'vitest';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createCustomerTable pagination [e2e]', () => {
  it('advances and retreats through pages with cursor pagination', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const firstPage = table.getState().rows.map((r) => r.id);
      if (firstPage.length < 3 || !table.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      table.pagination.next();
      await waitForIdle(table);

      const secondPage = table.getState().rows.map((r) => r.id);
      expect(secondPage).not.toEqual(firstPage);
      const overlap = secondPage.filter((id) => firstPage.includes(id));
      expect(overlap).toEqual([]);
      expect(table.pagination.canGoPrevious()).toBe(true);

      table.pagination.previous();
      await waitForIdle(table);

      const backToFirst = table.getState().rows.map((r) => r.id);
      expect(backToFirst).toEqual(firstPage);
    } finally {
      table.destroy();
    }
  });

  it('refetches with the new page size', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id()],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 2 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);
      expect(table.getState().rows.length).toBeLessThanOrEqual(2);

      table.setPageSize(7);
      await waitForIdle(table);

      expect(table.getState().rows.length).toBeLessThanOrEqual(7);
      expect(table.pagination.getState().pageSize).toBe(7);
    } finally {
      table.destroy();
    }
  });
});
