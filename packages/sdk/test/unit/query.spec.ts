/**
 * @fileoverview Query helper tests - withQuery
 */

import { describe, it, expect } from 'vitest';
import { withQuery } from '../../src/core/query';

describe('withQuery', () => {
  it('returns the path unchanged when no parameter is set', () => {
    expect(withQuery('agents', {})).toBe('agents');
    expect(withQuery('agents', { page: undefined, pageSize: undefined })).toBe('agents');
  });

  it('appends parameters in insertion order and skips undefined ones', () => {
    expect(withQuery('agents', { page: 2, pageSize: undefined, sort: 'name' })).toBe(
      'agents?page=2&sort=name'
    );
  });

  it('writes booleans and zero as their string form', () => {
    expect(withQuery('silences', { includeExpired: false, page: 0 })).toBe(
      'silences?includeExpired=false&page=0'
    );
  });

  it('encodes keys and values', () => {
    expect(withQuery('traces/operations', { service: 'core api&x=1' })).toBe(
      'traces/operations?service=core%20api%26x%3D1'
    );
  });
});
