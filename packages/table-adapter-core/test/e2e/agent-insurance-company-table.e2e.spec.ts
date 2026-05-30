/**
 * @fileoverview E2E: createAgentInsuranceCompanyTable against the real InsurUp API (in-memory).
 */

import { createAgentInsuranceCompanyTable } from '../../src/entities/agent-insurance-company/factory.js';
import {
  describeInMemoryE2E,
  createE2EClient,
  e2eClientOptions,
} from '../utils/in-memory-e2e-suite.js';

describeInMemoryE2E({
  name: 'createAgentInsuranceCompanyTable',
  buildFetchAll: (pageSize) => {
    const client = createE2EClient();
    return createAgentInsuranceCompanyTable({
      columns: (col) => [col.id(), col.insuranceCompanyName({ header: 'Company', sortable: true })],
      fetchAll: (opts) => client.agents.getAgentInsuranceCompaniesAsync(opts),
      pagination: { type: 'cursor', pageSize },
    });
  },
  buildClient: (pageSize) =>
    createAgentInsuranceCompanyTable({
      columns: (col) => [col.id(), col.insuranceCompanyName({ header: 'Company', sortable: true })],
      client: e2eClientOptions(),
      pagination: { type: 'cursor', pageSize },
    }),
  idOf: (r: { id: string }) => r.id,
  sortColumnId: 'insuranceCompanyName',
  sortValueOf: (r: { insuranceCompanyName: string }) => r.insuranceCompanyName,
  searchableValuesOf: (r: { id: string; insuranceCompanyName: string }) => [
    r.id,
    r.insuranceCompanyName,
  ],
  searchTextOf: (r: { insuranceCompanyName: string }) => r.insuranceCompanyName,
  searchFilter: (term) => ({ $search: term }),
});
