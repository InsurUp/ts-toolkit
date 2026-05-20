/**
 * @fileoverview Type-level negative tests for `UnifiedFilterInput`.
 *
 * Uses vitest's `expectTypeOf` to assert that specific shapes are (or are
 * not) assignable to the per-entity unified filter input. Compile-time only;
 * the runtime body is `expect(true).toBe(true)` so vitest counts each case.
 *
 * Customer field mapping (from `customers.ts`):
 *   - `name`, `identityNumber`, …: filter (StringOperationFilterInput) AND
 *     search (SearchStringOperationFilterInput)
 *   - `id`, `type`, `birthDate`, `createdAt`, `gender`, …: filter-only
 *   - (no fields are search-only on customer)
 *
 * Webhook delivery (from `webhookDeliveries.ts`):
 *   - `errorMessage`: filter AND search
 *   - `id`, `webhookId`, `event`, …: filter-only
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { QueryCustomerModelUnifiedFilterInput } from '../../src/graphql/customers.js';
import type { QueryWebhookDeliveryResultUnifiedFilterInput } from '../../src/graphql/webhookDeliveries.js';
import type { CustomerType } from '../../src/common.js';
import type { WebhookEvent } from '../../src/webhooks.js';

describe('UnifiedFilterInput compile-time guards (positive)', () => {
  it('accepts the well-formed filter shape', () => {
    expectTypeOf<{
      type: { eq: CustomerType.Individual };
      name: { contains: 'ali' };
      birthDate: { gte: '1990-01-01' };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('accepts the well-formed search shape', () => {
    expectTypeOf<{
      name: { $search: true; textSearch: 'ali' };
      identityNumber: { $search: true; eq: { value: '123' } };
      taxNumber: { $search: true; in: ['1', '2'] };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('accepts mixed filter + search in one shape', () => {
    expectTypeOf<{
      type: { eq: CustomerType.Individual };
      name: { $search: true; textSearch: { value: 'ali'; score: { boost: 2 } } };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('accepts score.constant on a SearchTextInput slot', () => {
    expectTypeOf<{
      name: { $search: true; contains: { value: 'a'; score: { constant: 5 } } };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('accepts $search on the only searchable field of WebhookDelivery (errorMessage)', () => {
    expectTypeOf<{
      errorMessage: { $search: true; textSearch: 'timeout' };
    }>().toExtend<QueryWebhookDeliveryResultUnifiedFilterInput>();
    expect(true).toBe(true);
  });
});

describe('UnifiedFilterInput compile-time guards (negative)', () => {
  it('rejects `$search: true` on a filter-only field (Customer.type)', () => {
    expectTypeOf<{
      type: { $search: true; eq: CustomerType.Individual };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects a search-only operator on a non-$search-marked entry (Customer.name)', () => {
    // `textSearch` belongs only to SearchStringOperationFilterInput. Without
    // `$search: true`, the value is typed as StringOperationFilterInput
    // (the filter branch), which has no `textSearch` slot.
    expectTypeOf<{
      name: { textSearch: 'ali' };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects an unknown field on the customer filter shape', () => {
    expectTypeOf<{
      unknownField: { eq: 'x' };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects `$search: true` on a filter-only field of WebhookDelivery (event)', () => {
    expectTypeOf<{
      event: { $search: true; eq: WebhookEvent.PolicyCreated };
    }>().not.toExtend<QueryWebhookDeliveryResultUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects a search-only operator on the non-searchable webhook field `webhookId`', () => {
    expectTypeOf<{
      webhookId: { $search: true; textSearch: 'x' };
    }>().not.toExtend<QueryWebhookDeliveryResultUnifiedFilterInput>();
    expect(true).toBe(true);
  });
});
