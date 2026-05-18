/**
 * @fileoverview Webhook Delivery Table Types
 * @description Type definitions for the webhook delivery table adapter
 */

import type {
  GetWebhookDeliveriesOptions,
  WebhookDeliveryFieldKey,
  QueryWebhookDeliveryResult,
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

// Re-export filter and search types for convenience
export type {
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
} from '@insurup/sdk';

/**
 * Column definition for webhook delivery tables
 */
export type WebhookDeliveryColumnDef = AnyColumnDef<WebhookDeliveryFieldKey>;

/**
 * Extract fields from webhook delivery column definitions
 * @template TColumns - The column definitions array
 */
export type WebhookDeliveryExtractFields<TColumns extends readonly WebhookDeliveryColumnDef[]> =
  EntityExtractFields<TColumns, WebhookDeliveryFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type WebhookDeliveryRowType<TColumns extends readonly WebhookDeliveryColumnDef[]> =
  PickFields<QueryWebhookDeliveryResult, readonly WebhookDeliveryExtractFields<TColumns>[]>;

/**
 * Fetch function type for webhook delivery queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type WebhookDeliveryFetchFn<
  TRow = QueryWebhookDeliveryResult,
  TFields extends WebhookDeliveryFieldKey[] = WebhookDeliveryFieldKey[],
> = EntityFetchFn<TRow, GetWebhookDeliveriesOptions<TFields>>;

/**
 * Filter input type for webhook delivery queries
 */
export type WebhookDeliveryFilterInput = QueryWebhookDeliveryResultFilterInput;

/**
 * Search input type for webhook delivery queries
 */
export type WebhookDeliverySearchInput = QueryWebhookDeliveryResultSearchInput;

/**
 * Options for createWebhookDeliveryTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type WebhookDeliveryTableOptions<TColumns extends WebhookDeliveryColumnDef[]> =
  EntityTableOptions<
    QueryWebhookDeliveryResult,
    WebhookDeliveryFieldKey,
    TColumns,
    WebhookDeliveryRowType<TColumns>,
    WebhookDeliveryFetchFn<
      WebhookDeliveryRowType<TColumns>,
      WebhookDeliveryExtractFields<TColumns>[]
    >,
    WebhookDeliveryFilterInput,
    WebhookDeliverySearchInput,
    CursorPaginationOptions
  >;
