/**
 * @fileoverview Agent Branch Table Integration Tests (in-memory).
 */

import type { GetAllAgentBranchesResult } from '@insurup/sdk';
import {
  createAgentBranchTable,
  createInfiniteAgentBranchTable,
} from '../../src/entities/agent-branch/factory.js';
import { describeInMemoryTable } from '../utils/in-memory-suite.js';

const rows = [
  { id: 'B1', name: 'Head Office', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'B2', name: 'Branch West', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'B3', name: 'Branch East', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'B4', name: 'Sales', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'B5', name: 'Support', createdAt: '2024-05-01T00:00:00Z' },
] as GetAllAgentBranchesResult[];

describeInMemoryTable({
  name: 'createAgentBranchTable',
  rows,
  orderedIds: ['B1', 'B2', 'B3', 'B4', 'B5'],
  idOf: (r: { id: string }) => r.id,
  build: (fetchAll, pageSize) =>
    createAgentBranchTable({
      columns: (col) => [
        col.id(),
        col.name({ header: 'Name', sortable: true }),
        col.parentBranchId(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  buildInfinite: (fetchAll, pageSize) =>
    createInfiniteAgentBranchTable({
      columns: (col) => [
        col.id(),
        col.name({ header: 'Name', sortable: true }),
        col.parentBranchId(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  search: { filter: { $search: 'branch' }, expectedIds: ['B2', 'B3'] },
  fieldFilter: { filter: { name: { eq: 'Sales' } }, expectedIds: ['B4'] },
  sort: {
    sorting: [{ id: 'name', desc: false }],
    expectedIds: ['B3', 'B2', 'B1', 'B4', 'B5'],
  },
});
