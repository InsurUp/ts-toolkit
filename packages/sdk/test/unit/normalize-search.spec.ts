import { describe, expect, it } from 'vitest';
import { normalizeSearchInput } from '../../src/clients/_internal/normalize-search.js';

describe('normalizeSearchInput', () => {
  it('returns null/undefined inputs unchanged', () => {
    expect(normalizeSearchInput(null)).toBe(null);
    expect(normalizeSearchInput(undefined)).toBe(undefined);
  });

  it('wraps a bare string at text-input op slots into { value }', () => {
    // `eq` and `textSearch` represent the two canonical text-input slots; the
    // implementation iterates over `TEXT_INPUT_OPS` so per-op coverage is
    // redundant.
    const out = normalizeSearchInput({
      name: { eq: 'a', textSearch: 'b' },
    });
    expect(out).toEqual({
      name: { eq: { value: 'a' }, textSearch: { value: 'b' } },
    });
  });

  it('wraps string[] at in/nin slots into { values }', () => {
    const out = normalizeSearchInput({ name: { in: ['a', 'b'], nin: ['c'] } });
    expect(out).toEqual({ name: { in: { values: ['a', 'b'] }, nin: { values: ['c'] } } });
  });

  it('passes long-form SearchTextInput / SearchTextListInput (with score) through unchanged', () => {
    const input = {
      name: {
        textSearch: { value: 'ali', score: { boost: 2 } },
        in: { values: ['a', 'b'], score: { constant: 5 } },
      },
    };
    expect(normalizeSearchInput(input)).toEqual(input);
  });

  it('recurses into top-level and / or combinators', () => {
    const out = normalizeSearchInput({
      or: [{ name: { textSearch: 'a' } }, { name: { contains: 'b' } }],
    });
    expect(out).toEqual({
      or: [{ name: { textSearch: { value: 'a' } } }, { name: { contains: { value: 'b' } } }],
    });
  });

  it('leaves non-text ops at non-text slots untouched (numeric / date)', () => {
    const out = normalizeSearchInput({
      productsCount: { eq: 5, gt: 1 },
      createdAt: { gte: '2024-01-01' },
    });
    expect(out).toEqual({
      productsCount: { eq: 5, gt: 1 },
      createdAt: { gte: '2024-01-01' },
    });
  });

  it('leaves a Date instance at a non-text slot alone', () => {
    // Dates are `typeof 'object'`. The normalizer must not mistake them for
    // long-form SearchTextInput objects; on non-text-op slots (gte/lte/etc.)
    // they should pass through untouched.
    const d = new Date('2024-01-01T00:00:00Z');
    const out = normalizeSearchInput({ createdAt: { gte: d } });
    expect(out).toEqual({ createdAt: { gte: d } });
  });
});
