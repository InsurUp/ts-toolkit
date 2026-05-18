/**
 * @fileoverview Svelte 5 wrapper for Infinite Webhook Delivery Table
 */

import {
  createInfiniteWebhookDeliveryTable as createInfiniteWebhookDeliveryTableCore,
  type InfiniteWebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite webhook delivery table instance for Svelte 5 with fine-grained reactive state.
 */
export type InfiniteWebhookDeliveryTableInstance<TColumns extends WebhookDeliveryColumnDef[]> =
  TableCoreResult<WebhookDeliveryRowType<TColumns>, InfiniteWebhookDeliveryTable<TColumns>>;

/**
 * Creates an infinite scroll webhook delivery table for Svelte 5.
 *
 * **Important**: Must be called within a Svelte component context.
 */
export function createInfiniteWebhookDeliveryTable<
  const TColumns extends WebhookDeliveryColumnDef[],
>(
  getOptions: () => WebhookDeliveryTableOptions<TColumns>
): InfiniteWebhookDeliveryTableInstance<TColumns> {
  return createTableCore<
    WebhookDeliveryRowType<TColumns>,
    WebhookDeliveryTableOptions<TColumns>,
    InfiniteWebhookDeliveryTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteWebhookDeliveryTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
