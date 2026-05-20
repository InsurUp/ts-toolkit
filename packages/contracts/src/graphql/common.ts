/**
 * @fileoverview Common GraphQL Types
 * @description Shared types for GraphQL operations including pagination and connection patterns
 */

// Re-export date types from common location
export { DateTime, DateOnly } from '../common.date.js';
import type { DateTime, DateOnly } from '../common.date.js';

/**
 * Information about pagination in a connection.
 */
export interface PageInfo {
  /**
   * Indicates whether more edges exist following the set defined by the clients arguments.
   */
  hasNextPage: boolean;

  /**
   * Indicates whether more edges exist prior the set defined by the clients arguments.
   */
  hasPreviousPage: boolean;

  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor?: string | null;

  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor?: string | null;
}

/**
 * Information about the offset pagination.
 */
export interface CollectionSegmentInfo {
  /**
   * Indicates whether more items exist following the set defined by the clients arguments.
   */
  hasNextPage: boolean;

  /**
   * Indicates whether more items exist prior the set defined by the clients arguments.
   */
  hasPreviousPage: boolean;
}

/**
 * Generic interface for a connection edge
 */
export interface Edge<T> {
  /**
   * A cursor for use in pagination.
   */
  cursor: string;

  /**
   * The item at the end of the edge.
   */
  node?: T | null;
}

/**
 * Generic interface for a connection
 */
export interface Connection<T> {
  /**
   * Information to aid in pagination.
   */
  pageInfo: PageInfo;

  /**
   * A list of edges.
   */
  edges?: Edge<T>[] | null;

  /**
   * A flattened list of the nodes.
   */
  nodes?: (T | null)[] | null;

  /**
   * Identifies the total count of items in the connection.
   * Only present when includeTotalCount is true (default).
   */
  totalCount: number;
}

/**
 * Connection type with optional totalCount (when includeTotalCount is false)
 */
export interface ConnectionWithOptionalCount<T> extends Omit<Connection<T>, 'totalCount'> {
  totalCount?: number;
}

/**
 * Sort direction enum
 */
export enum SortEnumType {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Score modification options. Specify either boost or constant, but not both.
 */
export interface SearchScoreInput {
  /**
   * Multiply the score by a given value or by the value of a numeric field
   */
  boost?: number | null;

  /**
   * Replace the score with a constant value
   */
  constant?: number | null;
}

/**
 * Input for text search operations with optional score modification
 */
export interface SearchTextInput {
  /**
   * The search query string
   */
  value: string;

  /**
   * Optional score modification options
   */
  score?: SearchScoreInput | null;
}

/**
 * Input for `in` / `nin` search operations with optional score modification
 * applied to the whole clause.
 */
export interface SearchTextListInput {
  /**
   * The list of values to match against
   */
  values: string[];

  /**
   * Optional score modification options applied to the whole clause
   */
  score?: SearchScoreInput | null;
}

// === Filter Operation Inputs ===

export interface BooleanOperationFilterInput {
  eq?: boolean | null;
  neq?: boolean | null;
}

export interface StringOperationFilterInput {
  and?: StringOperationFilterInput[] | null;
  or?: StringOperationFilterInput[] | null;
  eq?: string | null;
  neq?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
  contains?: string | null;
  notContains?: string | null;
  startsWith?: string | null;
  notStartsWith?: string | null;
  endsWith?: string | null;
  notEndsWith?: string | null;
}

/**
 * Filter input for scalar string arrays (e.g. `agentBranchIds`).
 * Mirrors `filtering_FilterScalarListOperationFilterInputTypeOfStringTypeFilterInput`.
 */
export interface StringListOperationFilterInput {
  and?: StringListOperationFilterInput[] | null;
  or?: StringListOperationFilterInput[] | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
  eq?: (string | null)[] | null;
}

export interface IntOperationFilterInput {
  eq?: number | null;
  neq?: number | null;
  in?: (number | null)[] | null;
  nin?: (number | null)[] | null;
  gt?: number | null;
  ngt?: number | null;
  gte?: number | null;
  ngte?: number | null;
  lt?: number | null;
  nlt?: number | null;
  lte?: number | null;
  nlte?: number | null;
}

export interface FloatOperationFilterInput {
  eq?: number | null;
  neq?: number | null;
  in?: (number | null)[] | null;
  nin?: (number | null)[] | null;
  gt?: number | null;
  ngt?: number | null;
  gte?: number | null;
  ngte?: number | null;
  lt?: number | null;
  nlt?: number | null;
  lte?: number | null;
  nlte?: number | null;
}

/** Acceptable date/time value for filter inputs */
type DateTimeValue = string | DateTime | Date;

/** Acceptable date-only value for filter inputs */
type DateOnlyValue = string | DateOnly | Date;

export interface DateTimeOperationFilterInput {
  eq?: DateTimeValue | null;
  neq?: DateTimeValue | null;
  in?: (DateTimeValue | null)[] | null;
  nin?: (DateTimeValue | null)[] | null;
  gt?: DateTimeValue | null;
  ngt?: DateTimeValue | null;
  gte?: DateTimeValue | null;
  ngte?: DateTimeValue | null;
  lt?: DateTimeValue | null;
  nlt?: DateTimeValue | null;
  lte?: DateTimeValue | null;
  nlte?: DateTimeValue | null;
}

export interface LocalDateOperationFilterInput {
  eq?: DateOnlyValue | null;
  neq?: DateOnlyValue | null;
  in?: (DateOnlyValue | null)[] | null;
  nin?: (DateOnlyValue | null)[] | null;
  gt?: DateOnlyValue | null;
  ngt?: DateOnlyValue | null;
  gte?: DateOnlyValue | null;
  ngte?: DateOnlyValue | null;
  lt?: DateOnlyValue | null;
  nlt?: DateOnlyValue | null;
  lte?: DateOnlyValue | null;
  nlte?: DateOnlyValue | null;
}

export interface UuidOperationFilterInput {
  eq?: string | null;
  neq?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
  gt?: string | null;
  ngt?: string | null;
  gte?: string | null;
  ngte?: string | null;
  lt?: string | null;
  nlt?: string | null;
  lte?: string | null;
  nlte?: string | null;
}

// === Search Operation Inputs ===

/**
 * Permissive `SearchTextInput` slot: callers may pass a bare string as
 * shorthand for `{ value: '...' }`. The SDK normalizes to the wire shape
 * before serialization (see `normalizeSearchInput` in `@insurup/sdk`).
 */
export type SearchTextInputValue = string | SearchTextInput;

/**
 * Permissive `SearchTextListInput` slot: `['a','b']` is shorthand for
 * `{ values: ['a','b'] }`. Normalized by the SDK.
 */
export type SearchTextListInputValue = string[] | SearchTextListInput;

export interface SearchStringOperationFilterInput {
  and?: SearchStringOperationFilterInput[] | null;
  or?: SearchStringOperationFilterInput[] | null;
  eq?: SearchTextInputValue | null;
  neq?: SearchTextInputValue | null;
  in?: SearchTextListInputValue | null;
  nin?: SearchTextListInputValue | null;
  textSearch?: SearchTextInputValue | null;
  wildcard?: SearchTextInputValue | null;
  autocomplete?: SearchTextInputValue | null;
  contains?: SearchTextInputValue | null;
  notContains?: SearchTextInputValue | null;
  startsWith?: SearchTextInputValue | null;
  notStartsWith?: SearchTextInputValue | null;
  endsWith?: SearchTextInputValue | null;
  notEndsWith?: SearchTextInputValue | null;
}

// === Generic Filter/Search Input Types ===

/**
 * Generic enum filter input. Works with any enum type.
 */
export interface EnumOperationFilterInput<T> {
  eq?: T | null;
  neq?: T | null;
  in?: (T | null)[] | null;
  nin?: (T | null)[] | null;
}

/**
 * Generic list/array filter input. Used for filtering array fields.
 */
export interface ListFilterInputType<T> {
  all?: T | null;
  none?: T | null;
  some?: T | null;
  any?: boolean | null;
}

// === Unified filter/search input ===

/**
 * Marker added to a per-field value to promote it to a server-side search
 * (routed to the GraphQL `search:` slot) instead of a filter.
 */
export const SEARCH_MARKER = '$search' as const;

/**
 * Add the `$search: true` marker to a value type. Carries `$search: true` as a
 * literal discriminant; pairs with `FilterMarked<T>` (which has `$search?: never`)
 * to give the unified union a real discriminated-union shape so TypeScript can
 * narrow on `$search` without literal-widening hazards.
 */
export type SearchMarked<T> = T & { $search: true };

/**
 * Add a `$search?: never` "anti-marker" to a filter value type. With this on
 * the filter branch and `$search: true` on the search branch, the per-field
 * union is a discriminated union of two disjoint object types.
 */
export type FilterMarked<T> = T & { $search?: never };

/**
 * Unified per-field filter/search input.
 *
 * Consumers express both filter and search criteria through a single object
 * shape. Each field's value is either:
 *  - its filter-ops shape (routed to the server `filter:` slot), or
 *  - its search-ops shape carrying `$search: true` (routed to the server
 *    `search:` slot).
 *
 * The table adapter splits the unified value into the two server slots at
 * fetch time and strips the marker.
 *
 * Combinators (`and` / `or`) are supported recursively. The splitter routes
 * each combinator's items into the matching server-side combinator slot:
 *   - `and: [...]` is split into `server.filter.and` and `server.search.and`
 *     per item; this preserves semantics because the server already AND's
 *     the two slots together.
 *   - `or: [...]` likewise routes per item, but **OR semantics across filter
 *     and search are not preserved by splitting** — the server AND's the two
 *     slots, so an OR clause that mixes filter and search keys becomes an
 *     implicit AND between buckets at the wire level. Keep each OR item
 *     homogeneous (all filter, or all search) if intent matters.
 */
export type UnifiedFilterInput<TFilter, TSearch> = {
  // Fields filterable only
  [K in Exclude<keyof TFilter, keyof TSearch | 'and' | 'or'>]?: FilterMarked<
    NonNullable<TFilter[K]>
  > | null;
} & {
  // Fields searchable only
  [K in Exclude<keyof TSearch, keyof TFilter | 'and' | 'or'>]?: SearchMarked<
    NonNullable<TSearch[K]>
  > | null;
} & {
  // Fields both filterable and searchable
  [K in Exclude<keyof TFilter & keyof TSearch, 'and' | 'or'>]?:
    | FilterMarked<NonNullable<TFilter[K]>>
    | SearchMarked<NonNullable<TSearch[K]>>
    | null;
} & {
  // Logical combinators — recursive
  and?: UnifiedFilterInput<TFilter, TSearch>[] | null;
  or?: UnifiedFilterInput<TFilter, TSearch>[] | null;
};

/**
 * Generic query options for GraphQL connection queries.
 *
 * The `filter` field carries the **unified** filter+search shape — per-field
 * entries with `$search: true` are routed to the GraphQL `search:` slot by
 * the SDK at request time; plain entries go to the `filter:` slot. Consumers
 * never construct the two-slot wire shape directly.
 */
export interface GetQueryOptions<TFieldKey extends string, TUnifiedFilter, TSort> {
  /** Fields to select from the query */
  select?: TFieldKey[];
  /** Returns the first _n_ elements from the list */
  first?: number | null;
  /** Returns the elements in the list that come after the specified cursor */
  after?: string | null;
  /** Returns the last _n_ elements from the list */
  last?: number | null;
  /** Returns the elements in the list that come before the specified cursor */
  before?: string | null;
  /**
   * Unified filter + search criteria. Per-field map; entries with
   * `$search: true` are routed to the server's search slot at request time.
   */
  filter?: TUnifiedFilter | null;
  /** Sort order */
  order?: TSort[] | null;
  /**
   * Whether to include totalCount in the response.
   * Set to false to improve query performance when count is not needed.
   * @default true
   */
  includeTotalCount?: boolean;
}

// === Field Selection Utility Types ===

/**
 * Extracts element type from arrays, unwraps nullable types.
 */
type UnwrapType<T> = T extends (infer E)[] ? E : NonNullable<T>;

/**
 * Checks if a type is a nested object (not primitive/Date/DateTime/DateOnly).
 */
type IsNestedObject<T> = T extends
  | string
  | number
  | boolean
  | Date
  | DateTime
  | DateOnly
  | null
  | undefined
  ? false
  : T extends object
    ? true
    : false;

/**
 * Generic utility to create field keys with nested dot-notation paths.
 * - Primitive fields: "id", "name" (as-is)
 * - Objects/Arrays: ONLY nested paths allowed, e.g. "agentBranch.id", "consents.consentType"
 * - Parent keys alone ("agentBranch", "consents") are NOT in the union
 *
 * @example
 * interface User {
 *   id: string;
 *   profile: { name: string; age: number };
 *   tags: { label: string }[];
 * }
 * type UserFieldKey = DeepFieldKeys<User>;
 * // Result: "id" | "profile.name" | "profile.age" | "tags.label"
 */
export type DeepFieldKeys<T> = {
  [K in keyof T]-?: K extends string
    ? IsNestedObject<UnwrapType<T[K]>> extends true
      ? `${K}.${keyof UnwrapType<T[K]> & string}`
      : K
    : never;
}[keyof T];

/**
 * Extracts the parent key from a nested field path (e.g., "agentBranch.id" -> "agentBranch")
 */
export type ExtractParent<T extends string> = T extends `${infer Parent}.${string}`
  ? Parent
  : never;

/**
 * Checks if a field key is a nested path
 */
export type IsNestedPath<T extends string> = T extends `${string}.${string}` ? true : false;

/**
 * Extracts simple (non-nested) field keys from an array
 */
export type SimpleFields<T extends readonly string[]> = {
  [K in T[number]]: IsNestedPath<K> extends false ? K : never;
}[T[number]];

/**
 * Gets all unique parent keys from nested paths in an array
 */
export type NestedParents<T extends readonly string[]> = {
  [K in T[number]]: ExtractParent<K>;
}[T[number]];

/**
 * Gets all nested keys for a specific parent from an array
 */
export type NestedKeysForParent<T extends readonly string[], Parent extends string> = {
  [K in T[number]]: K extends `${Parent}.${infer Key}` ? Key : never;
}[T[number]];

/**
 * Helper to unwrap array element type
 */
export type UnwrapArray<T> = T extends (infer E)[] ? E : T;

/**
 * Generic helper type to pick selected fields from a model.
 * Handles both simple fields and nested paths:
 * - Simple fields: picked directly from Model
 * - Nested paths: parent field is included with picked nested fields
 */
export type PickFields<Model, T extends readonly string[]> = {
  // Simple fields
  [K in SimpleFields<T> & keyof Model]: Model[K];
} & {
  // Nested object fields (non-array)
  [K in NestedParents<T> & keyof Model as Model[K] extends unknown[] | null | undefined
    ? never
    : K]?: Pick<
    NonNullable<Model[K]>,
    NestedKeysForParent<T, K> & keyof NonNullable<Model[K]>
  > | null;
} & {
  // Nested array fields
  [K in NestedParents<T> & keyof Model as Model[K] extends unknown[] ? K : never]: Pick<
    UnwrapArray<Model[K]>,
    NestedKeysForParent<T, K> & keyof UnwrapArray<Model[K]>
  >[];
};

/**
 * Builds GraphQL field selection string from field keys with dot-notation support.
 * Groups nested field paths by their parent.
 *
 * @example
 * buildFieldSelection(["id", "name", "agentBranch.id", "agentBranch.name"])
 * // Returns: "id\nname\nagentBranch { id name }"
 *
 * @param fields Array of field keys (can include dot-notation for nested fields)
 * @param indent Indentation string for formatting (default: 12 spaces)
 */
export function buildFieldSelection(fields: readonly string[], indent = '            '): string {
  const simpleFields: string[] = [];
  const nestedFields: Map<string, string[]> = new Map();

  for (const field of fields) {
    const dotIndex = field.indexOf('.');
    if (dotIndex !== -1) {
      const parent = field.slice(0, dotIndex);
      const nested = field.slice(dotIndex + 1);
      if (!nestedFields.has(parent)) {
        nestedFields.set(parent, []);
      }
      nestedFields.get(parent)!.push(nested);
    } else {
      simpleFields.push(field);
    }
  }

  const selections: string[] = [...simpleFields];

  for (const [parent, nestedKeys] of nestedFields) {
    selections.push(`${parent} { ${nestedKeys.join(' ')} }`);
  }

  return selections.join(`\n${indent}`);
}
