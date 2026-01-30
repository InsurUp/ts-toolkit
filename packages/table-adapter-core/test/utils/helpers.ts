/**
 * @fileoverview Test Helpers
 * @description Utility functions for testing the table adapter
 */

import { vi } from 'vitest';
import type { BaseTableAdapterOptions } from '../../src/lib/adapter/types.js';
import type { AnyColumnDef } from '../../src/lib/types.js';
import type { DeepFieldKeys } from '@insurup/sdk';
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
    BaseTableAdapterOptions<MockEntity, MockEntity, MockSortInput, MockFilterInput, MockSearchInput>
  > = {}
): BaseTableAdapterOptions<MockEntity, MockEntity, MockSortInput, MockFilterInput, MockSearchInput> {
  return {
    columns: createMockColumns() as AnyColumnDef<DeepFieldKeys<MockEntity> & string>[],
    pageSize: 10,
    sortingConverters: mockSortingConverters,
    queryKeyPrefix: 'test',
    ...overrides,
  };
}

/**
 * Create a minimal set of columns for testing
 */
export function createMinimalColumns(): AnyColumnDef<string>[] {
  return [
    {
      key: 'id',
      fields: ['id'],
      header: 'ID',
      sortable: false,
      hideable: true,
      hiddenByDefault: false,
      render: undefined,
      isComputed: false,
    },
  ] as AnyColumnDef<string>[];
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
