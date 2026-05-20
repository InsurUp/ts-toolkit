/**
 * @fileoverview WebhookDelivery Table Factories
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
  WebhookDeliveryUnifiedFilterInput,
} from './types.js';
import {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
  type TableApi,
} from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const webhookDeliveryConfig: EntityFactoryConfig<
  GetWebhookDeliveriesOptions<WebhookDeliveryFieldKey[]>
> = {
  queryKeyPrefix: 'webhook-deliveries',
  clientMethod: (client) => (vars, requestOptions) =>
    client.webhooks.getWebhookDeliveries(vars, requestOptions),
};

export function createWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): WebhookDeliveryTable<TColumns> {
  return createEntityTable<
    QueryWebhookDeliveryResult,
    WebhookDeliveryFieldKey,
    TColumns,
    WebhookDeliveryRowType<TColumns>,
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryUnifiedFilterInput,
    GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, webhookDeliveryConfig);
}

export function createInfiniteWebhookDeliveryTable<
  const TColumns extends WebhookDeliveryColumnDef[],
>(options: WebhookDeliveryTableOptions<TColumns>): InfiniteWebhookDeliveryTable<TColumns> {
  return createInfiniteEntityTable<
    QueryWebhookDeliveryResult,
    WebhookDeliveryFieldKey,
    TColumns,
    WebhookDeliveryRowType<TColumns>,
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryUnifiedFilterInput,
    GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, webhookDeliveryConfig);
}

export type WebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfiniteWebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryUnifiedFilterInput,
  CursorPaginationManager
>;
