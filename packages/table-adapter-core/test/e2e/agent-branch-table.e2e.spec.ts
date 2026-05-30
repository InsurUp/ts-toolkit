/**
 * @fileoverview E2E: createAgentBranchTable against the real InsurUp API (in-memory).
 */

import { createAgentBranchTable } from '../../src/entities/agent-branch/factory.js';
import {
  describeInMemoryE2E,
  createE2EClient,
  e2eClientOptions,
} from '../utils/in-memory-e2e-suite.js';

describeInMemoryE2E({
  name: 'createAgentBranchTable',
  buildFetchAll: (pageSize) => {
    const client = createE2EClient();
    return createAgentBranchTable({
      columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true })],
      fetchAll: (opts) => client.agentBranches.getAgentBranches(opts),
      pagination: { type: 'cursor', pageSize },
    });
  },
  buildClient: (pageSize) =>
    createAgentBranchTable({
      columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true })],
      client: e2eClientOptions(),
      pagination: { type: 'cursor', pageSize },
    }),
  idOf: (r: { id: string }) => r.id,
  sortColumnId: 'name',
  sortValueOf: (r: { name: string }) => r.name,
  searchableValuesOf: (r: { id: string; name: string }) => [r.id, r.name],
  searchTextOf: (r: { name: string }) => r.name,
  searchFilter: (term) => ({ $search: term }),
});
