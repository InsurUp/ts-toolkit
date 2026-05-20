import { describe, expect, it } from 'vitest';
import { normalizeSearchInput } from '../../src/clients/_internal/normalize-search.js';

describe('normalizeSearchInput', () => {
  it('returns null/undefined inputs unchanged', () => {
    expect(normalizeSearchInput(null)).toBe(null);
    expect(normalizeSearchInput(undefined)).toBe(undefined);
  });

  it('wraps a bare string in textSearch into { value }', () => {
    const out = normalizeSearchInput({ name: { textSearch: 'ali' } });
    expect(out).toEqual({ name: { textSearch: { value: 'ali' } } });
  });

  it('wraps bare strings for every text-input operator', () => {
    const out = normalizeSearchInput({
      name: {
        eq: 'a',
        neq: 'b',
        contains: 'c',
        notContains: 'd',
        startsWith: 'e',
        notStartsWith: 'f',
        endsWith: 'g',
        notEndsWith: 'h',
        textSearch: 'i',
        wildcard: 'j',
        autocomplete: 'k',
      },
    });
    expect(out).toEqual({
      name: {
        eq: { value: 'a' },
        neq: { value: 'b' },
        contains: { value: 'c' },
        notContains: { value: 'd' },
        startsWith: { value: 'e' },
        notStartsWith: { value: 'f' },
        endsWith: { value: 'g' },
        notEndsWith: { value: 'h' },
        textSearch: { value: 'i' },
        wildcard: { value: 'j' },
        autocomplete: { value: 'k' },
      },
    });
  });

  it('wraps a string[] in in/nin into { values }', () => {
    const out = normalizeSearchInput({ name: { in: ['a', 'b'], nin: ['c'] } });
    expect(out).toEqual({ name: { in: { values: ['a', 'b'] }, nin: { values: ['c'] } } });
  });

  it('leaves long-form SearchTextInput unchanged', () => {
    const input = {
      name: {
        textSearch: { value: 'ali', score: { boost: 2 } },
        in: { values: ['a', 'b'], score: { constant: 5 } },
      },
    };
    expect(normalizeSearchInput(input)).toEqual(input);
  });

  it('recurses into and / or combinators on a search-string field', () => {
    const out = normalizeSearchInput({
      name: { or: [{ textSearch: 'a' }, { wildcard: 'b' }] },
    });
    expect(out).toEqual({
      name: { or: [{ textSearch: { value: 'a' } }, { wildcard: { value: 'b' } }] },
    });
  });

  it('recurses into top-level and / or combinators', () => {
    const out = normalizeSearchInput({
      or: [{ name: { textSearch: 'a' } }, { name: { contains: 'b' } }],
    });
    expect(out).toEqual({
      or: [{ name: { textSearch: { value: 'a' } } }, { name: { contains: { value: 'b' } } }],
    });
  });

  it('leaves non-search-string ops untouched (e.g. numeric eq)', () => {
    const out = normalizeSearchInput({
      productsCount: { eq: 5, gt: 1 },
      createdAt: { gte: '2024-01-01' },
    });
    expect(out).toEqual({
      productsCount: { eq: 5, gt: 1 },
      createdAt: { gte: '2024-01-01' },
    });
  });

  it('passes through SearchTextListInput with score on in/nin', () => {
    const input = {
      name: { in: { values: ['a', 'b'], score: { boost: 2 } } },
    };
    expect(normalizeSearchInput(input)).toEqual(input);
  });

  it('passes through SearchTextInput with score on every text-op slot', () => {
    const input = {
      name: {
        textSearch: { value: 'x', score: { boost: 3 } },
        wildcard: { value: 'y', score: { constant: 1 } },
        autocomplete: { value: 'z', score: { boost: 0.5 } },
      },
    };
    expect(normalizeSearchInput(input)).toEqual(input);
  });

  it('leaves a Date instance at a non-text slot alone (gte on a date field)', () => {
    // Dates are `typeof 'object'`. The normalizer must not mistake them for
    // long-form SearchTextInput objects; on non-text-op slots (gte/lte/etc.)
    // they should pass through untouched. Server-side validation handles the
    // wire-format check.
    const d = new Date('2024-01-01T00:00:00Z');
    const out = normalizeSearchInput({ createdAt: { gte: d } });
    expect(out).toEqual({ createdAt: { gte: d } });
  });

  it('leaves primitives at non-text slots untouched (numeric gte/lte)', () => {
    const out = normalizeSearchInput({ retryCount: { gte: 0, lte: 10 } });
    expect(out).toEqual({ retryCount: { gte: 0, lte: 10 } });
  });
});
