/**
 * @fileoverview E2E filter + search routing for createProposalTable.
 *
 * Confirms the proposal entity's wiring routes the unified filter into the
 * right server slots.
 */

import { expect, it } from 'vitest';
import { createProposalTable } from '../../src/entities/proposal/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createProposalTable filter + search [e2e]', () => {
  it('routes a $search-marked insuredCustomerName through the server search slot', async () => {
    const client = createE2EClient();
    const table = createProposalTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setFilter({
        insuredCustomerName: { $search: true, textSearch: 'a' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('accepts a search clause with score.boost', async () => {
    const client = createE2EClient();
    const table = createProposalTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        insuredCustomerName: {
          $search: true,
          textSearch: { value: 'a', score: { boost: 2 } },
        },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('splits filter + search across both slots in one call', async () => {
    const client = createE2EClient();
    const table = createProposalTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        insuredCustomerName: { $search: true, textSearch: 'a' },
        insuredCustomerIdentityNumber: { notContains: 'zzz' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
