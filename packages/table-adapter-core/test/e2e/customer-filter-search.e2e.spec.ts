/**
 * @fileoverview E2E filter + search: SDK filter/search inputs forwarded to the real API.
 */

import { expect, it } from 'vitest';
import { CustomerType } from '@insurup/sdk';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createCustomerTable filter + search [e2e]', () => {
  it('filters customers by type', async () => {
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

  it('accepts a search input without erroring', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setSearch({ name: { textSearch: { value: 'a' } } });
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
