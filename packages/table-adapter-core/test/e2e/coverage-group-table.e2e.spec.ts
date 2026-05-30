/**
 * @fileoverview E2E: createCoverageGroupTable against the real InsurUp API (in-memory).
 */

import { createCoverageGroupTable } from '../../src/entities/coverage-group/factory.js';
import {
  describeInMemoryE2E,
  createE2EClient,
  e2eClientOptions,
} from '../utils/in-memory-e2e-suite.js';

describeInMemoryE2E({
  name: 'createCoverageGroupTable',
  buildFetchAll: (pageSize) => {
    const client = createE2EClient();
    return createCoverageGroupTable({
      columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true })],
      fetchAll: (opts) => client.coverage.getAllCoverageGroups(opts),
      pagination: { type: 'cursor', pageSize },
    });
  },
  buildClient: (pageSize) =>
    createCoverageGroupTable({
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
