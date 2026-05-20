/**
 * @fileoverview E2E filter + search routing for createAgentUserTable.
 */

import { expect, it } from 'vitest';
import { createAgentUserTable } from '../../src/entities/agent-user/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createAgentUserTable filter + search [e2e]', () => {
  it('routes $search-marked email through the server search slot', async () => {
    const client = createE2EClient();
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.email('Email')],
      fetch: (vars, opts) => client.agentUsers.getAgentUsers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
    });
    try {
      table.setFilter({ email: { $search: true, textSearch: 'a' } });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('accepts the renamed `notContains` filter op on agent users', async () => {
    const client = createE2EClient();
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.email('Email')],
      fetch: (vars, opts) => client.agentUsers.getAgentUsers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      defaultFilter: { email: { notContains: 'zzzunlikely' } },
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

  it('splits a mixed filter + search payload across both slots in one call', async () => {
    const client = createE2EClient();
    const table = createAgentUserTable({
      columns: (col) => [col.id(), col.firstName('First'), col.email('Email')],
      fetch: (vars, opts) => client.agentUsers.getAgentUsers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        email: { $search: true, textSearch: 'a' },
        firstName: { notContains: 'zzz' },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
