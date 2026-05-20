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
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { QueryCustomerModelUnifiedFilterInput } from '../../src/graphql/customers.js';
import type { CustomerType } from '../../src/common.js';

describe('UnifiedFilterInput compile-time guards (positive)', () => {
  it('accepts a mixed filter + search shape, including search score boosts', () => {
    // Covers: filter-only field (`type`), search-marked field with full
    // SearchTextInput shape (`name`), and the SearchScoreInput.boost path.
    expectTypeOf<{
      type: { eq: CustomerType.Individual };
      name: { $search: true; textSearch: { value: 'ali'; score: { boost: 2 } } };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('accepts `score.constant` on a search slot (the alternative score shape)', () => {
    expectTypeOf<{
      name: { $search: true; contains: { value: 'a'; score: { constant: 5 } } };
    }>().toExtend<QueryCustomerModelUnifiedFilterInput>();
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

  it('rejects a search-only operator on a non-$search-marked entry', () => {
    // `textSearch` belongs only to SearchStringOperationFilterInput. Without
    // `$search: true`, the value is typed as StringOperationFilterInput
    // (the filter branch), which has no `textSearch` slot.
    expectTypeOf<{
      name: { textSearch: 'ali' };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects a mixed filter+search operator object without the `$search` marker', () => {
    // Soundness probe for the discriminated union: a single field-value object
    // that mixes a filter op (`contains`) with a search-only op (`textSearch`)
    // must not satisfy either branch.
    expectTypeOf<{
      name: { contains: 'x'; textSearch: 'y' };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });

  it('rejects an unknown field on the filter shape', () => {
    expectTypeOf<{
      unknownField: { eq: 'x' };
    }>().not.toExtend<QueryCustomerModelUnifiedFilterInput>();
    expect(true).toBe(true);
  });
});
