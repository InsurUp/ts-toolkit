/**
 * @fileoverview Webhook Delivery Table Factory
 * @description Creates type-safe webhook delivery table adapters with builder API and field inference
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
import {
  getFetchFn,
  createColumnBuilder,
  createTableApi,
  type TableApi,
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
    includeTotalCount: params.includeTotalCount,
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
 * Create a type-safe webhook delivery table adapter.
 *
 * @example
 * ```typescript
 * const table = createWebhookDeliveryTable({
 *   columns: (col) => [col.id(), col.event(), col.state()],
 *   fetch: (options) => client.webhooks.getWebhookDeliveries(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): WebhookDeliveryTable<TColumns> {
  type TFields = WebhookDeliveryExtractFields<TColumns>;
  type TRow = WebhookDeliveryRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryWebhookDeliveryResult, WebhookDeliveryFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getWebhookDeliveryFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'webhook-deliveries',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as WebhookDeliveryTable<TColumns>;
}

/**
 * Webhook delivery table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type WebhookDeliveryTable<
  TColumns extends WebhookDeliveryColumnDef[] = WebhookDeliveryColumnDef[],
> = TableApi<
  WebhookDeliveryRowType<TColumns>,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
  CursorPaginationManager
>;
