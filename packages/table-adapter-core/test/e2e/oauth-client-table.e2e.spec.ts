/**
 * @fileoverview E2E: createOAuthClientTable against the real InsurUp API (in-memory).
 */

import { createOAuthClientTable } from '../../src/entities/oauth-client/factory.js';
import {
  describeInMemoryE2E,
  createE2EClient,
  e2eClientOptions,
} from '../utils/in-memory-e2e-suite.js';

describeInMemoryE2E({
  name: 'createOAuthClientTable',
  buildFetchAll: (pageSize) => {
    const client = createE2EClient();
    return createOAuthClientTable({
      columns: (col) => [col.id(), col.clientId({ header: 'Client', sortable: true })],
      fetchAll: (opts) => client.oauthClients.getOAuthClients(opts),
      pagination: { type: 'cursor', pageSize },
    });
  },
  buildClient: (pageSize) =>
    createOAuthClientTable({
      columns: (col) => [col.id(), col.clientId({ header: 'Client', sortable: true })],
      client: e2eClientOptions(),
      pagination: { type: 'cursor', pageSize },
    }),
  idOf: (r: { id: string }) => r.id,
  sortColumnId: 'clientId',
  sortValueOf: (r: { clientId: string }) => r.clientId,
  searchableValuesOf: (r: { id: string; clientId: string }) => [r.id, r.clientId],
  searchTextOf: (r: { clientId: string }) => r.clientId,
  searchFilter: (term) => ({ $search: term }),
});
