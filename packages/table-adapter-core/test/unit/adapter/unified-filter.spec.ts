/**
 * @fileoverview Unified filter / search routing tests.
 *
 * The `splitUnifiedFilter` helper inside `BaseTableAdapter` is private, but
 * its behavior is observable through the `fetch` call: per-field entries
 * without a `$search` marker go to the `filter` slot, entries with
 * `$search: true` go to the `search` slot (marker stripped).
 */

import { describe, it, expect, vi } from 'vitest';
import { BaseTableAdapter } from '../../../src/lib/adapter/base-adapter.js';
import { createSortingConverters } from '../../../src/lib/sorting/converters.js';
import type { AnyColumnDef, FetchFn, QueryOptionsBuilder } from '../../../src/lib/types.js';
import { splitUnifiedFilter, type Connection, type Success } from '@insurup/sdk';
import { flushPromises } from '../../utils/helpers.js';

// Adapter-level integration: the adapter forwards the unified filter through
// `buildFetchQueryOptions` to the fetch fn. In real entity factories the fetch
// fn is the SDK client method, which splits the unified shape into the
// server's `filter:` / `search:` slots. We mimic the SDK split inside the
// mock `buildQO` so the wire-shape assertions match what hits a real client.

interface Row {
  id: string;
  name: string;
}
interface Sort {
  id?: 'ASC' | 'DESC';
}
interface FilterInput {
  name?: { contains?: string };
  status?: { eq?: string };
}
interface SearchInput {
  name?: { textSearch?: { value: string } };
}
type UnifiedInput = {
  name?:
    | ({ contains?: string } & { $search?: never })
    | ({ textSearch?: { value: string } } & { $search: true });
  status?: { eq?: string } & { $search?: never };
  and?: UnifiedInput[] | null;
  or?: UnifiedInput[] | null;
};
interface QO {
  first: number;
  filter?: FilterInput;
  search?: SearchInput;
  order?: Sort[];
  select?: string[];
  includeTotalCount?: boolean;
}

function ok<T>(d: T): Success<T> {
  return { kind: 'success', isSuccess: true, message: 'Success', data: d };
}
function makeConn(): Connection<Row> {
  return {
    nodes: [{ id: '1', name: 'a' }],
    pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
    totalCount: 1,
    edges: [{ node: { id: '1', name: 'a' }, cursor: 'c0' }],
  };
}
const columns: AnyColumnDef<keyof Row>[] = [
  {
    key: 'id',
    fields: ['id'],
    header: 'ID',
    sortable: false,
    hideable: false,
    hiddenByDefault: false,
    isComputed: false,
  } as AnyColumnDef<keyof Row>,
];
const sortingConverters = createSortingConverters<Sort>();
const buildQO: QueryOptionsBuilder<Row, QO, Sort, UnifiedInput> = (p) => {
  // Mimic the SDK split so the mock fetch sees the wire shape.
  const { filter, search } = splitUnifiedFilter<FilterInput, SearchInput>(p.filter);
  return {
    first: p.first,
    filter,
    search,
    order: p.order,
    select: p.select,
    includeTotalCount: p.includeTotalCount,
  };
};

function makeAdapter(fetchFn: FetchFn<Row, QO>, defaultFilter?: UnifiedInput) {
  return new BaseTableAdapter<Row, Row, QO, Sort, UnifiedInput, never>(fetchFn, buildQO, {
    columns,
    pagination: { type: 'cursor', pageSize: 10 } as never,
    sortingConverters,
    queryKeyPrefix: 'unified-test',
    defaultFilter,
  });
}

describe('unified filter routing (splitUnifiedFilter via fetch observation)', () => {
  it('routes plain (unmarked) entries to the server filter slot', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({ status: { eq: 'OPEN' } });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { status: { eq: 'OPEN' } },
        search: undefined,
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('routes a $search-marked entry to the server search slot, stripping the marker', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({ name: { $search: true, textSearch: { value: 'ali' } } });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: undefined,
        search: { name: { textSearch: { value: 'ali' } } },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('splits a mixed filter into both slots in a single call', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({
      status: { eq: 'OPEN' },
      name: { $search: true, textSearch: { value: 'ali' } },
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { status: { eq: 'OPEN' } },
        search: { name: { textSearch: { value: 'ali' } } },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('emits both slots as undefined when no filter is set', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    await adapter.fetch();
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: undefined, search: undefined }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('seeded `defaultFilter` with a search-marked entry is routed on the first fetch', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn, {
      name: { $search: true, textSearch: { value: 'seed' } },
    });

    await adapter.fetch();
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: undefined,
        search: { name: { textSearch: { value: 'seed' } } },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  // --------------------------------------------------------------------------
  // and / or combinators
  // --------------------------------------------------------------------------

  it('splits an `and` array per item into both server slots', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({
      and: [{ status: { eq: 'OPEN' } }, { name: { $search: true, textSearch: { value: 'ali' } } }],
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { and: [{ status: { eq: 'OPEN' } }] },
        search: { and: [{ name: { textSearch: { value: 'ali' } } }] },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('splits an `or` array per item (caveat: cross-bucket OR becomes AND at the wire)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({
      or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }],
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] },
        search: undefined,
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('splits an `and` item that itself mixes filter + search keys', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({
      and: [
        {
          status: { eq: 'OPEN' },
          name: { $search: true, textSearch: { value: 'ali' } },
        },
      ],
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { and: [{ status: { eq: 'OPEN' } }] },
        search: { and: [{ name: { textSearch: { value: 'ali' } } }] },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('recurses into nested `and`/`or` combinators', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({
      and: [
        { or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] },
        { name: { $search: true, textSearch: { value: 'ali' } } },
      ],
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: {
          and: [{ or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] }],
        },
        search: { and: [{ name: { textSearch: { value: 'ali' } } }] },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('drops an empty combinator from the request entirely', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    adapter.setFilter({ and: [] });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: undefined, search: undefined }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  // --------------------------------------------------------------------------
  // edge cases
  // --------------------------------------------------------------------------

  it('routes an empty `$search` marker (no operator) to the search slot', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    // `$search: true` with no operator is a no-op clause server-side; the
    // adapter still routes it (marker stripped → empty object).
    adapter.setFilter({ name: { $search: true } });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: undefined,
        search: { name: {} },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('preserves nested null values inside a $search-marked op', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    // `textSearch: null` is the explicit "no value" form on the server side.
    // The adapter must pass it through untouched (just strip the marker).
    adapter.setFilter({
      name: { $search: true, textSearch: null as never },
    });
    await flushPromises();

    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: undefined,
        search: { name: { textSearch: null } },
      }),
      expect.any(Object)
    );
    adapter.destroy();
  });

  it('refetches and re-splits when a field flips filter → search → filter', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(makeConn()));
    const adapter = makeAdapter(fetchFn);

    // 1. Plain filter on name
    adapter.setFilter({ name: { contains: 'a' } });
    await flushPromises();
    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { name: { contains: 'a' } },
        search: undefined,
      }),
      expect.any(Object)
    );

    // 2. Same field promoted to search
    adapter.setFilter({ name: { $search: true, textSearch: { value: 'a' } } });
    await flushPromises();
    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: undefined,
        search: { name: { textSearch: { value: 'a' } } },
      }),
      expect.any(Object)
    );

    // 3. Demoted back to a plain filter
    adapter.setFilter({ name: { contains: 'b' } });
    await flushPromises();
    expect(fetchFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filter: { name: { contains: 'b' } },
        search: undefined,
      }),
      expect.any(Object)
    );

    adapter.destroy();
  });
});
