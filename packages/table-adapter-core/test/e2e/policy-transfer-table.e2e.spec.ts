/**
 * @fileoverview E2E smoke: createPolicyTransferTable against the real InsurUp API.
 *
 * Note: the live `policyTransfersNew` endpoint currently rejects requests that
 * select or filter on `policyCount`, `insuranceCompanyCount`, or
 * `policyTransferTriggerCount` (server returns 400). Tests stick to the
 * scalar fields the API accepts (`id`, `startDate`, `endDate`).
 */

import { expect, it } from 'vitest';
import { createPolicyTransferTable } from '../../src/entities/policy-transfer/factory.js';
import { createE2EClient, e2eClientOptions } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createPolicyTransferTable [e2e]', () => {
  it('fetches a page of real policy transfers', async () => {
    const client = createE2EClient();
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.startDate('Start'), col.endDate('End')],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
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
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.startDate()],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const rows = table.getState().rows;
      const sample = rows[0];
      if (!sample) return; // Empty tenant — invariant vacuous.

      expect(Object.keys(sample).sort()).toEqual(['id', 'startDate'].sort());
    } finally {
      table.destroy();
    }
  });

  it('honours a larger page size', async () => {
    const client = createE2EClient();
    const table = createPolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
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
    const table = createPolicyTransferTable({
      columns: (col) => [col.id(), col.startDate('Start')],
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
