import { describe, expect, it } from 'vitest';
import type { UnifiedFilterInput } from '@insurup/contracts';
import { splitUnifiedFilter } from '../../src/clients/_internal/split-unified-filter.js';

// Fixture types for the runtime tests. The splitter's behavior is independent
// of the per-field operator shapes; these are just enough to satisfy the
// `UnifiedFilterInput<TFilter, TSearch>` generic so TS doesn't reject the
// fields below as "excess" against `unknown`.
interface F {
  type?: { eq?: string };
  status?: { eq?: string };
  name?: { contains?: string };
}
interface S {
  name?: { textSearch?: { value: string } };
}
type U = UnifiedFilterInput<F, S>;
const split = (input: U | null | undefined) => splitUnifiedFilter<F, S>(input);

describe('splitUnifiedFilter', () => {
  it('returns both buckets as undefined on null/undefined input', () => {
    expect(split(null)).toEqual({ filter: undefined, search: undefined });
    expect(split(undefined)).toEqual({ filter: undefined, search: undefined });
  });

  it('routes plain (unmarked) entries to the filter bucket', () => {
    expect(split({ type: { eq: 'INDIVIDUAL' } })).toEqual({
      filter: { type: { eq: 'INDIVIDUAL' } },
      search: undefined,
    });
  });

  it('routes $search-marked entries to the search bucket, stripping the marker', () => {
    expect(split({ name: { $search: true, textSearch: { value: 'ali' } } })).toEqual({
      filter: undefined,
      search: { name: { textSearch: { value: 'ali' } } },
    });
  });

  it('splits a mixed payload into both buckets', () => {
    expect(
      split({
        type: { eq: 'INDIVIDUAL' },
        name: { $search: true, textSearch: { value: 'ali' } },
      })
    ).toEqual({
      filter: { type: { eq: 'INDIVIDUAL' } },
      search: { name: { textSearch: { value: 'ali' } } },
    });
  });

  it('splits an `and` array per item', () => {
    expect(
      split({
        and: [
          { status: { eq: 'OPEN' } },
          { name: { $search: true, textSearch: { value: 'ali' } } },
        ],
      })
    ).toEqual({
      filter: { and: [{ status: { eq: 'OPEN' } }] },
      search: { and: [{ name: { textSearch: { value: 'ali' } } }] },
    });
  });

  it('splits an `or` array per item', () => {
    expect(
      split({
        or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }],
      })
    ).toEqual({
      filter: { or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] },
      search: undefined,
    });
  });

  it('recurses into nested combinators', () => {
    expect(
      split({
        and: [
          { or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] },
          { name: { $search: true, textSearch: { value: 'ali' } } },
        ],
      })
    ).toEqual({
      filter: {
        and: [{ or: [{ status: { eq: 'OPEN' } }, { status: { eq: 'CLOSED' } }] }],
      },
      search: { and: [{ name: { textSearch: { value: 'ali' } } }] },
    });
  });

  it('drops an empty combinator entirely', () => {
    expect(split({ and: [] })).toEqual({ filter: undefined, search: undefined });
  });

  it('routes an empty $search marker (no operator) to the search bucket', () => {
    expect(split({ name: { $search: true } })).toEqual({
      filter: undefined,
      search: { name: {} },
    });
  });

  it('preserves non-object items inside `and`/`or` on the filter side instead of dropping them', () => {
    // Type system normally prevents this, but a runtime input with stray
    // primitives/nulls inside a combinator array should land in `filter`
    // (so the server complains loudly) rather than vanishing.
    const input = { and: [null, { status: { eq: 'OPEN' } }, 42] } as unknown as U;
    expect(splitUnifiedFilter<F, S>(input)).toEqual({
      filter: { and: [null, { status: { eq: 'OPEN' } }, 42] },
      search: undefined,
    });
  });
});
