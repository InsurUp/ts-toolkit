/**
 * @fileoverview Sorting Converters Tests
 * @description Unit tests for the sorting converters between TanStack and SDK formats
 */

import { describe, it, expect } from 'vitest';
import { createSortingConverters } from '../../../src/lib/sorting/converters.js';
import type { SortingState } from '@tanstack/table-core';

// Define a mock sort input type for testing
interface MockSortInput {
  id?: 'ASC' | 'DESC';
  name?: 'ASC' | 'DESC';
  email?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
}

describe('createSortingConverters', () => {
  const converters = createSortingConverters<MockSortInput>();

  describe('toSdk', () => {
    it('should convert single ascending sort', () => {
      const tanstackSorting: SortingState = [{ id: 'name', desc: false }];
      const result = converters.toSdk(tanstackSorting);

      expect(result).toEqual([{ name: 'ASC' }]);
    });

    it('should convert single descending sort', () => {
      const tanstackSorting: SortingState = [{ id: 'name', desc: true }];
      const result = converters.toSdk(tanstackSorting);

      expect(result).toEqual([{ name: 'DESC' }]);
    });

    it('should convert multiple sort columns', () => {
      const tanstackSorting: SortingState = [
        { id: 'name', desc: false },
        { id: 'createdAt', desc: true },
      ];
      const result = converters.toSdk(tanstackSorting);

      expect(result).toEqual([{ name: 'ASC' }, { createdAt: 'DESC' }]);
    });

    it('should return undefined for empty array', () => {
      const result = converters.toSdk([]);
      expect(result).toBeUndefined();
    });

    it('should handle any field name', () => {
      const tanstackSorting: SortingState = [{ id: 'customField', desc: true }];
      const result = converters.toSdk(tanstackSorting);

      expect(result).toEqual([{ customField: 'DESC' }]);
    });
  });

  describe('toTanStack', () => {
    it('should convert single ascending sort', () => {
      const sdkSorting: MockSortInput[] = [{ name: 'ASC' }];
      const result = converters.toTanStack(sdkSorting);

      expect(result).toEqual([{ id: 'name', desc: false }]);
    });

    it('should convert single descending sort', () => {
      const sdkSorting: MockSortInput[] = [{ name: 'DESC' }];
      const result = converters.toTanStack(sdkSorting);

      expect(result).toEqual([{ id: 'name', desc: true }]);
    });

    it('should convert multiple sort columns', () => {
      const sdkSorting: MockSortInput[] = [{ name: 'ASC' }, { createdAt: 'DESC' }];
      const result = converters.toTanStack(sdkSorting);

      expect(result).toEqual([
        { id: 'name', desc: false },
        { id: 'createdAt', desc: true },
      ]);
    });

    it('should return empty array for undefined', () => {
      const result = converters.toTanStack(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty array', () => {
      const result = converters.toTanStack([]);
      expect(result).toEqual([]);
    });

    it('should filter out empty objects', () => {
      const sdkSorting: MockSortInput[] = [{ name: 'ASC' }, {} as MockSortInput, { email: 'DESC' }];
      const result = converters.toTanStack(sdkSorting);

      expect(result).toEqual([
        { id: 'name', desc: false },
        { id: 'email', desc: true },
      ]);
    });

    it('should use the first key-value pair from each sort object', () => {
      // When an object has multiple keys, only the first one should be used
      const sdkSorting = [{ name: 'ASC', email: 'DESC' } as MockSortInput];
      const result = converters.toTanStack(sdkSorting);

      // Should only get one result (the first key)
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('name');
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve sorting through round-trip', () => {
      const original: SortingState = [
        { id: 'name', desc: false },
        { id: 'createdAt', desc: true },
      ];

      const sdk = converters.toSdk(original);
      const result = converters.toTanStack(sdk);

      expect(result).toEqual(original);
    });

    it('should handle single column round-trip', () => {
      const original: SortingState = [{ id: 'email', desc: true }];

      const sdk = converters.toSdk(original);
      const result = converters.toTanStack(sdk);

      expect(result).toEqual(original);
    });

    it('should handle empty round-trip', () => {
      const original: SortingState = [];

      const sdk = converters.toSdk(original);
      const result = converters.toTanStack(sdk);

      expect(result).toEqual(original);
    });
  });

  describe('type safety', () => {
    it('should create separate converters for different entity types', () => {
      interface CustomerSortInput {
        customerName?: 'ASC' | 'DESC';
      }

      interface PolicySortInput {
        policyNumber?: 'ASC' | 'DESC';
      }

      const customerConverters = createSortingConverters<CustomerSortInput>();
      const policyConverters = createSortingConverters<PolicySortInput>();

      // Both should work independently
      const customerResult = customerConverters.toSdk([{ id: 'customerName', desc: true }]);
      const policyResult = policyConverters.toSdk([{ id: 'policyNumber', desc: false }]);

      expect(customerResult).toEqual([{ customerName: 'DESC' }]);
      expect(policyResult).toEqual([{ policyNumber: 'ASC' }]);
    });
  });
});
