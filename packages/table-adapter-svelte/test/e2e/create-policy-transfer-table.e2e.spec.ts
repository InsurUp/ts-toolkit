/**
 * @fileoverview E2E: createPolicyTransferTable factory against the real InsurUp API.
 *
 * Svelte's runes expose fine-grained signals (result.rows, result.isFetching),
 * so the test reads them directly after waiting for the adapter to settle.
 * The polymorphic wait helpers handle both `getState()` adapters and runes
 * that expose the fields directly.
 *
 * Note: the live `policyTransfersNew` endpoint currently rejects requests
 * that select or filter on `policyCount`, `insuranceCompanyCount`, or
 * `policyTransferTriggerCount`. Tests stick to `id`, `startDate`, `endDate`.
 */

import { expect, it } from 'vitest';
import { createPolicyTransferTable } from '../../src/lib/create-policy-transfer-table.svelte.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitFor, waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createPolicyTransferTable [e2e]', () => {
  it('fetch updates the reactive rows signal', async () => {
    const client = createE2EClient();
    const result = createPolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.startDate('Start'), col.endDate('End')],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    }));
    try {
      await result.adapter.fetch();
      await waitForIdle(result);

      expect(result.isSuccess).toBe(true);
      expect(result.error).toBeNull();
      expect(result.rows.length).toBeLessThanOrEqual(3);
    } finally {
      result.destroy();
    }
  });

  it('pagination.next() updates the rows signal with new data', async () => {
    const client = createE2EClient();
    const result = createPolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.startDate()],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    }));
    try {
      await result.adapter.fetch();
      await waitForIdle(result);

      const firstIds = result.rows.map((r) => r.id);
      if (firstIds.length < 3 || !result.adapter.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      result.adapter.pagination.next();
      await waitFor(
        () => !result.isFetching && result.rows.map((r) => r.id).join(',') !== firstIds.join(','),
        15_000
      );

      const secondIds = result.rows.map((r) => r.id);
      const overlap = secondIds.filter((id) => firstIds.includes(id));
      expect(overlap).toEqual([]);
    } finally {
      result.destroy();
    }
  });

  it('setFilter updates the rows signal with constrained data', async () => {
    const client = createE2EClient();
    const result = createPolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.startDate()],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 10 },
    }));
    try {
      await result.adapter.fetch();
      await waitForIdle(result);

      const seed = result.rows[0];
      if (!seed?.startDate) return; // Empty tenant or no startDate — vacuous.
      // Server filter accepts LocalDate (YYYY-MM-DD). The SDK doesn't deserialize
      // date fields, so seed.startDate is a raw ISO string regardless of the TS type.
      const targetStartDate = String(seed.startDate).slice(0, 10);

      result.adapter.setFilter({ startDate: { eq: targetStartDate } });
      await waitFor(() => result.isSuccess && !result.isFetching, 15_000);

      for (const row of result.rows) {
        expect(String(row.startDate).slice(0, 10)).toBe(targetStartDate);
      }
    } finally {
      result.destroy();
    }
  });
});
