/**
 * @fileoverview In-memory engine unit tests
 * @description Covers the pure filter / sort / paginate transforms and the
 * caching/reset behaviour of `createInMemoryFetchFn`.
 */

import { describe, it, expect, vi } from 'vitest';
import { SortEnumType } from '@insurup/sdk';
import {
  getByPath,
  applyFilter,
  applySort,
  sliceToConnection,
} from '../../../src/lib/in-memory/engine.js';
import {
  createInMemoryFetchFn,
  type InMemoryQueryOptions,
} from '../../../src/lib/in-memory/fetch.js';
import { createSuccessResult, createClientError } from '../../utils/mocks.js';

interface Row {
  id: string;
  name: string;
  age: number;
  createdAt: string;
  active: boolean;
  branch?: { name: string } | null;
}

function row(overrides: Partial<Row> = {}): Row {
  return {
    id: 'r1',
    name: 'Alice',
    age: 30,
    createdAt: '2024-01-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

const people: Row[] = [
  row({
    id: 'r1',
    name: 'Alice',
    age: 30,
    createdAt: '2024-01-01T00:00:00Z',
    branch: { name: 'North' },
  }),
  row({
    id: 'r2',
    name: 'bob',
    age: 25,
    createdAt: '2023-06-15T00:00:00Z',
    branch: { name: 'South' },
  }),
  row({
    id: 'r3',
    name: 'Carol',
    age: 30,
    createdAt: '2024-03-10T00:00:00Z',
    active: false,
    branch: null,
  }),
  row({ id: 'r4', name: 'dave', age: 40, createdAt: '2022-12-31T00:00:00Z' }),
];

describe('getByPath', () => {
  it('reads top-level keys', () => {
    expect(getByPath({ a: 1 }, 'a')).toBe(1);
  });

  it('reads nested dotted paths', () => {
    expect(getByPath({ a: { b: 2 } }, 'a.b')).toBe(2);
  });

  it('returns undefined for missing or nullish segments', () => {
    expect(getByPath({ a: null }, 'a.b')).toBeUndefined();
    expect(getByPath(null, 'a')).toBeUndefined();
    expect(getByPath({}, 'x')).toBeUndefined();
  });
});

describe('applyFilter', () => {
  it('returns a copy of all rows when no filter is provided', () => {
    const result = applyFilter(people, undefined, ['name']);
    expect(result).toEqual(people);
    expect(result).not.toBe(people);
  });

  it('matches $search case-insensitively across searchable fields', () => {
    const result = applyFilter(people, { $search: 'car' }, ['name']);
    expect(result.map((r) => r.id)).toEqual(['r3']);
  });

  it('returns nothing when $search matches no searchable field', () => {
    expect(applyFilter(people, { $search: 'zzz' }, ['name'])).toHaveLength(0);
  });

  it('searches nested dotted fields', () => {
    const result = applyFilter(people, { $search: 'south' }, ['branch.name']);
    expect(result.map((r) => r.id)).toEqual(['r2']);
  });

  it('applies eq / ne / in predicates', () => {
    expect(applyFilter(people, { name: { eq: 'Alice' } }, []).map((r) => r.id)).toEqual(['r1']);
    expect(applyFilter(people, { age: { ne: 30 } }, []).map((r) => r.id)).toEqual(['r2', 'r4']);
    expect(applyFilter(people, { id: { in: ['r2', 'r4'] } }, []).map((r) => r.id)).toEqual([
      'r2',
      'r4',
    ]);
  });

  it('applies case-insensitive contains on strings only', () => {
    expect(applyFilter(people, { name: { contains: 'A' } }, []).map((r) => r.id)).toEqual([
      'r1',
      'r3',
      'r4',
    ]);
    // contains against a non-string field never matches
    expect(applyFilter(people, { age: { contains: '3' } }, [])).toHaveLength(0);
  });

  it('applies numeric range predicates', () => {
    expect(applyFilter(people, { age: { gte: 30, lt: 40 } }, []).map((r) => r.id)).toEqual([
      'r1',
      'r3',
    ]);
    expect(applyFilter(people, { age: { gt: 30 } }, []).map((r) => r.id)).toEqual(['r4']);
  });

  it('applies date-string range predicates', () => {
    const result = applyFilter(people, { createdAt: { gte: '2024-01-01' } }, []);
    expect(result.map((r) => r.id)).toEqual(['r1', 'r3']);
  });

  it('excludes nullish values from range predicates', () => {
    const rows: Row[] = [
      row({ id: 'a', age: 10 }),
      { ...row({ id: 'b' }), age: undefined as unknown as number },
    ];
    expect(applyFilter(rows, { age: { gte: 5 } }, []).map((r) => r.id)).toEqual(['a']);
  });

  it('ANDs $search with per-field predicates', () => {
    const result = applyFilter(people, { $search: 'a', age: { eq: 30 } }, ['name']);
    expect(result.map((r) => r.id)).toEqual(['r1', 'r3']);
  });
});

describe('applySort', () => {
  it('returns a copy when there is no order', () => {
    const result = applySort(people, undefined);
    expect(result).toEqual(people);
    expect(result).not.toBe(people);
  });

  it('sorts strings ascending and descending (locale-aware)', () => {
    const asc = applySort(people, [{ name: SortEnumType.ASC }]).map((r) => r.name);
    expect(asc).toEqual(['Alice', 'bob', 'Carol', 'dave']);
    const desc = applySort(people, [{ name: SortEnumType.DESC }]).map((r) => r.name);
    expect(desc).toEqual(['dave', 'Carol', 'bob', 'Alice']);
  });

  it('sorts numbers and dates', () => {
    expect(applySort(people, [{ age: SortEnumType.ASC }]).map((r) => r.id)).toEqual([
      'r2',
      'r1',
      'r3',
      'r4',
    ]);
    expect(applySort(people, [{ createdAt: SortEnumType.ASC }]).map((r) => r.id)).toEqual([
      'r4',
      'r2',
      'r1',
      'r3',
    ]);
  });

  it('breaks ties with secondary keys and is stable', () => {
    const result = applySort(people, [{ age: SortEnumType.ASC }, { name: SortEnumType.ASC }]);
    // r1 and r3 both age 30 → ordered by name (Alice before Carol)
    expect(result.map((r) => r.id)).toEqual(['r2', 'r1', 'r3', 'r4']);
  });

  it('sorts nullish values last', () => {
    const rows: Row[] = [
      row({ id: 'a', branch: { name: 'Z' } }),
      row({ id: 'b', branch: null }),
      row({ id: 'c', branch: { name: 'A' } }),
    ];
    const result = applySort(rows, [{ 'branch.name': SortEnumType.ASC }]).map((r) => r.id);
    expect(result).toEqual(['c', 'a', 'b']);
  });
});

describe('sliceToConnection', () => {
  const rows = [1, 2, 3, 4, 5];

  it('returns the first page with offset cursors', () => {
    const conn = sliceToConnection(rows, 2, undefined);
    expect(conn.nodes).toEqual([1, 2]);
    expect(conn.totalCount).toBe(5);
    expect(conn.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: '0',
      endCursor: '2',
    });
  });

  it('slices from an offset cursor', () => {
    const conn = sliceToConnection(rows, 2, '2');
    expect(conn.nodes).toEqual([3, 4]);
    expect(conn.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: true });
  });

  it('marks the last page', () => {
    const conn = sliceToConnection(rows, 2, '4');
    expect(conn.nodes).toEqual([5]);
    expect(conn.pageInfo.hasNextPage).toBe(false);
    expect(conn.pageInfo.hasPreviousPage).toBe(true);
  });

  it('returns an empty page past the end', () => {
    const conn = sliceToConnection(rows, 2, '99');
    expect(conn.nodes).toEqual([]);
    expect(conn.totalCount).toBe(5);
    expect(conn.pageInfo.hasNextPage).toBe(false);
  });
});

describe('createInMemoryFetchFn', () => {
  const rows = [row({ id: 'r1', name: 'Alice' }), row({ id: 'r2', name: 'bob' })];

  function vars(overrides: Partial<InMemoryQueryOptions<Row>> = {}): InMemoryQueryOptions<Row> {
    return { first: 10, ...overrides };
  }

  it('loads the full list only once across many calls', async () => {
    const loadAll = vi.fn(async () => createSuccessResult(rows));
    const fetchFn = createInMemoryFetchFn<Row>(loadAll, { searchableFields: ['name'] });

    await fetchFn(vars({ filter: { $search: 'alice' } }));
    await fetchFn(vars({ order: [{ name: SortEnumType.DESC }] }));
    await fetchFn(vars({ first: 1, after: '1' }));

    expect(loadAll).toHaveBeenCalledTimes(1);
  });

  it('filters, sorts and slices the loaded list', async () => {
    const loadAll = vi.fn(async () => createSuccessResult(rows));
    const fetchFn = createInMemoryFetchFn<Row>(loadAll, { searchableFields: ['name'] });

    const result = await fetchFn(vars({ order: [{ name: SortEnumType.DESC }] }));
    expect(result.isSuccess).toBe(true);
    if (!result.isSuccess) throw new Error('expected success');
    expect(result.data.nodes?.map((n) => n?.id)).toEqual(['r2', 'r1']);
    expect(result.data.totalCount).toBe(2);
  });

  it('re-loads after reset()', async () => {
    const loadAll = vi.fn(async () => createSuccessResult(rows));
    const fetchFn = createInMemoryFetchFn<Row>(loadAll, { searchableFields: ['name'] });

    await fetchFn(vars());
    fetchFn.reset();
    await fetchFn(vars());

    expect(loadAll).toHaveBeenCalledTimes(2);
  });

  it('passes through errors and does not cache failures', async () => {
    const loadAll = vi
      .fn()
      .mockResolvedValueOnce(createClientError())
      .mockResolvedValueOnce(createSuccessResult(rows));
    const fetchFn = createInMemoryFetchFn<Row>(loadAll, { searchableFields: ['name'] });

    const failed = await fetchFn(vars());
    expect(failed.isSuccess).toBe(false);

    const ok = await fetchFn(vars());
    expect(ok.isSuccess).toBe(true);
    expect(loadAll).toHaveBeenCalledTimes(2);
  });
});
