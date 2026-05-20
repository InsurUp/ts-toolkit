import type { UnifiedFilterInput } from '@insurup/contracts';
import { normalizeSearchInput } from './normalize-search.js';
import { splitUnifiedFilter } from './split-unified-filter.js';

/**
 * Splits a unified filter, normalizes the search half's shorthand, and returns
 * an object with `filter` / `search` keys — each omitted when its slot is empty.
 * Spread into the GraphQL variables literal so the wire payload doesn't carry
 * explicit `undefined` slots.
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
