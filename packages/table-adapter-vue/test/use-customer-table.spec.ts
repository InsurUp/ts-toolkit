/**
 * @fileoverview useCustomerTable Composable Tests
 * @description Real-Vue, real-adapter tests via @vue/test-utils mount.
 * Only the fetch function is mocked; everything else (Vue reactivity, the core
 * adapter, TanStack Vue Table) runs end-to-end so the test exercises the
 * shallowRef subscription path, onUnmounted cleanup, and computed propagation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useCustomerTable } from '../src/use-customer-table';
import {
  createMockConnection,
  createMockFetchFn,
  createMockOptions,
  type MockCustomer,
} from './utils/mocks';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';

type Options = CustomerTableOptions<CustomerColumnDef[]>;
type FetchOptionsOverrides = Parameters<typeof createMockOptions>[0];

function makeOptions(overrides: FetchOptionsOverrides = {}): Options {
  return createMockOptions(overrides);
}

function mountWith(options: Options) {
  const TestComponent = defineComponent({
    setup() {
      return useCustomerTable(options);
    },
    template: '<div />',
  });
  return mount(TestComponent);
}

describe('useCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns state, table, and adapter on first render', () => {
    const wrapper = mountWith(makeOptions());

    expect(wrapper.vm).toHaveProperty('state');
    expect(wrapper.vm).toHaveProperty('table');
    expect(wrapper.vm).toHaveProperty('adapter');
    expect(typeof wrapper.vm.adapter.fetch).toBe('function');
    expect(typeof wrapper.vm.table.getHeaderGroups).toBe('function');

    wrapper.unmount();
  });

  it('starts with empty rows before any fetch', () => {
    const wrapper = mountWith(makeOptions());

    expect(wrapper.vm.state.rows).toEqual([]);
    expect(wrapper.vm.state.isLoading).toBe(false);

    wrapper.unmount();
  });

  it('updates the reactive state ref after adapter.fetch', async () => {
    const wrapper = mountWith(makeOptions());

    await wrapper.vm.adapter.fetch();
    await nextTick();

    expect(wrapper.vm.state.rows.length).toBeGreaterThan(0);
    expect(wrapper.vm.state.isLoading).toBe(false);

    wrapper.unmount();
  });

  it('forwards a custom Connection through to state.rows', async () => {
    const fetchFn = createMockFetchFn(
      createMockConnection<MockCustomer>([
        { id: '42', name: 'Captured Customer', email: 'a@b.com' },
      ])
    );
    const wrapper = mountWith(makeOptions({ fetch: fetchFn }));

    await wrapper.vm.adapter.fetch();
    await nextTick();

    const rows = wrapper.vm.state.rows as readonly MockCustomer[];
    expect(rows[0]?.id).toBe('42');
    expect(rows[0]?.name).toBe('Captured Customer');
    expect(fetchFn).toHaveBeenCalledTimes(1);

    wrapper.unmount();
  });

  it('exposes a real TanStack Table whose rows track adapter state', async () => {
    const wrapper = mountWith(makeOptions());

    await wrapper.vm.adapter.fetch();
    await nextTick();

    const rowModel = wrapper.vm.table.getRowModel();
    expect(rowModel.rows.length).toBeGreaterThan(0);

    wrapper.unmount();
  });

  it('autoFetch=true triggers a fetch on mount', async () => {
    const fetchFn = createMockFetchFn();
    const wrapper = mountWith(makeOptions({ fetch: fetchFn, autoFetch: true }));

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchFn).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('destroys the adapter on unmount', () => {
    const wrapper = mountWith(makeOptions());
    const destroySpy = vi.spyOn(wrapper.vm.adapter, 'destroy');

    wrapper.unmount();

    expect(destroySpy).toHaveBeenCalled();
  });

  it('forwards setFilter (filter + search-marked entries) through the adapter API', async () => {
    const wrapper = mountWith(makeOptions());

    wrapper.vm.adapter.setFilter({ name: { eq: 'X' } });
    expect(wrapper.vm.adapter.getFilter()).toEqual({ name: { eq: 'X' } });

    wrapper.vm.adapter.setFilter({
      name: { $search: true, textSearch: { value: 'Doe' } },
    });
    expect(wrapper.vm.adapter.getFilter()).toEqual({
      name: { $search: true, textSearch: { value: 'Doe' } },
    });

    wrapper.unmount();
  });

  it('maps a thrown fetch error into state.error / isError', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('upstream is down'));
    const wrapper = mountWith(makeOptions({ fetch: fetchFn }));

    try {
      await wrapper.vm.adapter.fetch();
    } catch {
      /* expected — surfaced via state.error */
    }
    await nextTick();

    expect(wrapper.vm.state.isError).toBe(true);
    expect(wrapper.vm.state.error).toBeTruthy();

    wrapper.unmount();
  });

  it('subscribe is wired (state ref updates after fetch)', async () => {
    const wrapper = mountWith(makeOptions());
    const initialSnapshot = wrapper.vm.state;

    await wrapper.vm.adapter.fetch();
    await nextTick();

    expect(wrapper.vm.state).not.toBe(initialSnapshot);
    wrapper.unmount();
  });
});
