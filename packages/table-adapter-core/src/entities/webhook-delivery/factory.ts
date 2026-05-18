/**
 * @fileoverview WebhookDelivery Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the webhook-deliveries SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe webhookdelivery table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): WebhookDeliveryTable<TColumns> {
  return createEntityTable<
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
  }) as WebhookDeliveryTable<TColumns>;
}

/**
 * WebhookDelivery table type — row narrowed to the fields referenced by the columns.
 */
export type WebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;
