/**
 * @fileoverview E2E error paths: SDK error envelope flows through to
 * adapter state and the onError callback.
 */

import { expect, it, vi } from 'vitest';
import { DefaultInsurUpClient } from '@insurup/sdk';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import { e2eClientOptions } from './helpers/client.js';
import { describeE2E } from './helpers/describe.js';
import { waitForIdle } from './helpers/wait.js';

describeE2E('createCustomerTable error paths [e2e]', () => {
  it('surfaces a 401 when the access token is invalid', async () => {
    const onError = vi.fn();

    // Build a client with a deliberately-bogus token so the real API rejects it.
    const badClient = new DefaultInsurUpClient({
      ...e2eClientOptions(),
      tokenProvider: () => 'not.a.valid.jwt',
    });

    const table = createCustomerTable({
      columns: (col) => [col.id(), col.name('Name')],
      fetch: (vars, opts) => badClient.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 1 },
      onError,
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.isError).toBe(true);
      expect(state.error).not.toBeNull();
      expect(state.isSuccess).toBe(false);
      expect(state.rows).toEqual([]);
      expect(onError).toHaveBeenCalled();
    } finally {
      table.destroy();
    }
  });

  it('surfaces an error when the base URL is wrong', async () => {
    const onError = vi.fn();

    const offlineClient = new DefaultInsurUpClient({
      ...e2eClientOptions(),
      baseUrl: 'https://api.invalid.insurup.example/api/',
      timeoutMs: 3_000,
    });

    const table = createCustomerTable({
      columns: (col) => [col.id()],
      fetch: (vars, opts) => offlineClient.customers.getCustomers(vars, opts),
      pagination: { type: 'cursor', pageSize: 1 },
      onError,
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.isError).toBe(true);
      expect(state.error).not.toBeNull();
      expect(state.rows).toEqual([]);
      expect(onError).toHaveBeenCalled();
    } finally {
      table.destroy();
    }
  });
});
