import { describe, it, expect } from 'vitest';
import { DateOnly, DateTime } from '../../src/common.date.js';

describe('DateTime', () => {
  it('constructs from ISO string', () => {
    const dt = new DateTime('2024-01-15T10:30:00Z');
    expect(dt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
  });

  it('constructs from native Date', () => {
    const native = new Date('2024-06-01T12:00:00Z');
    const dt = new DateTime(native);
    expect(dt.toDate()).toBe(native);
  });

  it('fromDate static creates equivalent instance', () => {
    const native = new Date('2024-03-10T08:15:00Z');
    const dt = DateTime.fromDate(native);
    expect(dt).toBeInstanceOf(DateTime);
    expect(dt.toISOString()).toBe('2024-03-10T08:15:00.000Z');
  });

  it('now() returns current time', () => {
    const before = Date.now();
    const dt = DateTime.now();
    const after = Date.now();
    expect(dt.valueOf()).toBeGreaterThanOrEqual(before);
    expect(dt.valueOf()).toBeLessThanOrEqual(after);
  });

  it('toString returns the ISO string', () => {
    const dt = new DateTime('2024-01-15T10:30:00Z');
    expect(dt.toString()).toBe('2024-01-15T10:30:00.000Z');
  });

  it('toJSON serializes to ISO string', () => {
    const dt = new DateTime('2024-01-15T10:30:00Z');
    expect(JSON.stringify({ dt })).toBe('{"dt":"2024-01-15T10:30:00.000Z"}');
  });

  it('valueOf returns the millisecond timestamp', () => {
    const dt = new DateTime('1970-01-01T00:00:00.000Z');
    expect(dt.valueOf()).toBe(0);
  });

  it('round-trips through JSON', () => {
    const original = new DateTime('2024-01-15T10:30:00Z');
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json) as string;
    const restored = new DateTime(parsed);
    expect(restored.toISOString()).toBe(original.toISOString());
  });
});

describe('DateOnly', () => {
  it('constructs from YYYY-MM-DD string', () => {
    const date = new DateOnly('2024-01-15');
    expect(date.year).toBe(2024);
    expect(date.month).toBe(1);
    expect(date.day).toBe(15);
  });

  it('constructs from native Date using UTC components', () => {
    const native = new Date(Date.UTC(2024, 5, 1)); // June 1, 2024 UTC
    const date = new DateOnly(native);
    expect(date.year).toBe(2024);
    expect(date.month).toBe(6);
    expect(date.day).toBe(1);
  });

  it('fromDate static creates equivalent instance', () => {
    const native = new Date(Date.UTC(2024, 11, 31));
    const date = DateOnly.fromDate(native);
    expect(date).toBeInstanceOf(DateOnly);
    expect(date.toString()).toBe('2024-12-31');
  });

  it('today() returns current date', () => {
    const today = DateOnly.today();
    const native = new Date();
    expect(today.year).toBe(native.getUTCFullYear());
    expect(today.month).toBe(native.getUTCMonth() + 1);
    expect(today.day).toBe(native.getUTCDate());
  });

  it('toDate returns a UTC-midnight Date for the same day', () => {
    const date = new DateOnly('2024-05-15');
    const native = date.toDate();
    expect(native.getUTCFullYear()).toBe(2024);
    expect(native.getUTCMonth()).toBe(4); // 0-indexed
    expect(native.getUTCDate()).toBe(15);
    expect(native.getUTCHours()).toBe(0);
    expect(native.getUTCMinutes()).toBe(0);
  });

  it('toString returns zero-padded YYYY-MM-DD', () => {
    expect(new DateOnly('2024-01-05').toString()).toBe('2024-01-05');
    expect(new DateOnly('2024-12-31').toString()).toBe('2024-12-31');
  });

  it('pads single-digit year/month/day', () => {
    const date = new DateOnly('0042-03-04');
    expect(date.toString()).toBe('0042-03-04');
  });

  it('toJSON serializes to YYYY-MM-DD string', () => {
    const date = new DateOnly('2024-01-15');
    expect(JSON.stringify({ date })).toBe('{"date":"2024-01-15"}');
  });

  it('valueOf returns the UTC-midnight millisecond timestamp', () => {
    const date = new DateOnly('1970-01-01');
    expect(date.valueOf()).toBe(0);
  });

  it('round-trips through JSON', () => {
    const original = new DateOnly('2024-05-15');
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json) as string;
    const restored = new DateOnly(parsed);
    expect(restored.toString()).toBe(original.toString());
  });

  it('defaults missing components to 0/1/1 for malformed input', () => {
    // Documents the existing parsing behaviour for partial strings
    const partial = new DateOnly('2024');
    expect(partial.year).toBe(2024);
    expect(partial.month).toBe(1);
    expect(partial.day).toBe(1);
  });
});
