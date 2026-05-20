/**
 * @fileoverview E2E filter + search routing for createCaseTable.
 *
 * Confirms the case entity's wiring routes the unified filter into the right
 * server slots: enum filter on `type`, $search-marked search on `ref`, and
 * a mixed-in-one-call payload that splits across both slots.
 */

import { expect, it } from 'vitest';
import { CaseType } from '@insurup/sdk';
import { createCaseTable } from '../../src/entities/case/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createCaseTable filter + search [e2e]', () => {
  it('filters cases by enum type', async () => {
    const client = createE2EClient();
    const table = createCaseTable({
      columns: (col) => [col.id(), col.type('Type')],
      fetch: (vars, opts) => client.cases.getCases(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      defaultFilter: { type: { eq: CaseType.SaleOpportunity } },
    });
    try {
      await table.fetch();
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      for (const row of state.rows) {
        expect(row.type).toBe(CaseType.SaleOpportunity);
      }
    } finally {
      table.destroy();
    }
  });

  it('routes a $search-marked ref through the server search slot', async () => {
    const client = createE2EClient();
    const table = createCaseTable({
      columns: (col) => [col.id(), col.ref('Ref')],
      fetch: (vars, opts) => client.cases.getCases(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setFilter({
        ref: { $search: true, textSearch: 'a' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('splits a mixed filter + search payload across both server slots in one call', async () => {
    const client = createE2EClient();
    const table = createCaseTable({
      columns: (col) => [col.id(), col.type('Type'), col.ref('Ref')],
      fetch: (vars, opts) => client.cases.getCases(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setFilter({
        type: { eq: CaseType.SaleOpportunity },
        ref: { $search: true, textSearch: 'a' },
      });
      await waitForIdle(table);

      const state = table.getState();
      expect(state.error).toBeNull();
      expect(state.isSuccess).toBe(true);
      for (const row of state.rows) {
        expect(row.type).toBe(CaseType.SaleOpportunity);
      }
    } finally {
      table.destroy();
    }
  });
});
