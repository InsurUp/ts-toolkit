/**
 * @fileoverview E2E: useWebhookDeliveryTable against the real InsurUp API.
 *
 * Note: the live `webhookDeliveries` resolver currently 400s on any `select`
 * outside { id, event } and on any filter at all. The setFilter test is
 * skipped until the backend supports filtering; the wiring is covered by the
 * mocked integration spec.
 */

import { expect, it } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebhookDeliveryTable } from '../../src/use-webhook-delivery-table';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';

describeE2E('useWebhookDeliveryTable [e2e]', () => {
  it('autoFetch propagates real rows through useSyncExternalStore', async () => {
    const client = createE2EClient();
    const { result, unmount } = renderHook(() =>
      useWebhookDeliveryTable({
        columns: (col) => [col.id(), col.event()],
        fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
        pagination: { type: 'cursor', pageSize: 3 },
        autoFetch: true,
      })
    );

    try {
      await waitFor(
        () => {
          expect(result.current.state.isSuccess).toBe(true);
        },
        { timeout: 15_000 }
      );

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.rows.length).toBeLessThanOrEqual(3);
    } finally {
      unmount();
    }
  });

  it('pagination.next() re-renders with new rows', async () => {
    const client = createE2EClient();
    const { result, unmount } = renderHook(() =>
      useWebhookDeliveryTable({
        columns: (col) => [col.id(), col.event()],
        fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
        pagination: { type: 'cursor', pageSize: 3 },
      })
    );

    try {
      await act(async () => {
        await result.current.adapter.fetch();
      });
      await waitFor(() => {
        expect(result.current.state.isSuccess).toBe(true);
      });

      const firstIds = result.current.state.rows.map((r) => r.id);
      if (firstIds.length < 3 || !result.current.adapter.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      await act(async () => {
        result.current.adapter.pagination.next();
      });
      await waitFor(
        () => {
          expect(result.current.state.isFetching).toBe(false);
          expect(result.current.state.rows.map((r) => r.id)).not.toEqual(firstIds);
        },
        { timeout: 15_000 }
      );

      const secondIds = result.current.state.rows.map((r) => r.id);
      const overlap = secondIds.filter((id) => firstIds.includes(id));
      expect(overlap).toEqual([]);
    } finally {
      unmount();
    }
  });

  // Skipped: live API returns 400 on any filter for webhookDeliveries.
  // Filter wiring is covered by the mocked integration spec
  // (test/integration/webhook-delivery-table.spec.ts).
  it.skip('setFilter re-renders with constrained rows', () => {});
});
