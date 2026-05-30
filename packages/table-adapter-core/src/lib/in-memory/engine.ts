/**
 * @fileoverview In-memory query engine
 * @description Pure, framework-agnostic filter / sort / paginate helpers that
 * turn a fully-loaded array into a synthetic GraphQL `Connection`, so the
 * existing `BaseTableAdapter` pipeline can drive a non-GraphQL resource.
 */

import { SortEnumType } from '@insurup/sdk';
import type { Connection, PageInfo } from '@insurup/sdk';
import type { FieldPredicate, InMemoryFilterInput, InMemorySortInput } from './types.js';

/**
 * Read a possibly-nested dotted path (e.g. `'agentBranch.name'`) off a row.
 * Returns `undefined` if any segment along the path is nullish.
 */
export function getByPath(row: unknown, path: string): unknown {
  if (row == null) return undefined;
  if (!path.includes('.')) {
    return (row as Record<string, unknown>)[path];
  }
  let current: unknown = row;
  for (const segment of path.split('.')) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Parse an ISO-8601-ish date/datetime string (or Date) into epoch millis.
 * Returns `null` for anything that isn't clearly a date, so arbitrary strings
 * (e.g. ids) are never misinterpreted as dates during comparison.
 */
function toTime(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}|$)/.test(value)) {
    const time = Date.parse(value);
    return Number.isNaN(time) ? null : time;
  }
  return null;
}

/**
 * Ordering comparator used by both sorting and range predicates.
 * Numbers compare numerically, dates/date-strings chronologically, booleans
 * false-before-true, everything else via locale-aware string comparison.
 * Nullish values sort last.
 */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }
  const aTime = toTime(a);
  const bTime = toTime(b);
  if (aTime !== null && bTime !== null) return aTime - bTime;
  return String(a).localeCompare(String(b));
}

/** Equality with Date-awareness (primitive `===` otherwise). */
function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return false;
}

const RANGE_OPS = ['gt', 'gte', 'lt', 'lte'] as const;

/** Evaluate a single field's predicate against the field's value. */
function matchesPredicate(value: unknown, predicate: FieldPredicate<unknown>): boolean {
  if (predicate.eq !== undefined && !valuesEqual(value, predicate.eq)) return false;
  if (predicate.ne !== undefined && valuesEqual(value, predicate.ne)) return false;
  if (
    predicate.in !== undefined &&
    !predicate.in.some((candidate) => valuesEqual(value, candidate))
  ) {
    return false;
  }
  if (predicate.contains !== undefined) {
    if (typeof value !== 'string') return false;
    if (!value.toLowerCase().includes(predicate.contains.toLowerCase())) return false;
  }
  for (const op of RANGE_OPS) {
    const bound = predicate[op];
    if (bound === undefined) continue;
    if (value == null) return false;
    const cmp = compareValues(value, bound);
    if (op === 'gt' && !(cmp > 0)) return false;
    if (op === 'gte' && !(cmp >= 0)) return false;
    if (op === 'lt' && !(cmp < 0)) return false;
    if (op === 'lte' && !(cmp <= 0)) return false;
  }
  return true;
}

/**
 * Filter rows by an in-memory filter input. `$search` is matched as a
 * case-insensitive substring across `searchableFields`; per-field predicates
 * are AND-ed with each other and with the search.
 */
export function applyFilter<T>(
  rows: readonly T[],
  filter: InMemoryFilterInput<T> | undefined,
  searchableFields: readonly string[]
): T[] {
  if (!filter) return [...rows];

  const record = filter as Record<string, unknown>;
  const rawSearch = record.$search;
  const search = typeof rawSearch === 'string' ? rawSearch.trim().toLowerCase() : '';

  const fieldKeys = Object.keys(record).filter((key) => key !== '$search');

  return rows.filter((row) => {
    if (search) {
      const matched = searchableFields.some((field) => {
        const value = getByPath(row, field);
        return typeof value === 'string' && value.toLowerCase().includes(search);
      });
      if (!matched) return false;
    }

    for (const field of fieldKeys) {
      const predicate = record[field];
      if (predicate == null) continue;
      if (!matchesPredicate(getByPath(row, field), predicate as FieldPredicate<unknown>)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Stable multi-key sort from the SDK-style sort input array
 * (`[{ name: 'ASC' }, { createdAt: 'DESC' }]`). Nullish values sort last.
 */
export function applySort<T>(
  rows: readonly T[],
  order: readonly InMemorySortInput<string>[] | undefined
): T[] {
  if (!order || order.length === 0) return [...rows];

  const keys = order
    .map((entry) => {
      const field = Object.keys(entry)[0];
      if (field === undefined) return null;
      return { field, desc: entry[field] === SortEnumType.DESC };
    })
    .filter((key): key is { field: string; desc: boolean } => key !== null);

  if (keys.length === 0) return [...rows];

  return [...rows].sort((a, b) => {
    for (const { field, desc } of keys) {
      const cmp = compareValues(getByPath(a, field), getByPath(b, field));
      if (cmp !== 0) return desc ? -cmp : cmp;
    }
    return 0;
  });
}

/**
 * Slice already-filtered/sorted rows into a synthetic `Connection`, encoding
 * the offset as an opaque cursor string. The cursor manager only reads
 * `endCursor` + `hasNextPage`, so this satisfies cursor-style prev/next.
 */
export function sliceToConnection<T>(
  rows: readonly T[],
  first: number,
  after: string | undefined
): Connection<T> {
  const total = rows.length;
  const offset = parseOffset(after);
  const start = Math.min(offset, total);
  const end = Math.min(start + Math.max(first, 0), total);
  const nodes = rows.slice(start, end) as (T | null)[];

  const pageInfo: PageInfo = {
    hasNextPage: end < total,
    hasPreviousPage: start > 0,
    startCursor: String(start),
    endCursor: String(end),
  };

  return { nodes, edges: null, pageInfo, totalCount: total };
}

/** Decode an offset cursor; missing/invalid cursors resolve to offset 0. */
function parseOffset(after: string | undefined): number {
  if (after === undefined) return 0;
  const parsed = Number.parseInt(after, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}
