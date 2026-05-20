/**
 * @fileoverview E2E filter + search routing for createFilePolicyTransferTable.
 *
 * FilePolicyTransfer has `fileName` as its sole searchable field plus a rich
 * filter surface (enum sourceType, dates, numeric counts).
 */

import { expect, it } from 'vitest';
import { createFilePolicyTransferTable } from '../../src/entities/file-policy-transfer/factory.js';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

describeE2E('createFilePolicyTransferTable filter + search [e2e]', () => {
  it('routes $search-marked fileName through the server search slot', async () => {
    const client = createE2EClient();
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName('File')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({ fileName: { $search: true, textSearch: 'a' } });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });

  it('accepts the renamed `notContains` filter op on fileName', async () => {
    const client = createE2EClient();
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName('File')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      defaultFilter: { fileName: { notContains: 'zzzunlikely' } },
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

  it('splits a mixed filter + search payload in one call', async () => {
    const client = createE2EClient();
    const table = createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName('File'), col.totalPolicyCount('Total')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        fileName: { $search: true, textSearch: 'a' },
        succeededPolicyCount: { gte: 0 },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
