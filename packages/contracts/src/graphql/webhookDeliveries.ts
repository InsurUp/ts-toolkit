/**
 * @fileoverview Webhook Delivery GraphQL Types
 * @description Types for querying webhook deliveries via GraphQL
 */

import type {
  Connection,
  Edge,
  SortEnumType,
  DeepFieldKeys,
  PickFields,
  GetQueryOptions,
  StringOperationFilterInput,
  IntOperationFilterInput,
  BooleanOperationFilterInput,
  DateTimeOperationFilterInput,
  EnumOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime } from '../common.date.js';
import type { WebhookEvent } from '../webhooks.js';

// === Output Types ===

/** @meta */
export interface QueryWebhookDeliveryResult {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  sentAt: DateTime;
  statusCode?: number | null;
  response?: string | null;
  errorMessage?: string | null;
  payload: string;
  durationMs: number;
  isSuccess: boolean;
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryWebhookDeliveryResultFilterInput,
// searching_QueryWebhookDeliveryResultFilterInput.

export interface QueryWebhookDeliveryResultFilterInput {
  and?: QueryWebhookDeliveryResultFilterInput[] | null;
  or?: QueryWebhookDeliveryResultFilterInput[] | null;
  id?: StringOperationFilterInput | null;
  webhookId?: StringOperationFilterInput | null;
  event?: EnumOperationFilterInput<WebhookEvent> | null;
  sentAt?: DateTimeOperationFilterInput | null;
  statusCode?: IntOperationFilterInput | null;
  response?: StringOperationFilterInput | null;
  errorMessage?: StringOperationFilterInput | null;
  payload?: StringOperationFilterInput | null;
  durationMs?: IntOperationFilterInput | null;
  isSuccess?: BooleanOperationFilterInput | null;
}

export interface QueryWebhookDeliveryResultSearchInput {
  and?: QueryWebhookDeliveryResultSearchInput[] | null;
  or?: QueryWebhookDeliveryResultSearchInput[] | null;
  errorMessage?: SearchStringOperationFilterInput | null;
}

export type QueryWebhookDeliveryResultUnifiedFilterInput = UnifiedFilterInput<
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput
>;

/**
 * Sort input for QueryWebhookDeliveryResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryWebhookDeliveryResultSortInput {
  sentAt?: SortEnumType | null;
  statusCode?: SortEnumType | null;
  durationMs?: SortEnumType | null;
}

// === Connection Types ===

export type WebhookDeliveriesEdge = Edge<QueryWebhookDeliveryResult>;
export type WebhookDeliveriesConnection<
  TFields extends readonly WebhookDeliveryFieldKey[] = readonly WebhookDeliveryFieldKey[],
> = Connection<PickWebhookDeliveryFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryWebhookDeliveryResult.
 */
export type WebhookDeliveryFieldKey = DeepFieldKeys<QueryWebhookDeliveryResult>;

/**
 * Runtime array of all webhook delivery field keys.
 */
export const ALL_WEBHOOK_DELIVERY_FIELDS = [
  'id',
  'webhookId',
  'event',
  'sentAt',
  'statusCode',
  'response',
  'errorMessage',
  'payload',
  'durationMs',
  'isSuccess',
] as const satisfies readonly WebhookDeliveryFieldKey[];

/**
 * Helper type to pick selected fields from QueryWebhookDeliveryResult.
 */
export type PickWebhookDeliveryFields<T extends readonly WebhookDeliveryFieldKey[]> = PickFields<
  QueryWebhookDeliveryResult,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedWebhookDeliveriesConnection<
  TFields extends WebhookDeliveryFieldKey[],
> extends Omit<WebhookDeliveriesConnection, 'nodes' | 'edges'> {
  nodes?: (PickWebhookDeliveryFields<TFields> | null)[] | null;
  edges?:
    | (Omit<WebhookDeliveriesEdge, 'node'> & {
        node?: PickWebhookDeliveryFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getWebhookDeliveries query.
 * Extends GetQueryOptions with webhook delivery-specific types.
 */
export interface GetWebhookDeliveriesOptions<
  TFields extends WebhookDeliveryFieldKey[] = WebhookDeliveryFieldKey[],
> extends GetQueryOptions<
  WebhookDeliveryFieldKey,
  QueryWebhookDeliveryResultUnifiedFilterInput,
  QueryWebhookDeliveryResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
