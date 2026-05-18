/**
 * @fileoverview E2E: useWebhookDeliveryTable composable against the real InsurUp API.
 *
 * Note: the live `webhookDeliveries` resolver currently 400s on any `select`
 * outside { id, event } and on any filter at all. The setFilter test is
 * skipped until the backend supports filtering; the wiring is covered by the
 * mocked integration spec.
 */

import { expect, it } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import type {
  WebhookDeliveryTableOptions,
  WebhookDeliveryColumnDef,
} from '@insurup/table-adapter-core';
import { useWebhookDeliveryTable } from '../../src/use-webhook-delivery-table';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitFor } from '@insurup/test-helpers-e2e/wait';

type Options = WebhookDeliveryTableOptions<WebhookDeliveryColumnDef[]>;

function mountWith(options: Options) {
  const TestComponent = defineComponent({
    setup() {
      return useWebhookDeliveryTable(options);
    },
    template: '<div />',
  });
  return mount(TestComponent);
}

describeE2E('useWebhookDeliveryTable [e2e]', () => {
  it('autoFetch populates the reactive state ref with real rows', async () => {
    const client = createE2EClient();
    const wrapper = mountWith({
      columns: (col) => [col.id(), col.event()],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      autoFetch: true,
    });

    try {
      await waitFor(() => wrapper.vm.state.isSuccess === true, 15_000);
      await nextTick();

      expect(wrapper.vm.state.error).toBeNull();
      expect(wrapper.vm.state.rows.length).toBeLessThanOrEqual(3);
    } finally {
      wrapper.unmount();
    }
  });

  it('pagination.next() updates the reactive state with new rows', async () => {
    const client = createE2EClient();
    const wrapper = mountWith({
      columns: (col) => [col.id(), col.event()],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });

    try {
      await wrapper.vm.adapter.fetch();
      await nextTick();
      await waitFor(() => wrapper.vm.state.isSuccess === true, 15_000);

      const firstIds = wrapper.vm.state.rows.map((r) => r.id);
      if (firstIds.length < 3 || !wrapper.vm.adapter.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      wrapper.vm.adapter.pagination.next();
      await waitFor(
        () =>
          !wrapper.vm.state.isFetching &&
          wrapper.vm.state.rows.map((r) => r.id).join(',') !== firstIds.join(','),
        15_000
      );
      await nextTick();

      const secondIds = wrapper.vm.state.rows.map((r) => r.id);
      const overlap = secondIds.filter((id) => firstIds.includes(id));
      expect(overlap).toEqual([]);
    } finally {
      wrapper.unmount();
    }
  });

  // Skipped: live API returns 400 on any filter for webhookDeliveries.
  // Filter wiring is covered by the mocked integration spec.
  it.skip('setFilter updates the reactive state with constrained rows', () => {});
});
