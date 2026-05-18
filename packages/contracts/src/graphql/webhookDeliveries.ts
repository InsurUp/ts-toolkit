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
  ModelFilterInput,
  ModelSearchInput,
  GetQueryOptions,
} from './common.js';
import type { DateTime } from '../common.date.js';
import type { WebhookEvent } from '../webhooks.js';

// === Enums ===

/**
 * Webhook Delivery State
 * Represents the current status of a webhook delivery attempt
 */
export enum WebhookDeliveryState {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

// === Output Types ===

/** @meta */
export interface QueryWebhookDeliveryResult {
  id: string;
  webhookId: string;
  webhookName?: string | null;
  event: WebhookEvent;
  state: WebhookDeliveryState;
  responseStatusCode?: number | null;
  createdAt: DateTime;
  completedAt?: DateTime | null;
  retryCount: number;
}

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryWebhookDeliveryResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryWebhookDeliveryResultFilterInput = ModelFilterInput<QueryWebhookDeliveryResult>;

/**
 * Search input for QueryWebhookDeliveryResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryWebhookDeliveryResultSearchInput = ModelSearchInput<QueryWebhookDeliveryResult>;

/**
 * Sort input for QueryWebhookDeliveryResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryWebhookDeliveryResultSortInput {
  event?: SortEnumType | null;
  state?: SortEnumType | null;
  responseStatusCode?: SortEnumType | null;
  createdAt?: SortEnumType | null;
  completedAt?: SortEnumType | null;
  retryCount?: SortEnumType | null;
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
  'webhookName',
  'event',
  'state',
  'responseStatusCode',
  'createdAt',
  'completedAt',
  'retryCount',
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
  QueryWebhookDeliveryResultFilterInput,
  QueryWebhookDeliveryResultSearchInput,
  QueryWebhookDeliveryResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
