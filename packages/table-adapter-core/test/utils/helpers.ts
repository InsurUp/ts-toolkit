/**
 * @fileoverview Test Helpers
 * @description Utility functions for testing the table adapter
 */

import type { BaseTableAdapterOptions } from '../../src/lib/adapter/types.js';
import type { InternalColumnDef } from '../../src/lib/types.js';
import {
  createMockColumns,
  mockSortingConverters,
  type MockEntity,
  type MockSortInput,
  type MockFilterInput,
  type MockSearchInput,
} from './mocks.js';

// ============================================================================
// Adapter Options Helpers
// ============================================================================

/**
 * Create mock base table adapter options
 */
export function createMockAdapterOptions(
  overrides: Partial<
    BaseTableAdapterOptions<MockEntity, MockSortInput, MockFilterInput, MockSearchInput>
  > = {}
): BaseTableAdapterOptions<MockEntity, MockSortInput, MockFilterInput, MockSearchInput> {
  return {
    columns: createMockColumns(),
    select: ['id', 'name', 'email'],
    pageSize: 10,
    sortingConverters: mockSortingConverters,
    queryKeyPrefix: 'test',
    ...overrides,
  };
}

/**
 * Create a minimal set of columns for testing
 */
export function createMinimalColumns(): InternalColumnDef[] {
  return [
    {
      key: 'id',
      fields: ['id'],
      header: 'ID',
      sortable: false,
      hideable: true,
      render: undefined,
      isComputed: false,
    },
  ];
}

// ============================================================================
// Async Helpers
// ============================================================================

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 10
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timed out');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Wait for the next tick (microtask)
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(resolve));
}

/**
 * Wait for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises and timers
 */
export async function flushPromises(): Promise<void> {
  await nextTick();
  await nextTick();
}

// ============================================================================
// Test Setup Helpers
// ============================================================================

/**
 * Helper for cleaning up after tests
 */
export function cleanup(): void {
  vi.clearAllMocks();
  vi.restoreAllMocks();
}

/**
 * Create a spy on console.warn
 */
export function spyOnConsoleWarn(): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(console, 'warn').mockImplementation(() => {});
}
