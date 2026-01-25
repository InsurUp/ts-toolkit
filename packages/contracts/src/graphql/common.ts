/**
 * @fileoverview Common GraphQL Types
 * @description Shared types for GraphQL operations including pagination and connection patterns
 */

// Re-export date types from common location
export { DateTime, DateOnly } from "../common.date.js";
import type { DateTime, DateOnly } from "../common.date.js";

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
export interface ConnectionWithOptionalCount<T>
  extends Omit<Connection<T>, "totalCount"> {
  totalCount?: number;
}

/**
 * Sort direction enum
 */
export enum SortEnumType {
  ASC = "ASC",
  DESC = "DESC",
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
  contains?: string | null;
  ncontains?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
  startsWith?: string | null;
  nstartsWith?: string | null;
  endsWith?: string | null;
  nendsWith?: string | null;
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

export interface SearchStringOperationFilterInput {
  and?: SearchStringOperationFilterInput[] | null;
  or?: SearchStringOperationFilterInput[] | null;
  eq?: string | null;
  neq?: string | null;
  in?: (string | null)[] | null;
  nin?: (string | null)[] | null;
  textSearch?: SearchTextInput | null;
  wildcard?: SearchTextInput | null;
  autocomplete?: SearchTextInput | null;
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

/**
 * Maps TypeScript types to their corresponding GraphQL filter input types.
 * - DateTime → DateTimeOperationFilterInput
 * - DateOnly → LocalDateOperationFilterInput
 * - Date → DateTimeOperationFilterInput
 * - string → StringOperationFilterInput
 * - number → IntOperationFilterInput
 * - boolean → BooleanOperationFilterInput
 * - arrays → ListFilterInputType with recursive ModelFilterInput
 * - objects → recursive ModelFilterInput
 * - enums → EnumOperationFilterInput
 */
export type FilterInputForType<T> = T extends DateTime
  ? DateTimeOperationFilterInput
  : T extends DateOnly
    ? LocalDateOperationFilterInput
    : T extends Date
      ? DateTimeOperationFilterInput
      : T extends string
        ? StringOperationFilterInput
        : T extends number
          ? IntOperationFilterInput
          : T extends boolean
            ? BooleanOperationFilterInput
            : T extends unknown[]
              ? ListFilterInputType<ModelFilterInput<UnwrapArray<T>>>
              : T extends Record<string, unknown>
                ? ModelFilterInput<T>
                : EnumOperationFilterInput<NonNullable<T>>;

/**
 * Auto-generates a filter input type from any model.
 * Includes and/or combinators and maps each field to its appropriate filter type.
 *
 * @example
 * type CustomerFilter = ModelFilterInput<QueryCustomerModel>;
 * // Generates: { and?, or?, id?, name?, type?, agentBranch?, consents?, ... }
 */
export type ModelFilterInput<T> = {
  and?: ModelFilterInput<T>[] | null;
  or?: ModelFilterInput<T>[] | null;
} & {
  [K in keyof T]?: FilterInputForType<NonNullable<T[K]>> | null;
};

/**
 * Maps TypeScript types to their corresponding GraphQL search input types.
 * Similar to FilterInputForType but uses SearchStringOperationFilterInput for strings.
 * Dates use the same filter inputs as in FilterInputForType.
 */
export type SearchInputForType<T> = T extends DateTime
  ? DateTimeOperationFilterInput
  : T extends DateOnly
    ? LocalDateOperationFilterInput
    : T extends Date
      ? DateTimeOperationFilterInput
      : T extends string
        ? SearchStringOperationFilterInput
        : T extends number
          ? IntOperationFilterInput
          : T extends boolean
            ? BooleanOperationFilterInput
            : T extends unknown[]
              ? ListFilterInputType<ModelSearchInput<UnwrapArray<T>>>
              : T extends Record<string, unknown>
                ? ModelSearchInput<T>
                : EnumOperationFilterInput<NonNullable<T>>;

/**
 * Auto-generates a search input type from any model.
 * Similar to ModelFilterInput but uses search-specific string operations.
 *
 * @example
 * type CustomerSearch = ModelSearchInput<QueryCustomerModel>;
 */
export type ModelSearchInput<T> = {
  and?: ModelSearchInput<T>[] | null;
  or?: ModelSearchInput<T>[] | null;
} & {
  [K in keyof T]?: SearchInputForType<NonNullable<T[K]>> | null;
};

/**
 * Generic query options for GraphQL connection queries.
 * Includes pagination, filtering, searching, and sorting.
 */
export interface GetQueryOptions<
  TFieldKey extends string = string,
  TFilter = unknown,
  TSearch = unknown,
  TSort = unknown,
> {
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
  /** Search criteria */
  search?: TSearch | null;
  /** Filter criteria */
  filter?: TFilter | null;
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
export type ExtractParent<T extends string> =
  T extends `${infer Parent}.${string}` ? Parent : never;

/**
 * Checks if a field key is a nested path
 */
export type IsNestedPath<T extends string> = T extends `${string}.${string}`
  ? true
  : false;

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
export type NestedKeysForParent<
  T extends readonly string[],
  Parent extends string,
> = {
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
  [K in NestedParents<T> & keyof Model as Model[K] extends
    | unknown[]
    | null
    | undefined
    ? never
    : K]?: Pick<
    NonNullable<Model[K]>,
    NestedKeysForParent<T, K> & keyof NonNullable<Model[K]>
  > | null;
} & {
  // Nested array fields
  [K in NestedParents<T> & keyof Model as Model[K] extends unknown[]
    ? K
    : never]: Pick<
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
export function buildFieldSelection(
  fields: readonly string[],
  indent = "            ",
): string {
  const simpleFields: string[] = [];
  const nestedFields: Map<string, string[]> = new Map();

  for (const field of fields) {
    const dotIndex = field.indexOf(".");
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
    selections.push(`${parent} { ${nestedKeys.join(" ")} }`);
  }

  return selections.join(`\n${indent}`);
}
