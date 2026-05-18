/**
 * @fileoverview E2E: useCustomerTable against the real InsurUp API.
 *
 * Mirrors the unit suite's renderHook + act + waitFor idiom but swaps the
 * mocked fetch for the real M2M-authenticated SDK client. Proves that real
 * adapter state changes flow through useSyncExternalStore and cause React
 * to re-render with fresh data.
 */

import { expect, it } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CustomerType } from '@insurup/sdk';
import { useCustomerTable } from '../../src/use-customer-table';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';

describeE2E('useCustomerTable [e2e]', () => {
  it('autoFetch propagates real rows through useSyncExternalStore', async () => {
    const client = createE2EClient();
    const { result, unmount } = renderHook(() =>
      useCustomerTable({
        columns: (col) => [col.id(), col.name('Name'), col.type('Type')],
        fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
        pagination: { type: 'cursor', pageSize: 3 },
        autoFetch: true,
      })
    );

    try {
      await waitFor(
        () => {
          expect(result.current.state.isSuccess).toBe(true);
        },
        { timeout: 15_000 }
      );

      expect(result.current.state.error).toBeNull();
      expect(result.current.state.rows.length).toBeLessThanOrEqual(3);
    } finally {
      unmount();
    }
  });

  it('pagination.next() re-renders with new rows', async () => {
    const client = createE2EClient();
    const { result, unmount } = renderHook(() =>
      useCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
        pagination: { type: 'cursor', pageSize: 3 },
      })
    );

    try {
      await act(async () => {
        await result.current.adapter.fetch();
      });
      await waitFor(() => {
        expect(result.current.state.isSuccess).toBe(true);
      });

      const firstIds = result.current.state.rows.map((r) => r.id);
      if (firstIds.length < 3 || !result.current.adapter.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      await act(async () => {
        result.current.adapter.pagination.next();
      });
      await waitFor(
        () => {
          expect(result.current.state.isFetching).toBe(false);
          expect(result.current.state.rows.map((r) => r.id)).not.toEqual(firstIds);
        },
        { timeout: 15_000 }
      );

      const secondIds = result.current.state.rows.map((r) => r.id);
      const overlap = secondIds.filter((id) => firstIds.includes(id));
      expect(overlap).toEqual([]);
    } finally {
      unmount();
    }
  });

  it('setFilter re-renders with constrained rows', async () => {
    const client = createE2EClient();
    const { result, unmount } = renderHook(() =>
      useCustomerTable({
        columns: (col) => [col.id(), col.type('Type')],
        fetch: (vars, opts) => client.customers.getCustomers(vars, opts),
        pagination: { type: 'cursor', pageSize: 10 },
      })
    );

    try {
      await act(async () => {
        result.current.adapter.setFilter({ type: { eq: CustomerType.Individual } });
      });
      await waitFor(
        () => {
          expect(result.current.state.isSuccess).toBe(true);
          expect(result.current.state.isFetching).toBe(false);
        },
        { timeout: 15_000 }
      );

      for (const row of result.current.state.rows) {
        expect(row.type).toBe(CustomerType.Individual);
      }
    } finally {
      unmount();
    }
  });
});
