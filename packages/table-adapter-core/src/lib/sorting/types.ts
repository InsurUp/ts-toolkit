/**
 * @fileoverview Sorting Types
 * @description Types for sorting state transformation
 */

import type { SortingState as TanStackSortingState } from '@tanstack/table-core';

// Re-export SDK type (eliminate duplication)
export { SortEnumType } from '@insurup/sdk';

// For backwards compatibility, alias as SortDirection
export { SortEnumType as SortDirection } from '@insurup/sdk';

// Re-export TanStack's SortingState for convenience
export type { SortingState as TanStackSortingState } from '@tanstack/table-core';

/**
 * Functions to convert between TanStack sorting format and SDK sorting format
 * Each entity-specific table factory provides these converters
 * @template TSortInput - The SDK sort input type (e.g., QueryCustomerModelSortInput)
 */
export interface SortingConverters<TSortInput> {
  /**
   * Convert TanStack sorting state to SDK sort input array
   * @example [{id: 'name', desc: true}] → [{name: 'DESC'}]
   */
  toSdk: (sorting: TanStackSortingState) => TSortInput[] | undefined;
  /**
   * Convert SDK sort input array to TanStack sorting state
   * @example [{name: 'DESC'}] → [{id: 'name', desc: true}]
   */
  toTanStack: (sorting: TSortInput[] | undefined) => TanStackSortingState;
}
