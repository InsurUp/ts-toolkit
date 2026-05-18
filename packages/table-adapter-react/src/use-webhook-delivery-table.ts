/**
 * @fileoverview React hook for WebhookDelivery Table — thin wrapper over `useTable`.
 */

import {
  createWebhookDeliveryTable as createWebhookDeliveryTableCore,
  type WebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseWebhookDeliveryTableResult<TColumns extends WebhookDeliveryColumnDef[]> =
  UseTableResult<WebhookDeliveryRowType<TColumns>, WebhookDeliveryTable<TColumns>>;

/**
 * React hook for creating and managing a webhookdelivery table.
 * See `useTable` for the underlying primitive.
 */
export function useWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): UseWebhookDeliveryTableResult<TColumns> {
  return useTable(() => createWebhookDeliveryTableCore(options));
}
