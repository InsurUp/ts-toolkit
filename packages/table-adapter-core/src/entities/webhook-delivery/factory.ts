/**
 * @fileoverview WebhookDelivery Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the webhook-deliveries SDK call. Both paginated and infinite variants live here.
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

type WebhookDeliveryConfig = EntityFactoryConfig<
  GetWebhookDeliveriesOptions<WebhookDeliveryFieldKey[]>
>;

const webhookDeliveryConfig: WebhookDeliveryConfig = {
  queryKeyPrefix: 'webhook-deliveries',
  clientMethod: (client) => (vars, requestOptions) =>
    client.webhooks.getWebhookDeliveries(vars, requestOptions),
};

/**
 * Create a type-safe webhook delivery table adapter.
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
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryFilterInput,
    WebhookDeliverySearchInput,
    GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, webhookDeliveryConfig);
}

/**
 * Create an infinite-scroll webhook delivery table adapter.
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
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryFilterInput,
    WebhookDeliverySearchInput,
    GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, webhookDeliveryConfig);
}

/** WebhookDelivery table type — row narrowed to the fields referenced by the columns. */
export type WebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;

/** Infinite webhook delivery table type — same shape as `WebhookDeliveryTable`. */
export type InfiniteWebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;
