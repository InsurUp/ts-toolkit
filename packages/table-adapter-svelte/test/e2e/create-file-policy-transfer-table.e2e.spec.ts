/**
 * @fileoverview E2E: createFilePolicyTransferTable factory against the real InsurUp API.
 *
 * Svelte's runes expose fine-grained signals (result.rows, result.isFetching),
 * so the test reads them directly after waiting for the adapter to settle.
 * The polymorphic wait helpers handle both `getState()` adapters and runes
 * that expose the fields directly.
 */

import { expect, it } from 'vitest';
import { createFilePolicyTransferTable } from '../../src/lib/create-file-policy-transfer-table.svelte.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitFor, waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createFilePolicyTransferTable [e2e]', () => {
  it('fetch updates the reactive rows signal', async () => {
    const client = createE2EClient();
    const result = createFilePolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.fileName('File'), col.createdAt('Created')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
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
    const result = createFilePolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.fileName('File')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
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
    const result = createFilePolicyTransferTable(() => ({
      columns: (col) => [col.id(), col.insuranceCompanyId('Company')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 10 },
    }));
    try {
      result.adapter.setFilter({ insuranceCompanyId: { gt: 0 } });
      await waitFor(() => result.isSuccess && !result.isFetching, 15_000);

      for (const row of result.rows) {
        expect(row.insuranceCompanyId).toBeGreaterThan(0);
      }
    } finally {
      result.destroy();
    }
  });
});
