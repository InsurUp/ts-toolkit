/**
 * @fileoverview Normalize permissive search input shorthand to the wire shape.
 *
 * The `SearchStringOperationFilterInput` type accepts both:
 *   - bare strings (e.g. `textSearch: 'ali'`) which mean `{ value: 'ali' }`
 *   - bare string arrays (e.g. `in: ['a', 'b']`) which mean `{ values: ['a', 'b'] }`
 *   - the long forms (e.g. `textSearch: { value: 'ali', score: { boost: 2 } }`)
 *
 * This helper converts shorthand to the wire shape before the SDK sends the
 * request to GraphQL. Long forms pass through untouched.
 */

/** Operator slots on `SearchStringOperationFilterInput` that take a SearchTextInput. */
const TEXT_INPUT_OPS = new Set([
  'eq',
  'neq',
  'textSearch',
  'wildcard',
  'autocomplete',
  'contains',
  'notContains',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith',
]);

/** Operator slots that take a SearchTextListInput. */
const TEXT_LIST_INPUT_OPS = new Set(['in', 'nin']);

/** Logical combinators on the search input. */
const COMBINATOR_OPS = new Set(['and', 'or']);

/**
 * Normalize a search input by converting any shorthand string / string[]
 * values to their wire-shape equivalents. Returns the input unchanged when
 * the input is null/undefined or already in the long form.
 *
 * Recurses into per-field SearchString objects and into `and` / `or`
 * combinator arrays.
 */
export function normalizeSearchInput<T>(search: T): T {
  if (search === null || search === undefined) return search;
  if (typeof search !== 'object') return search;
  return normalizeNode(search) as T;
}

function normalizeNode(node: unknown): unknown {
  if (node === null || typeof node !== 'object') return node;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (COMBINATOR_OPS.has(key) && Array.isArray(value)) {
      out[key] = value.map(normalizeNode);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Per-field SearchString object: normalize its operator slots.
      out[key] = normalizeStringOps(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function normalizeStringOps(field: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [op, value] of Object.entries(field)) {
    if (TEXT_INPUT_OPS.has(op) && typeof value === 'string') {
      out[op] = { value };
    } else if (TEXT_LIST_INPUT_OPS.has(op) && Array.isArray(value)) {
      out[op] = { values: value };
    } else if (COMBINATOR_OPS.has(op) && Array.isArray(value)) {
      out[op] = value.map((item) => normalizeStringOps(item as Record<string, unknown>));
    } else {
      out[op] = value;
    }
  }
  return out;
}
