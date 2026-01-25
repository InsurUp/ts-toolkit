/**
 * @fileoverview Generic Sorting Converter Factory
 * @description Creates converters between TanStack sorting format and SDK sorting format
 */

import type { SortingState } from '@tanstack/table-core';
import { SortEnumType } from '@insurup/sdk';
import type { SortingConverters } from './types.js';

/**
 * Create sorting converters for any entity type
 *
 * The SDK uses { fieldName: 'ASC' | 'DESC' } objects while TanStack uses
 * { id: string, desc: boolean } objects. This factory creates bidirectional
 * converters that work for any entity's sort input type.
 *
 * @template TSortInput - The SDK sort input type (e.g., QueryCustomerModelSortInput)
 * @returns SortingConverters with toSdk and toTanStack methods
 *
 * @example
 * ```typescript
 * import { QueryCustomerModelSortInput } from '@insurup/sdk'
 *
 * const customerSortingConverters = createSortingConverters<QueryCustomerModelSortInput>()
 *
 * // TanStack → SDK
 * customerSortingConverters.toSdk([{ id: 'name', desc: true }])
 * // Returns: [{ name: 'DESC' }]
 *
 * // SDK → TanStack
 * customerSortingConverters.toTanStack([{ name: 'DESC' }])
 * // Returns: [{ id: 'name', desc: true }]
 * ```
 */
export function createSortingConverters<TSortInput>(): SortingConverters<TSortInput> {
  return {
    /**
     * Convert TanStack sorting state to SDK sort input array
     * @example [{id: 'name', desc: true}] → [{name: 'DESC'}]
     */
    toSdk: (sorting: SortingState): TSortInput[] | undefined => {
      if (!sorting.length) return undefined;
      return sorting.map((s) => ({
        [s.id]: s.desc ? SortEnumType.DESC : SortEnumType.ASC,
      })) as TSortInput[];
    },

    /**
     * Convert SDK sort input array to TanStack sorting state
     * Filters out invalid entries (empty objects) instead of returning fallback values
     * @example [{name: 'DESC'}] → [{id: 'name', desc: true}]
     */
    toTanStack: (sorting: TSortInput[] | undefined): SortingState => {
      if (!sorting || !sorting.length) return [];
      return sorting
        .map((sortInput) => {
          // Each sort input is an object with one key (the field name) and value 'ASC' or 'DESC'
          const entries = Object.entries(sortInput as Record<string, string>);
          const firstEntry = entries[0];
          if (!firstEntry) return null; // Invalid entry (empty object)
          return {
            id: firstEntry[0],
            desc: firstEntry[1] === 'DESC',
          };
        })
        .filter((entry): entry is { id: string; desc: boolean } => entry !== null);
    },
  };
}
