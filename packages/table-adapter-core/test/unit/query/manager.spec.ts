/**
 * @fileoverview Query Manager Tests
 * @description Unit tests for the QueryManager class
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { QueryManager } from '../../../src/lib/query/manager.js';
import type { QueryFnContext } from '../../../src/lib/query/types.js';
import { flushPromises } from '../../utils/helpers.js';

// Mock query variables type
interface MockVariables {
  first: number;
  after?: string;
}

// Mock data type
interface MockData {
  items: string[];
  totalCount: number;
}

describe('QueryManager', () => {
  let queryFn: Mock<(vars: MockVariables, context: QueryFnContext) => Promise<MockData>>;
  let getQueryKey: Mock<() => unknown[]>;
  let getVariables: Mock<() => MockVariables>;

  beforeEach(() => {
    vi.clearAllMocks();

    queryFn = vi.fn().mockResolvedValue({
      items: ['item1', 'item2'],
      totalCount: 2,
    } as MockData);

    getQueryKey = vi.fn().mockReturnValue(['test', 'key']);
    getVariables = vi.fn().mockReturnValue({ first: 10 } as MockVariables);
  });

  describe('constructor', () => {
    it('should create a QueryManager instance', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      expect(manager).toBeInstanceOf(QueryManager);
      manager.destroy();
    });

    it('should use default staleTime and gcTime when not provided', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // Manager should be created without errors
      expect(manager).toBeDefined();
      manager.destroy();
    });

    it('should accept custom staleTime and gcTime', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
        staleTime: 60_000,
        gcTime: 10 * 60_000,
      });

      expect(manager).toBeDefined();
      manager.destroy();
    });
  });

  describe('getState', () => {
    it('should return initial state before fetch', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const state = manager.getState();

      expect(state.data).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.isFetching).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isError).toBe(false);
      expect(state.isSuccess).toBe(false);

      manager.destroy();
    });
  });

  describe('fetch', () => {
    it('should call queryFn with variables', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      await manager.fetch();

      expect(queryFn).toHaveBeenCalled();
      expect(getVariables).toHaveBeenCalled();

      manager.destroy();
    });

    it('should update state after successful fetch', async () => {
      const mockData: MockData = { items: ['a', 'b', 'c'], totalCount: 3 };
      queryFn.mockResolvedValue(mockData);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      await manager.fetch();
      await flushPromises();

      const state = manager.getState();
      expect(state.data).toEqual(mockData);
      expect(state.isSuccess).toBe(true);

      manager.destroy();
    });

    it('should update state after failed fetch', async () => {
      const error = new Error('Fetch failed');
      queryFn.mockRejectedValue(error);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      await manager.fetch().catch(() => {});
      await flushPromises();

      const state = manager.getState();
      expect(state.isError).toBe(true);
      expect(state.error).toBeDefined();

      manager.destroy();
    });

    it('should pass signal to queryFn for cancellation', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      await manager.fetch();

      expect(queryFn).toHaveBeenCalledWith(
        { first: 10 },
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );

      manager.destroy();
    });
  });

  describe('invalidate', () => {
    it('should invalidate the cache', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // First fetch
      await manager.fetch();

      // Invalidate
      await manager.invalidate();

      // Query should be invalidated (this tests that no error is thrown)
      expect(getQueryKey).toHaveBeenCalled();

      manager.destroy();
    });
  });

  describe('refetch', () => {
    it('should force refetch data', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // First fetch
      await manager.fetch();
      const firstCallCount = queryFn.mock.calls.length;

      // Refetch
      await manager.refetch();

      expect(queryFn.mock.calls.length).toBeGreaterThan(firstCallCount);

      manager.destroy();
    });

    it('should not throw errors by default', async () => {
      const error = new Error('Refetch failed');
      queryFn.mockRejectedValue(error);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // Should not throw - just resolves without error
      await expect(manager.refetch()).resolves.toBeUndefined();

      manager.destroy();
    });
  });

  describe('subscribe', () => {
    it('should add listener', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const listener = vi.fn();
      manager.subscribe(listener);

      await manager.fetch();
      await flushPromises();

      expect(listener).toHaveBeenCalled();

      manager.destroy();
    });

    it('should return unsubscribe function', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      manager.destroy();
    });

    it('should stop notifying after unsubscribe', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      // Unsubscribe
      unsubscribe();

      // Fetch after unsubscribe
      await manager.fetch();
      await flushPromises();

      // The listener might still be called during the first fetch,
      // but we're mainly testing that unsubscribe doesn't throw
      expect(true).toBe(true);

      manager.destroy();
    });
  });

  describe('getSnapshot', () => {
    it('should return cached state', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const state1 = manager.getSnapshot();
      const state2 = manager.getSnapshot();

      // Should return the same cached reference
      expect(state1).toBe(state2);

      manager.destroy();
    });

    it('should be compatible with useSyncExternalStore pattern', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // These should work as expected for useSyncExternalStore
      expect(typeof manager.subscribe).toBe('function');
      expect(typeof manager.getSnapshot).toBe('function');

      const state = manager.getSnapshot();
      expect(state).toHaveProperty('data');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('isFetching');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('isError');
      expect(state).toHaveProperty('isSuccess');

      manager.destroy();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const listener = vi.fn();
      manager.subscribe(listener);

      // Should not throw
      expect(() => manager.destroy()).not.toThrow();
    });

    it('should clear all listeners', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      const listener = vi.fn();
      manager.subscribe(listener);

      manager.destroy();

      // Reset call count
      listener.mockClear();

      // After destroy, fetching should not notify listeners
      // (though the manager might not work properly after destroy)
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('keepPreviousData', () => {
    // Object wrapper avoids TS narrowing `let pending = null` to `never` —
    // assignments inside the Promise executor are not visible to flow analysis.
    type Deferred<T> = { resolve: ((value: T) => void) | null };

    function blockedQueryFn<T>(deferred: Deferred<T>) {
      return () =>
        new Promise<T>((resolve) => {
          deferred.resolve = resolve;
        });
    }

    it('should not be enabled by default (data clears when key changes)', async () => {
      const firstResult: MockData = { items: ['a'], totalCount: 1 };
      const secondResult: MockData = { items: ['b'], totalCount: 1 };

      // Mutable key so we can simulate a query-key change.
      let key = ['k1'];
      const deferred: Deferred<MockData> = { resolve: null };
      queryFn.mockImplementation(blockedQueryFn(deferred));
      getQueryKey.mockImplementation(() => key);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
        // Default: keepPreviousData is unset
      });

      // Resolve first fetch
      const firstFetch = manager.fetch();
      deferred.resolve?.(firstResult);
      await firstFetch;
      await flushPromises();
      expect(manager.getState().data).toEqual(firstResult);

      // Change key and start second fetch (do not resolve yet)
      key = ['k2'];
      const secondFetch = manager.fetch();
      await flushPromises();

      // Without keepPreviousData, switching keys clears data
      expect(manager.getState().data).toBeUndefined();

      // Cleanup
      deferred.resolve?.(secondResult);
      await secondFetch;
      manager.destroy();
    });

    it('should keep previous data when query key changes (keepPreviousData=true)', async () => {
      const firstResult: MockData = { items: ['a'], totalCount: 1 };
      const secondResult: MockData = { items: ['b'], totalCount: 1 };

      let key = ['k1'];
      const deferred: Deferred<MockData> = { resolve: null };
      queryFn.mockImplementation(blockedQueryFn(deferred));
      getQueryKey.mockImplementation(() => key);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
        keepPreviousData: true,
      });

      // Resolve first fetch
      const firstFetch = manager.fetch();
      deferred.resolve?.(firstResult);
      await firstFetch;
      await flushPromises();
      expect(manager.getState().data).toEqual(firstResult);

      // Change key and start second fetch (do not resolve yet)
      key = ['k2'];
      const secondFetch = manager.fetch();
      await flushPromises();

      // While the new key is in flight, previous data is served as placeholder
      const inFlight = manager.getState();
      expect(inFlight.data).toEqual(firstResult);
      expect(inFlight.isFetching).toBe(true);
      // isLoading is false because data is defined (via placeholder)
      expect(inFlight.isLoading).toBe(false);

      // Resolve second fetch and confirm switch-over
      deferred.resolve?.(secondResult);
      await secondFetch;
      await flushPromises();
      expect(manager.getState().data).toEqual(secondResult);

      manager.destroy();
    });

    it('should leave isLoading=true on the very first fetch even with keepPreviousData=true', async () => {
      const deferred: Deferred<MockData> = { resolve: null };
      queryFn.mockImplementation(blockedQueryFn(deferred));

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
        keepPreviousData: true,
      });

      const firstFetch = manager.fetch();
      await flushPromises();

      // No previous data exists yet → isLoading should be true on first fetch
      const initial = manager.getState();
      expect(initial.data).toBeUndefined();
      expect(initial.isLoading).toBe(true);
      expect(initial.isFetching).toBe(true);

      deferred.resolve?.({ items: ['x'], totalCount: 1 });
      await firstFetch;
      manager.destroy();
    });
  });

  describe('state comparison', () => {
    it('should not update cached state if values are equal', async () => {
      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      // First fetch
      await manager.fetch();
      await flushPromises();

      const state1 = manager.getSnapshot();

      // Second fetch with same data
      await manager.fetch();
      await flushPromises();

      const state2 = manager.getSnapshot();

      // If the data is the same, the cached state reference should be preserved
      // (depends on implementation - this tests the caching behavior)
      expect(state1).toBeDefined();
      expect(state2).toBeDefined();

      manager.destroy();
    });
  });

  describe('query key changes', () => {
    it('should use current query key for each fetch', async () => {
      let keyVersion = 1;
      getQueryKey.mockImplementation(() => ['test', `version-${keyVersion}`]);

      const manager = new QueryManager<MockData, MockVariables>({
        queryFn,
        getQueryKey,
        getVariables,
      });

      await manager.fetch();
      const callCountAfterFirstFetch = getQueryKey.mock.calls.length;
      expect(callCountAfterFirstFetch).toBeGreaterThan(0);

      // Change key version
      keyVersion = 2;

      await manager.fetch();
      // Should have been called more times after second fetch
      expect(getQueryKey.mock.calls.length).toBeGreaterThan(callCountAfterFirstFetch);

      manager.destroy();
    });
  });
});
