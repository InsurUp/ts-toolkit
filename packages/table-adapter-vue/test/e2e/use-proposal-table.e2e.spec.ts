/**
 * @fileoverview E2E: useProposalTable composable against the real InsurUp API.
 *
 * Mirrors the unit suite's defineComponent + mount + nextTick idiom but swaps
 * the mocked fetch for the real M2M-authenticated SDK client. Proves that real
 * adapter state changes propagate through Vue's reactive ShallowRef.
 */

import { expect, it } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { ProposalState } from '@insurup/sdk';
import type { ProposalTableOptions, ProposalColumnDef } from '@insurup/table-adapter-core';
import { useProposalTable } from '../../src/use-proposal-table';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitFor } from '@insurup/test-helpers-e2e/wait';

type Options = ProposalTableOptions<ProposalColumnDef[]>;

function mountWith(options: Options) {
  const TestComponent = defineComponent({
    setup() {
      return useProposalTable(options);
    },
    template: '<div />',
  });
  return mount(TestComponent);
}

describeE2E('useProposalTable [e2e]', () => {
  it('autoFetch populates the reactive state ref with real rows', async () => {
    const client = createE2EClient();
    const wrapper = mountWith({
      columns: (col) => [col.id(), col.state(), col.productBranch()],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      autoFetch: true,
    });

    try {
      await waitFor(() => wrapper.vm.state.isSuccess === true, 15_000);
      await nextTick();

      expect(wrapper.vm.state.error).toBeNull();
      expect(wrapper.vm.state.rows.length).toBeLessThanOrEqual(3);
    } finally {
      wrapper.unmount();
    }
  });

  it('pagination.next() updates the reactive state with new rows', async () => {
    const client = createE2EClient();
    const wrapper = mountWith({
      columns: (col) => [col.id(), col.state()],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });

    try {
      await wrapper.vm.adapter.fetch();
      await nextTick();
      await waitFor(() => wrapper.vm.state.isSuccess === true, 15_000);

      const firstIds = wrapper.vm.state.rows.map((r) => r.id);
      if (firstIds.length < 3 || !wrapper.vm.adapter.pagination.canGoNext()) {
        return; // Tenant lacks enough data to paginate.
      }

      wrapper.vm.adapter.pagination.next();
      await waitFor(
        () =>
          !wrapper.vm.state.isFetching &&
          wrapper.vm.state.rows.map((r) => r.id).join(',') !== firstIds.join(','),
        15_000
      );
      await nextTick();

      const secondIds = wrapper.vm.state.rows.map((r) => r.id);
      const overlap = secondIds.filter((id) => firstIds.includes(id));
      expect(overlap).toEqual([]);
    } finally {
      wrapper.unmount();
    }
  });

  it('setFilter updates the reactive state with constrained rows', async () => {
    const client = createE2EClient();
    const wrapper = mountWith({
      columns: (col) => [col.id(), col.state()],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 10 },
    });

    try {
      wrapper.vm.adapter.setFilter({ state: { eq: ProposalState.Active } });
      await waitFor(
        () => wrapper.vm.state.isSuccess === true && !wrapper.vm.state.isFetching,
        15_000
      );
      await nextTick();

      for (const row of wrapper.vm.state.rows) {
        expect(row.state).toBe(ProposalState.Active);
      }
    } finally {
      wrapper.unmount();
    }
  });
});
