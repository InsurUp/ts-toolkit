/**
 * @fileoverview Split a unified filter input into the server's `filter` and
 * `search` slots.
 *
 * Consumers express filter+search as one per-field object via `UnifiedFilterInput`.
 * Each entry whose value carries `$search: true` is routed to the GraphQL
 * `search:` slot (marker stripped); plain entries go to `filter:`. `and`/`or`
 * combinators recurse per item — each item's filter half lands in the
 * destination's `and`/`or` array on the filter side, search half on the
 * search side. See `UnifiedFilterInput`'s JSDoc for the OR semantics caveat.
 */

import type { SearchMarked, UnifiedFilterInput } from '@insurup/contracts';

export interface SplitResult<TFilter, TSearch> {
  filter: TFilter | undefined;
  search: TSearch | undefined;
}

type Dict = Readonly<Record<string, unknown>>;

const isObject = (v: unknown): v is Dict =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const isSearchMarked = (v: unknown): v is SearchMarked<Dict> => isObject(v) && v.$search === true;

const stripMarker = ({ $search: _marker, ...rest }: SearchMarked<Dict>): Dict => rest;

const nonEmpty = (o: Dict): boolean => Object.keys(o).length > 0;

/**
 * Public entry point. Splits a unified filter input into the two server slots.
 * The single cast (input boundary → internal `Dict`, return → `TFilter`/`TSearch`)
 * is contained here; the recursive worker is fully predicate-typed.
 */
export function splitUnifiedFilter<TFilter, TSearch>(
  input: UnifiedFilterInput<TFilter, TSearch> | null | undefined
): SplitResult<TFilter, TSearch> {
  if (input == null) return { filter: undefined, search: undefined };
  const { filter, search } = splitNode(input as unknown as Dict);
  return {
    filter: filter as TFilter | undefined,
    search: search as TSearch | undefined,
  };
}

function splitNode(node: Dict): { filter: Dict | undefined; search: Dict | undefined } {
  const filter: Record<string, unknown> = {};
  const search: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(node)) {
    if ((key === 'and' || key === 'or') && Array.isArray(value)) {
      const filterItems: unknown[] = [];
      const searchItems: Dict[] = [];
      for (const item of value) {
        if (!isObject(item)) {
          // Non-object items can't carry a $search marker; preserve them on
          // the filter side instead of silently dropping. The type system
          // forbids this in normal usage, but a bad runtime input here would
          // otherwise vanish without trace.
          filterItems.push(item);
          continue;
        }
        const split = splitNode(item);
        if (split.filter) filterItems.push(split.filter);
        if (split.search) searchItems.push(split.search);
      }
      if (filterItems.length > 0) filter[key] = filterItems;
      if (searchItems.length > 0) search[key] = searchItems;
    } else if (isSearchMarked(value)) {
      search[key] = stripMarker(value);
    } else {
      filter[key] = value;
    }
  }

  return {
    filter: nonEmpty(filter) ? filter : undefined,
    search: nonEmpty(search) ? search : undefined,
  };
}
