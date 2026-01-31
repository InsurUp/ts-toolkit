/**
 * @fileoverview Test Mocks for Vue Table Adapter
 * @description Mock implementations for testing the Vue composable
 */

import { vi } from 'vitest';

// ============================================================================
// Test Helpers
// ============================================================================

export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export function createMockFetchFn(): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue(undefined);
}
