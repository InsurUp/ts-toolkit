/**
 * @fileoverview E2E filter + search routing for createPolicyTable.
 *
 * Confirms the policy entity's wiring routes the unified filter into the right
 * server slots.
 */

import { expect, it } from 'vitest';
import { createPolicyTable } from '../../src/entities/policy/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createPolicyTable filter + search [e2e]', () => {
  it('routes a $search-marked insuredCustomerName through the server search slot', async () => {
    const client = createE2EClient();
    const table = createPolicyTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.policies.getPolicies(vars, opts),
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

  it('accepts the renamed `notContains` filter op on a real policies request', async () => {
    const client = createE2EClient();
    const table = createPolicyTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.policies.getPolicies(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      defaultFilter: {
        insuredCustomerName: { notContains: 'zzzunlikely' },
      },
    });
    try {
      await table.fetch();
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('splits filter + search across both slots in one call', async () => {
    const client = createE2EClient();
    const table = createPolicyTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.policies.getPolicies(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        insuredCustomerName: { $search: true, textSearch: 'a' },
        insuranceCompanyPolicyNumber: { notContains: 'zzz' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
