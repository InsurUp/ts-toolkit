/**
 * @fileoverview Webhook Delivery Table Types
 */

import type {
  GetWebhookDeliveriesOptions,
  WebhookDeliveryFieldKey,
  QueryWebhookDeliveryResult,
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
  QueryWebhookDeliveryResultUnifiedFilterInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

export type {
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
  QueryWebhookDeliveryResultUnifiedFilterInput,
} from '@insurup/sdk';

export type WebhookDeliveryColumnDef = AnyColumnDef<WebhookDeliveryFieldKey>;

export type WebhookDeliveryExtractFields<TColumns extends readonly WebhookDeliveryColumnDef[]> =
  EntityExtractFields<TColumns, WebhookDeliveryFieldKey>;

export type WebhookDeliveryRowType<TColumns extends readonly WebhookDeliveryColumnDef[]> =
  PickFields<QueryWebhookDeliveryResult, readonly WebhookDeliveryExtractFields<TColumns>[]>;

export type WebhookDeliveryFetchFn<
  TRow = QueryWebhookDeliveryResult,
  TFields extends WebhookDeliveryFieldKey[] = WebhookDeliveryFieldKey[],
> = EntityFetchFn<TRow, GetWebhookDeliveriesOptions<TFields>>;

export type WebhookDeliveryFilterInput = QueryWebhookDeliveryResultFilterInput;
export type WebhookDeliverySearchInput = QueryWebhookDeliveryResultSearchInput;
export type WebhookDeliveryUnifiedFilterInput = QueryWebhookDeliveryResultUnifiedFilterInput;

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
    WebhookDeliveryUnifiedFilterInput,
    CursorPaginationOptions
  >;
