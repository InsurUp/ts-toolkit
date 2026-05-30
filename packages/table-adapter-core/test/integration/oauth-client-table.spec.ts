/**
 * @fileoverview OAuth Client Table Integration Tests (in-memory).
 */

import type { GetOAuthClientsResult } from '@insurup/sdk';
import {
  createOAuthClientTable,
  createInfiniteOAuthClientTable,
} from '../../src/entities/oauth-client/factory.js';
import { describeInMemoryTable } from '../utils/in-memory-suite.js';

const rows = [
  { id: 'O1', clientId: 'web-portal', displayName: 'Web Portal' },
  { id: 'O2', clientId: 'mobile-ios', displayName: 'Mobile iOS' },
  { id: 'O3', clientId: 'mobile-android', displayName: 'Mobile Android' },
  { id: 'O4', clientId: 'partner-api', displayName: 'Partner API' },
  { id: 'O5', clientId: 'admin-cli', displayName: 'Admin CLI' },
] as GetOAuthClientsResult[];

describeInMemoryTable({
  name: 'createOAuthClientTable',
  rows,
  orderedIds: ['O1', 'O2', 'O3', 'O4', 'O5'],
  idOf: (r: { id: string }) => r.id,
  build: (fetchAll, pageSize) =>
    createOAuthClientTable({
      columns: (col) => [
        col.id(),
        col.clientId({ header: 'Client', sortable: true }),
        col.displayName(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  buildInfinite: (fetchAll, pageSize) =>
    createInfiniteOAuthClientTable({
      columns: (col) => [
        col.id(),
        col.clientId({ header: 'Client', sortable: true }),
        col.displayName(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  search: { filter: { $search: 'mobile' }, expectedIds: ['O2', 'O3'] },
  fieldFilter: { filter: { clientId: { eq: 'admin-cli' } }, expectedIds: ['O5'] },
  sort: {
    sorting: [{ id: 'clientId', desc: false }],
    expectedIds: ['O5', 'O3', 'O2', 'O4', 'O1'],
  },
});
