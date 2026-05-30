/**
 * @fileoverview Agent Insurance Company Table Integration Tests (in-memory).
 */

import type { GetMyAgentInsuranceCompaniesResult } from '@insurup/sdk';
import {
  createAgentInsuranceCompanyTable,
  createInfiniteAgentInsuranceCompanyTable,
} from '../../src/entities/agent-insurance-company/factory.js';
import { describeInMemoryTable } from '../utils/in-memory-suite.js';

// Names are reverse-alphabetical to the id order so sorting visibly reorders.
const rows = [
  { id: 'A1', insuranceCompanyId: 10, insuranceCompanyName: 'Sompo' },
  { id: 'A2', insuranceCompanyId: 20, insuranceCompanyName: 'Mapfre' },
  { id: 'A3', insuranceCompanyId: 30, insuranceCompanyName: 'HDI' },
  { id: 'A4', insuranceCompanyId: 40, insuranceCompanyName: 'Axa' },
  { id: 'A5', insuranceCompanyId: 50, insuranceCompanyName: 'Allianz' },
] as GetMyAgentInsuranceCompaniesResult[];

describeInMemoryTable({
  name: 'createAgentInsuranceCompanyTable',
  rows,
  orderedIds: ['A1', 'A2', 'A3', 'A4', 'A5'],
  idOf: (r: { id: string }) => r.id,
  build: (fetchAll, pageSize) =>
    createAgentInsuranceCompanyTable({
      columns: (col) => [
        col.id(),
        col.insuranceCompanyName({ header: 'Company', sortable: true }),
        col.insuranceCompanyId(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  buildInfinite: (fetchAll, pageSize) =>
    createInfiniteAgentInsuranceCompanyTable({
      columns: (col) => [
        col.id(),
        col.insuranceCompanyName({ header: 'Company', sortable: true }),
        col.insuranceCompanyId(),
      ],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  search: { filter: { $search: 'hdi' }, expectedIds: ['A3'] },
  fieldFilter: { filter: { insuranceCompanyId: { eq: 40 } }, expectedIds: ['A4'] },
  sort: {
    sorting: [{ id: 'insuranceCompanyName', desc: false }],
    expectedIds: ['A5', 'A4', 'A3', 'A2', 'A1'],
  },
});
