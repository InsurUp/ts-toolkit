/**
 * @fileoverview Infinite Webhook Delivery Table Factory
 * @description Creates type-safe infinite scroll webhook delivery table adapters with builder API
 */

import type {
  WebhookDeliveryFieldKey,
  GetWebhookDeliveriesOptions,
  QueryWebhookDeliveryResult,
  QueryWebhookDeliveryResultSortInput,
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
} from '@insurup/sdk';
import type {
  WebhookDeliveryTableOptions,
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi } from '../../lib/factory/types.js';
import {
  getFetchFn,
  createColumnBuilder,
  createInfiniteTableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const webhookDeliverySortingConverters =
  createSortingConverters<QueryWebhookDeliveryResultSortInput>();

function buildWebhookDeliveryQueryOptions<TFields extends WebhookDeliveryFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryWebhookDeliveryResult,
    QueryWebhookDeliveryResultSortInput,
    QueryWebhookDeliveryResultFilterInput,
    QueryWebhookDeliveryResultSearchInput
  >
): GetWebhookDeliveriesOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getWebhookDeliveryFetchFn<TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): FetchFn<
  WebhookDeliveryRowType<TColumns>,
  GetWebhookDeliveriesOptions<WebhookDeliveryExtractFields<TColumns>[]>
> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.webhooks.getWebhookDeliveries(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll webhook delivery table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfiniteWebhookDeliveryTable({
 *   columns: (col) => [col.id(), col.event(), col.state()],
 *   fetch: (options) => client.webhooks.getWebhookDeliveries(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfiniteWebhookDeliveryTable<
  const TColumns extends WebhookDeliveryColumnDef[],
>(options: WebhookDeliveryTableOptions<TColumns>): InfiniteWebhookDeliveryTable<TColumns> {
  type TFields = WebhookDeliveryExtractFields<TColumns>;
  type TRow = WebhookDeliveryRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryWebhookDeliveryResult, WebhookDeliveryFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getWebhookDeliveryFetchFn(options);

  return createInfiniteTableApi<
    QueryWebhookDeliveryResult,
    TRow,
    GetWebhookDeliveriesOptions<TFields[]>,
    QueryWebhookDeliveryResultSortInput,
    WebhookDeliveryFilterInput,
    WebhookDeliverySearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildWebhookDeliveryQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: webhookDeliverySortingConverters,
    queryKeyPrefix: 'webhook-deliveries-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteWebhookDeliveryTable<TColumns>;
}

/**
 * Infinite webhook delivery table type - same interface as WebhookDeliveryTable.
 */
export type InfiniteWebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;
