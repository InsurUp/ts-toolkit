/**
 * @fileoverview Agent Template Table Integration Tests (in-memory).
 *
 * Templates are keyed by `key` (not `id`), exercising the suite's id accessor.
 */

import type { QueryTemplatesResult } from '@insurup/sdk';
import {
  createAgentTemplateTable,
  createInfiniteAgentTemplateTable,
} from '../../src/entities/agent-template/factory.js';
import { describeInMemoryTable } from '../utils/in-memory-suite.js';

const rows = [
  { key: 'welcome', languageId: 1, name: 'Welcome Email', content: 'x' },
  { key: 'reminder', languageId: 1, name: 'Reminder Email', content: 'x' },
  { key: 'invoice', languageId: 1, name: 'Invoice Email', content: 'x' },
  { key: 'renewal', languageId: 1, name: 'Renewal Notice', content: 'x' },
  { key: 'farewell', languageId: 1, name: 'Farewell Email', content: 'x' },
] as QueryTemplatesResult[];

describeInMemoryTable({
  name: 'createAgentTemplateTable',
  rows,
  orderedIds: ['welcome', 'reminder', 'invoice', 'renewal', 'farewell'],
  idOf: (r: { key: string }) => r.key,
  build: (fetchAll, pageSize) =>
    createAgentTemplateTable({
      columns: (col) => [col.key(), col.name({ header: 'Name', sortable: true }), col.languageId()],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  buildInfinite: (fetchAll, pageSize) =>
    createInfiniteAgentTemplateTable({
      columns: (col) => [col.key(), col.name({ header: 'Name', sortable: true }), col.languageId()],
      fetchAll,
      pagination: { type: 'cursor', pageSize },
      autoFetch: true,
    }),
  search: {
    filter: { $search: 'email' },
    expectedIds: ['welcome', 'reminder', 'invoice', 'farewell'],
  },
  fieldFilter: { filter: { name: { eq: 'Invoice Email' } }, expectedIds: ['invoice'] },
  sort: {
    sorting: [{ id: 'name', desc: false }],
    expectedIds: ['farewell', 'invoice', 'reminder', 'renewal', 'welcome'],
  },
});
