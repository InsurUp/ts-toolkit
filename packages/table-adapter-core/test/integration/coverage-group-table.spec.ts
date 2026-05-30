/**
 * @fileoverview Coverage Group Table Integration Tests (in-memory).
 */

import type { GetCoverageGroupsResultItem } from '@insurup/sdk';
import {
  createCoverageGroupTable,
  createInfiniteCoverageGroupTable,
} from '../../src/entities/coverage-group/factory.js';
import { describeInMemoryTable } from '../utils/in-memory-suite.js';

const rows = [
  { id: 'C1', name: 'Kasko Full', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'C2', name: 'Trafik', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'C3', name: 'Konut', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'C4', name: 'DASK', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'C5', name: 'Saglik', createdAt: '2024-05-01T00:00:00Z' },
] as GetCoverageGroupsResultItem[];

describeInMemoryTable({
  name: 'createCoverageGroupTable',
  rows,
  orderedIds: ['C1', 'C2', 'C3', 'C4', 'C5'],
  idOf: (r: { id: string }) => r.id,
  build: (fetchAll, pageSize) =>
    createCoverageGroupTable({
      columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true }), col.createdAt()],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  buildInfinite: (fetchAll, pageSize) =>
    createInfiniteCoverageGroupTable({
      columns: (col) => [col.id(), col.name({ header: 'Name', sortable: true }), col.createdAt()],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  search: { filter: { $search: 'ka' }, expectedIds: ['C1'] },
  fieldFilter: { filter: { name: { eq: 'Trafik' } }, expectedIds: ['C2'] },
  sort: {
    sorting: [{ id: 'name', desc: false }],
    expectedIds: ['C4', 'C1', 'C3', 'C5', 'C2'],
  },
});
