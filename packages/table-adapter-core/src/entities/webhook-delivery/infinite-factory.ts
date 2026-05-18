/**
 * @fileoverview Infinite WebhookDelivery Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the webhook-deliveries SDK call.
 */

import type {
  WebhookDeliveryFieldKey,
  GetWebhookDeliveriesOptions,
  QueryWebhookDeliveryResult,
  QueryWebhookDeliveryResultSortInput,
} from '@insurup/sdk';
import type {
  WebhookDeliveryTableOptions,
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
} from './types.js';
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll webhookdelivery table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfiniteWebhookDeliveryTable<
  const TColumns extends WebhookDeliveryColumnDef[],
>(options: WebhookDeliveryTableOptions<TColumns>): InfiniteWebhookDeliveryTable<TColumns> {
  return createInfiniteEntityTable<
    QueryWebhookDeliveryResult,
    WebhookDeliveryFieldKey,
    TColumns,
    WebhookDeliveryRowType<TColumns>,
    GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>,
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryFilterInput,
    WebhookDeliverySearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'webhook-deliveries',
    clientMethod: (client) => (vars, requestOptions) =>
      client.webhooks.getWebhookDeliveries(vars, requestOptions),
  }) as InfiniteWebhookDeliveryTable<TColumns>;
}

/**
 * Infinite webhookdelivery table type — same shape as `WebhookDeliveryTable`.
 */
export type InfiniteWebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;
