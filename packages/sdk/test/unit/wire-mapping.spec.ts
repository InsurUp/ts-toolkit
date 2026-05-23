import { describe, expect, it } from 'vitest';

import { decodeWireFields, encodeWireFields } from '../../src/client/wire-mapping.js';

describe('encodeWireFields', () => {
  it('renames `type` to `$type` on NumericQuantity discriminators', () => {
    const input = { totalFloors: { type: 'range', min: 1, max: 5 }, currentFloor: 3 };
    expect(encodeWireFields(input)).toEqual({
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
    expect(encodeWireFields(input)).toEqual({
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
    expect(encodeWireFields(input)).toEqual(input);
  });

  it('does not rename `type` values that are not in the generated registry', () => {
    // Guards against any accidental return to convention-based detection.
    // `made_up_lowercase` is lowercase but not a recognized discriminator.
    const input = { type: 'made_up_lowercase', payload: 'x' };
    expect(encodeWireFields(input)).toEqual(input);
  });

  it('does not produce duplicate `$type` if both are already present', () => {
    const input = { $type: 'range', type: 'range', min: 1, max: 2 };
    const out = encodeWireFields(input) as Record<string, unknown>;
    expect(out.$type).toBe('range');
    expect(out.type).toBe('range');
  });

  it('does not mutate the original input', () => {
    const input = { node: { type: 'exact', value: 7 } };
    const snapshot = JSON.stringify(input);
    encodeWireFields(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('passes primitives, null, and undefined through', () => {
    expect(encodeWireFields(null)).toBeNull();
    expect(encodeWireFields(undefined)).toBeUndefined();
    expect(encodeWireFields(42)).toBe(42);
    expect(encodeWireFields('hello')).toBe('hello');
  });

  it('handles nested arrays of polymorphic values', () => {
    const input = [
      { type: 'exceeding', value: 100 },
      { type: 'exact', value: 5 },
    ];
    expect(encodeWireFields(input)).toEqual([
      { $type: 'exceeding', value: 100 },
      { $type: 'exact', value: 5 },
    ]);
  });
});

describe('decodeWireFields', () => {
  it('renames `$type` to `type` recursively', () => {
    const input = {
      property: {
        floor: { totalFloors: { $type: 'range', min: 1, max: 4 }, currentFloor: 2 },
        accessories: [{ $type: 'audio', price: 999 }],
      },
    };
    expect(decodeWireFields(input)).toEqual({
      property: {
        floor: { totalFloors: { type: 'range', min: 1, max: 4 }, currentFloor: 2 },
        accessories: [{ type: 'audio', price: 999 }],
      },
    });
  });

  it('does not mutate the original input', () => {
    const input = { node: { $type: 'exact', value: 7 } };
    const snapshot = JSON.stringify(input);
    decodeWireFields(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('passes primitives, null, and undefined through', () => {
    expect(decodeWireFields(null)).toBeNull();
    expect(decodeWireFields(undefined)).toBeUndefined();
    expect(decodeWireFields(true)).toBe(true);
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
    expect(decodeWireFields(encodeWireFields(input))).toEqual(input);
  });
});
