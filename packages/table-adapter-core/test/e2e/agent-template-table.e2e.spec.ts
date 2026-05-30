/**
 * @fileoverview E2E: createAgentTemplateTable against the real InsurUp API (in-memory).
 *
 * Templates are keyed by `key` rather than `id`.
 */

import { createAgentTemplateTable } from '../../src/entities/agent-template/factory.js';
import {
  describeInMemoryE2E,
  createE2EClient,
  e2eClientOptions,
} from '../utils/in-memory-e2e-suite.js';

describeInMemoryE2E({
  name: 'createAgentTemplateTable',
  buildFetchAll: (pageSize) => {
    const client = createE2EClient();
    return createAgentTemplateTable({
      columns: (col) => [col.key(), col.name({ header: 'Name', sortable: true })],
      fetchAll: (opts) => client.templates.getAllTemplates(opts),
      pagination: { type: 'cursor', pageSize },
    });
  },
  buildClient: (pageSize) =>
    createAgentTemplateTable({
      columns: (col) => [col.key(), col.name({ header: 'Name', sortable: true })],
      client: e2eClientOptions(),
      pagination: { type: 'cursor', pageSize },
    }),
  idOf: (r: { key: string }) => r.key,
  sortColumnId: 'name',
  sortValueOf: (r: { name: string }) => r.name,
  searchableValuesOf: (r: { key: string; name: string }) => [r.key, r.name],
  searchTextOf: (r: { name: string }) => r.name,
  searchFilter: (term) => ({ $search: term }),
});
