/**
 * @fileoverview React hook for Infinite WebhookDelivery Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteWebhookDeliveryTable as createInfiniteWebhookDeliveryTableCore,
  type InfiniteWebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteWebhookDeliveryTableResult<TColumns extends WebhookDeliveryColumnDef[]> =
  UseTableResult<WebhookDeliveryRowType<TColumns>, InfiniteWebhookDeliveryTable<TColumns>>;

/**
 * React hook for an infinite scroll webhookdelivery table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): UseInfiniteWebhookDeliveryTableResult<TColumns> {
  return useTable(() => createInfiniteWebhookDeliveryTableCore(options));
}
