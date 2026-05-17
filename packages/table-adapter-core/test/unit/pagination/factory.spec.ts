/**
 * @fileoverview Pagination Factory Tests
 */

import { describe, it, expect } from 'vitest';
import { createPaginationManager } from '../../../src/lib/pagination/factory.js';
import type { PaginationOptions } from '../../../src/lib/pagination/types.js';

describe('createPaginationManager', () => {
  it('creates a cursor pagination manager for type=cursor', () => {
    const manager = createPaginationManager({ type: 'cursor', pageSize: 25 });
    const state = manager.getState();
    expect(state.pageSize).toBe(25);
    expect(state.pageIndex).toBe(0);
  });

  it('throws for an unknown pagination type', () => {
    // Force the unknown-type branch — TS would normally reject this.
    const bad = { type: 'offset', pageSize: 10 } as unknown as PaginationOptions;
    expect(() => createPaginationManager(bad)).toThrow(/Unknown pagination type: offset/);
  });
});
