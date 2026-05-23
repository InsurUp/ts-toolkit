import { describe, expect, it } from 'vitest';

import { decodePolymorphicTypes, encodePolymorphicTypes } from '../../src/client/polymorphic.js';

describe('encodePolymorphicTypes', () => {
  it('renames `type` to `$type` on NumericQuantity discriminators', () => {
    const input = { totalFloors: { type: 'range', min: 1, max: 5 }, currentFloor: 3 };
    expect(encodePolymorphicTypes(input)).toEqual({
      totalFloors: { $type: 'range', min: 1, max: 5 },
      currentFloor: 3,
    });
  });

  it('renames `type` to `$type` on VehicleAccessory discriminators', () => {
    const input = {
      accessories: [
        { type: 'audio', price: 1500 },
        { type: 'display', price: 2400 },
        { type: 'other', price: 800 },
      ],
    };
    expect(encodePolymorphicTypes(input)).toEqual({
      accessories: [
        { $type: 'audio', price: 1500 },
        { $type: 'display', price: 2400 },
        { $type: 'other', price: 800 },
      ],
    });
  });

  it('leaves unrelated `type` fields untouched', () => {
    const input = {
      customerType: 'INDIVIDUAL',
      lossPayeeClause: { type: 'BANK', creditAgreementNumber: 'ABC123' },
    };
    expect(encodePolymorphicTypes(input)).toEqual(input);
  });

  it('does not produce duplicate `$type` if both are already present', () => {
    const input = { $type: 'range', type: 'range', min: 1, max: 2 };
    const out = encodePolymorphicTypes(input) as Record<string, unknown>;
    expect(out.$type).toBe('range');
    expect(out.type).toBe('range');
  });

  it('does not mutate the original input', () => {
    const input = { node: { type: 'exact', value: 7 } };
    const snapshot = JSON.stringify(input);
    encodePolymorphicTypes(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('passes primitives, null, and undefined through', () => {
    expect(encodePolymorphicTypes(null)).toBeNull();
    expect(encodePolymorphicTypes(undefined)).toBeUndefined();
    expect(encodePolymorphicTypes(42)).toBe(42);
    expect(encodePolymorphicTypes('hello')).toBe('hello');
  });

  it('handles nested arrays of polymorphic values', () => {
    const input = [
      { type: 'exceeding', value: 100 },
      { type: 'exact', value: 5 },
    ];
    expect(encodePolymorphicTypes(input)).toEqual([
      { $type: 'exceeding', value: 100 },
      { $type: 'exact', value: 5 },
    ]);
  });
});

describe('decodePolymorphicTypes', () => {
  it('renames `$type` to `type` recursively', () => {
    const input = {
      property: {
        floor: { totalFloors: { $type: 'range', min: 1, max: 4 }, currentFloor: 2 },
        accessories: [{ $type: 'audio', price: 999 }],
      },
    };
    expect(decodePolymorphicTypes(input)).toEqual({
      property: {
        floor: { totalFloors: { type: 'range', min: 1, max: 4 }, currentFloor: 2 },
        accessories: [{ type: 'audio', price: 999 }],
      },
    });
  });

  it('does not mutate the original input', () => {
    const input = { node: { $type: 'exact', value: 7 } };
    const snapshot = JSON.stringify(input);
    decodePolymorphicTypes(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('passes primitives, null, and undefined through', () => {
    expect(decodePolymorphicTypes(null)).toBeNull();
    expect(decodePolymorphicTypes(undefined)).toBeUndefined();
    expect(decodePolymorphicTypes(true)).toBe(true);
  });
});

describe('encode/decode round-trip', () => {
  it('produces identical objects after encode then decode', () => {
    const input = {
      floor: { totalFloors: { type: 'exact', value: 8 }, currentFloor: 3 },
      accessories: [
        { type: 'audio', price: 1500 },
        { type: 'other', price: 200 },
      ],
      lossPayeeClause: { type: 'BANK', creditAgreementNumber: 'X' },
    };
    expect(decodePolymorphicTypes(encodePolymorphicTypes(input))).toEqual(input);
  });
});
