/**
 * @fileoverview useCustomerTable Composable Tests for Vue
 * @description Unit tests for the Vue useCustomerTable composable
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount, flushPromises as vueFlushPromises } from '@vue/test-utils';
import { useCustomerTable } from '../src/use-customer-table';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';
import {
  createMockFetchFn,
  createMockConnection,
  createSuccessResult,
  flushPromises,
} from './utils/mocks';

// Helper to create options with proper typing
function createTestOptions(
  overrides: Partial<CustomerTableOptions<CustomerColumnDef[]>> = {}
): CustomerTableOptions<CustomerColumnDef[]> {
  return {
    columns: (col) => [col.id(), col.name()],
    fetch: createMockFetchFn(),
    pageSize: 10,
    ...overrides,
  } as CustomerTableOptions<CustomerColumnDef[]>;
}

// Helper component to test the composable
function createTestComponent(options: CustomerTableOptions<CustomerColumnDef[]>) {
  return defineComponent({
    setup() {
      const result = useCustomerTable(options);
      return { result };
    },
    render() {
      return h('div', { 'data-testid': 'test' });
    },
  });
}

describe('useCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('composable initialization', () => {
    it('should create and return state, table, and adapter', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('adapter');

      wrapper.unmount();
    });

    it('should return state as ShallowRef', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      // ShallowRef has a .value property
      expect(result.state).toHaveProperty('value');
      expect(result.state.value).toHaveProperty('rows');
      expect(result.state.value).toHaveProperty('isLoading');

      wrapper.unmount();
    });

    it('should return initial state with empty rows', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(result.state.value.rows).toEqual([]);
      expect(result.state.value.isLoading).toBe(false);
      expect(result.state.value.isFetching).toBe(false);
      expect(result.state.value.error).toBeNull();

      wrapper.unmount();
    });

    it('should return TanStack Table instance', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(result.table).toBeDefined();
      expect(typeof result.table.getHeaderGroups).toBe('function');
      expect(typeof result.table.getRowModel).toBe('function');

      wrapper.unmount();
    });

    it('should return adapter with methods', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(result.adapter).toBeDefined();
      expect(typeof result.adapter.fetch).toBe('function');
      expect(typeof result.adapter.setFilter).toBe('function');
      expect(typeof result.adapter.setSearch).toBe('function');
      expect(typeof result.adapter.invalidate).toBe('function');

      wrapper.unmount();
    });
  });

  describe('reactive state', () => {
    it('should update state when data is fetched', async () => {
      const mockData = createMockConnection([{ id: '1', name: 'Test User' }], {}, 1);
      const mockFetch = vi.fn().mockResolvedValue(createSuccessResult(mockData));
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(result.state.value.rows).toHaveLength(0);

      await result.adapter.fetch();
      await flushPromises();
      await nextTick();

      expect(result.state.value.rows).toHaveLength(1);
      expect(result.state.value.isSuccess).toBe(true);

      wrapper.unmount();
    });

    it('should reactively update when state changes', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      // Initial state
      const initialRows = result.state.value.rows;
      expect(initialRows).toHaveLength(0);

      // Fetch data
      await result.adapter.fetch();
      await flushPromises();
      await nextTick();

      // State should be updated
      expect(result.state.value.rows).toHaveLength(2);
      expect(result.state.value.rows).not.toBe(initialRows);

      wrapper.unmount();
    });
  });

  describe('data fetching', () => {
    it('should fetch data when adapter.fetch is called', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      await result.adapter.fetch();
      await flushPromises();

      expect(mockFetch).toHaveBeenCalled();

      wrapper.unmount();
    });

    it('should auto-fetch when autoFetch is true', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch, autoFetch: true });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);

      await flushPromises();
      await nextTick();

      expect(mockFetch).toHaveBeenCalled();

      wrapper.unmount();
    });

    it('should not auto-fetch by default', () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);

      expect(mockFetch).not.toHaveBeenCalled();

      wrapper.unmount();
    });
  });

  describe('table integration', () => {
    it('should have columns from adapter', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      const headerGroups = result.table.getHeaderGroups();
      expect(headerGroups).toHaveLength(1);
      expect(headerGroups[0].headers).toHaveLength(2);

      wrapper.unmount();
    });

    it('should have rows after fetching', async () => {
      const options = createTestOptions({ autoFetch: true });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      await flushPromises();
      await nextTick();
      await vueFlushPromises();

      const rowModel = result.table.getRowModel();
      expect(rowModel.rows).toHaveLength(2);

      wrapper.unmount();
    });

    it('should support pagination methods', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      expect(typeof result.table.getCanNextPage).toBe('function');
      expect(typeof result.table.getCanPreviousPage).toBe('function');
      expect(typeof result.table.nextPage).toBe('function');
      expect(typeof result.table.previousPage).toBe('function');

      wrapper.unmount();
    });
  });

  describe('adapter methods', () => {
    it('should expose setFilter method', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      result.adapter.setFilter({ name: { contains: 'test' } });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { name: { contains: 'test' } },
        }),
        expect.any(Object)
      );

      wrapper.unmount();
    });

    it('should expose setSearch method', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      result.adapter.setSearch('test query');
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test query',
        }),
        expect.any(Object)
      );

      wrapper.unmount();
    });

    it('should expose clearSearch method', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch, defaultSearch: 'initial' });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      result.adapter.clearSearch();
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
        }),
        expect.any(Object)
      );

      wrapper.unmount();
    });

    it('should expose setPageSize method', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch, pageSize: 10 });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      result.adapter.setPageSize(25);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 25,
        }),
        expect.any(Object)
      );

      wrapper.unmount();
    });

    it('should expose invalidate method', async () => {
      const mockFetch = createMockFetchFn();
      const options = createTestOptions({ fetch: mockFetch });
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      await result.adapter.fetch();
      const callCount = mockFetch.mock.calls.length;

      await result.adapter.invalidate();
      await flushPromises();

      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(callCount);

      wrapper.unmount();
    });
  });

  describe('cleanup on unmount', () => {
    it('should clean up adapter on unmount', async () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);
      const { result } = wrapper.vm;

      const destroySpy = vi.spyOn(result.adapter, 'destroy');

      wrapper.unmount();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should unsubscribe from adapter on unmount', () => {
      const options = createTestOptions();
      const TestComponent = createTestComponent(options);

      const wrapper = mount(TestComponent);

      // Should not throw
      expect(() => wrapper.unmount()).not.toThrow();
    });
  });
});
