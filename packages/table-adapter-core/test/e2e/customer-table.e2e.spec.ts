/**
 * @fileoverview E2E smoke: createCustomerTable against the real InsurUp API.
 */

import { expect, it } from 'vitest';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { createE2EClient, e2eClientOptions } from './helpers/client.js';
import { describeE2E } from './helpers/describe.js';
import { waitForIdle } from './helpers/wait.js';

describeE2E('createCustomerTable [e2e]', () => {
  it('fetches a page of real customers', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name'), col.type('Type')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      expect(state.rows.length).toBeLessThanOrEqual(5);
    } finally {
      table.destroy();
    }
  });

  it('only returns the fields referenced by the columns', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const rows = table.getState().rows;
      if (rows.length === 0) return; // Empty tenant — invariant vacuous.

      const sample = rows[0] as Record<string, unknown>;
      expect(Object.keys(sample).sort()).toEqual(['id', 'name'].sort());
    } finally {
      table.destroy();
    }
  });

  it('honours a larger page size', async () => {
    const client = createE2EClient();
    const table = createCustomerTable({
      columns: (col) => [col.id()],
      fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 25 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);
      expect(table.getState().rows.length).toBeLessThanOrEqual(25);
    } finally {
      table.destroy();
    }
  });

  it('accepts the client option directly (no manual fetch wrapper)', async () => {
    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      client: e2eClientOptions(),
      pagination: { type: 'cursor', pageSize: 2 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.isSuccess).toBe(true);
      expect(state.error).toBeNull();
    } finally {
      table.destroy();
    }
  });
});
