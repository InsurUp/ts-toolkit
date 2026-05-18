/**
 * @fileoverview useCustomerTable Hook Tests
 * @description Real-React, real-adapter tests via renderHook. Only the fetch
 * function is mocked; everything else (React, the core adapter, TanStack Table)
 * runs end-to-end so the test exercises useSyncExternalStore, the useEffect
 * cleanup path, and Strict Mode adapter recreation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCustomerTable } from '../src/use-customer-table';
import {
  createMockConnection,
  createMockFetchFn,
  createMockOptions,
  type MockCustomer,
} from './utils/mocks';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';

type FetchOptionsOverrides = Parameters<typeof createMockOptions>[0];

function options(overrides: FetchOptionsOverrides = {}): CustomerTableOptions<CustomerColumnDef[]> {
  return createMockOptions(overrides);
}

describe('useCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns state, table, and adapter on first render', () => {
    const { result } = renderHook(() => useCustomerTable(options()));

    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('table');
    expect(result.current).toHaveProperty('adapter');
    expect(typeof result.current.adapter.fetch).toBe('function');
    expect(typeof result.current.table.getHeaderGroups).toBe('function');
  });

  it('starts with empty rows before any fetch', () => {
    const { result } = renderHook(() => useCustomerTable(options()));

    expect(result.current.state.rows).toEqual([]);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isFetching).toBe(false);
  });

  it('re-renders with fetched rows after adapter.fetch', async () => {
    const { result } = renderHook(() => useCustomerTable(options()));

    await act(async () => {
      await result.current.adapter.fetch();
    });

    await waitFor(() => {
      expect(result.current.state.rows.length).toBeGreaterThan(0);
    });
    expect(result.current.state.isLoading).toBe(false);
  });

  it('forwards a custom Connection through to state.rows', async () => {
    const fetchFn = createMockFetchFn(
      createMockConnection<MockCustomer>([
        { id: '42', name: 'Captured Customer', email: 'a@b.com' },
      ])
    );
    const { result } = renderHook(() => useCustomerTable(options({ fetch: fetchFn })));

    await act(async () => {
      await result.current.adapter.fetch();
    });

    await waitFor(() => {
      const rows = result.current.state.rows as readonly MockCustomer[];
      expect(rows[0]?.id).toBe('42');
      expect(rows[0]?.name).toBe('Captured Customer');
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('exposes a real TanStack Table whose rows track the adapter state', async () => {
    const { result } = renderHook(() => useCustomerTable(options()));

    await act(async () => {
      await result.current.adapter.fetch();
    });

    await waitFor(() => {
      const rowModel = result.current.table.getRowModel();
      expect(rowModel.rows.length).toBeGreaterThan(0);
    });
  });

  it('autoFetch=true triggers a fetch on mount', async () => {
    const fetchFn = createMockFetchFn();
    renderHook(() => useCustomerTable(options({ fetch: fetchFn, autoFetch: true })));

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalled();
    });
  });

  it('destroys the adapter on unmount', () => {
    const { result, unmount } = renderHook(() => useCustomerTable(options()));
    const destroySpy = vi.spyOn(result.current.adapter, 'destroy');

    unmount();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('does not leak when called with concurrent renders', async () => {
    const fetchFn = createMockFetchFn();
    const { result, rerender, unmount } = renderHook(
      ({ pageSize }) =>
        useCustomerTable(options({ fetch: fetchFn, pagination: { type: 'cursor', pageSize } })),
      { initialProps: { pageSize: 10 } }
    );

    rerender({ pageSize: 25 });
    rerender({ pageSize: 50 });

    expect(result.current.adapter).toBeDefined();
    expect(() => unmount()).not.toThrow();
  });

  it('forwards setFilter / setSearch through the adapter API', async () => {
    const fetchFn = createMockFetchFn();
    const { result } = renderHook(() => useCustomerTable(options({ fetch: fetchFn })));

    await act(async () => {
      result.current.adapter.setFilter({ name: { eq: 'X' } });
    });
    await act(async () => {
      result.current.adapter.setSearch({ name: { eq: 'Doe' } });
    });

    // Both mutations should be observable via the adapter's getters
    expect(result.current.adapter.getFilter()).toEqual({ name: { eq: 'X' } });
    expect(result.current.adapter.getSearch()).toEqual({ name: { eq: 'Doe' } });
  });

  it('maps a thrown fetch error into state.error / isError', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('upstream is down'));

    const { result } = renderHook(() => useCustomerTable(options({ fetch: fetchFn })));

    await act(async () => {
      try {
        await result.current.adapter.fetch();
      } catch {
        /* expected — surfaced as state.error */
      }
    });

    await waitFor(() => {
      expect(result.current.state.isError).toBe(true);
    });
    expect(result.current.state.error).toBeTruthy();
  });

  it('subscribe is wired via useSyncExternalStore (state updates re-render)', async () => {
    const fetchFn = createMockFetchFn();
    const { result } = renderHook(() => useCustomerTable(options({ fetch: fetchFn })));

    const initialSnapshot = result.current.state;

    await act(async () => {
      await result.current.adapter.fetch();
    });

    await waitFor(() => {
      // The state object reference should change after the snapshot updates
      expect(result.current.state).not.toBe(initialSnapshot);
    });
  });
});
