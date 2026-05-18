/**
 * @fileoverview Svelte 5 wrapper for Webhook Delivery Table
 */

import {
  createWebhookDeliveryTable as createWebhookDeliveryTableCore,
  type WebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Webhook delivery table instance for Svelte 5 with fine-grained reactive state.
 */
export type WebhookDeliveryTableInstance<TColumns extends WebhookDeliveryColumnDef[]> =
  TableCoreResult<WebhookDeliveryRowType<TColumns>, WebhookDeliveryTable<TColumns>>;

/**
 * Creates a webhook delivery table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: Must be called within a Svelte component context.
 */
export function createWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  getOptions: () => WebhookDeliveryTableOptions<TColumns>
): WebhookDeliveryTableInstance<TColumns> {
  return createTableCore<
    WebhookDeliveryRowType<TColumns>,
    WebhookDeliveryTableOptions<TColumns>,
    WebhookDeliveryTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createWebhookDeliveryTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
