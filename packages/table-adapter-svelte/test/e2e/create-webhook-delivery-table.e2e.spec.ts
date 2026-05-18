/**
 * @fileoverview E2E: createWebhookDeliveryTable factory against the real InsurUp API.
 *
 * Note: the live `webhookDeliveries` resolver currently 400s on any `select`
 * outside { id, event } and on any filter at all. The setFilter test is
 * skipped until the backend supports filtering; the wiring is covered by the
 * mocked integration spec.
 */

import { expect, it } from 'vitest';
import { createWebhookDeliveryTable } from '../../src/lib/create-webhook-delivery-table.svelte.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitFor, waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createWebhookDeliveryTable [e2e]', () => {
  it('fetch updates the reactive rows signal', async () => {
    const client = createE2EClient();
    const result = createWebhookDeliveryTable(() => ({
      columns: (col) => [col.id(), col.event()],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
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
    const result = createWebhookDeliveryTable(() => ({
      columns: (col) => [col.id(), col.event()],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
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

  // Skipped: live API returns 400 on any filter for webhookDeliveries.
  // Filter wiring is covered by the mocked integration spec.
  it.skip('setFilter updates the rows signal with constrained data', () => {});
});
