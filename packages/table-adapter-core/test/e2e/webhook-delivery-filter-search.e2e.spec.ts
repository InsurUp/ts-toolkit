/**
 * @fileoverview E2E filter + search routing for createWebhookDeliveryTable.
 *
 * WebhookDelivery has exactly one searchable field (`errorMessage`) and a
 * filter-rich surface (boolean `isSuccess`, enum `event`, numeric `statusCode`).
 */

import { expect, it } from 'vitest';
import { createWebhookDeliveryTable } from '../../src/entities/webhook-delivery/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createWebhookDeliveryTable filter + search [e2e]', () => {
  it('routes $search-marked errorMessage through the server search slot', async () => {
    const client = createE2EClient();
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event('Event')],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setFilter({ errorMessage: { $search: true, textSearch: 'timeout' } });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('applies a boolean filter (isSuccess: false)', async () => {
    const client = createE2EClient();
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event('Event')],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      defaultFilter: { isSuccess: { eq: false } },
    });
    try {
      await table.fetch();
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('splits a mixed filter + search payload across both slots in one call', async () => {
    const client = createE2EClient();
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event('Event')],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        isSuccess: { eq: false },
        errorMessage: { $search: true, contains: 'timeout' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
