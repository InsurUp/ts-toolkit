/**
 * @fileoverview Build the `filter` / `search` slots of a GraphQL variables
 * object from a unified consumer-facing filter input.
 *
 * Resource clients all need the same three steps: split the unified input,
 * normalize the search half's shorthand, and only emit the slot keys that
 * are actually populated. This helper bundles them so every `get<Entities>`
 * call site stays consistent.
 */

import type { UnifiedFilterInput } from '@insurup/contracts';
import { normalizeSearchInput } from './normalize-search.js';
import { splitUnifiedFilter } from './split-unified-filter.js';

/**
 * Returns an object with `filter` and/or `search` keys, omitted entirely
 * when the respective slot is empty. Spread into the GraphQL variables
 * literal so the wire payload doesn't carry explicit `undefined` slots.
 */
export function buildFilterSearchVariables<TFilter, TSearch>(
  input: UnifiedFilterInput<TFilter, TSearch> | null | undefined
): { filter?: TFilter; search?: TSearch } {
  const { filter, search } = splitUnifiedFilter<TFilter, TSearch>(input);
  const out: { filter?: TFilter; search?: TSearch } = {};
  if (filter !== undefined) out.filter = filter;
  if (search !== undefined) out.search = normalizeSearchInput(search);
  return out;
}
