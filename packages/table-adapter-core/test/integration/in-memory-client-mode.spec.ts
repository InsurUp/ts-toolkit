/**
 * @fileoverview In-memory tables — client-mode integration tests.
 *
 * Exercises the `client` data source (vs `fetchAll`): `DefaultInsurUpClient` is
 * stubbed so each entity's `loadAll` closure and the factory's client branch run
 * without touching the network.
 */

import { describe, it, expect, vi } from 'vitest';
import { flushPromises } from '../utils/helpers.js';
import { createRoleTable } from '../../src/entities/role/factory.js';
import { createAgentBranchTable } from '../../src/entities/agent-branch/factory.js';
import { createCoverageGroupTable } from '../../src/entities/coverage-group/factory.js';
import { createAgentInsuranceCompanyTable } from '../../src/entities/agent-insurance-company/factory.js';
import { createOAuthClientTable } from '../../src/entities/oauth-client/factory.js';
import { createAgentTemplateTable } from '../../src/entities/agent-template/factory.js';
import type { RoleColumnDef, RoleTableOptions } from '../../src/entities/role/types.js';

vi.mock('@insurup/sdk', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const ok = (data: unknown): unknown => ({
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  });
  const fake = {
    agentRoles: { getAgentRoles: () => Promise.resolve(ok([{ id: 'R1', name: 'Admin' }])) },
    agentBranches: { getAgentBranches: () => Promise.resolve(ok([{ id: 'B1', name: 'HQ' }])) },
    coverage: { getAllCoverageGroups: () => Promise.resolve(ok([{ id: 'C1', name: 'Kasko' }])) },
    agents: {
      getAgentInsuranceCompaniesAsync: () =>
        Promise.resolve(ok([{ id: 'A1', insuranceCompanyName: 'Allianz' }])),
    },
    oauthClients: { getOAuthClients: () => Promise.resolve(ok([{ id: 'O1', clientId: 'web' }])) },
    templates: {
      getAllTemplates: () => Promise.resolve(ok([{ key: 'welcome', name: 'Welcome' }])),
    },
  };
  return {
    ...actual,
    DefaultInsurUpClient: class {
      constructor() {
        return fake;
      }
    },
  };
});

const client = { baseUrl: 'https://example.test/api/', tokenProvider: () => 'token' };
const pagination = { type: 'cursor', pageSize: 10 } as const;

describe('in-memory tables — client mode', () => {
  it('loads each entity through the SDK client (loadAll closures)', async () => {
    const tables = [
      createRoleTable({ columns: (c) => [c.id(), c.name()], client, pagination, autoFetch: true }),
      createAgentBranchTable({
        columns: (c) => [c.id(), c.name()],
        client,
        pagination,
        autoFetch: true,
      }),
      createCoverageGroupTable({
        columns: (c) => [c.id(), c.name()],
        client,
        pagination,
        autoFetch: true,
      }),
      createAgentInsuranceCompanyTable({
        columns: (c) => [c.id(), c.insuranceCompanyName()],
        client,
        pagination,
        autoFetch: true,
      }),
      createOAuthClientTable({
        columns: (c) => [c.id(), c.clientId()],
        client,
        pagination,
        autoFetch: true,
      }),
      createAgentTemplateTable({
        columns: (c) => [c.key(), c.name()],
        client,
        pagination,
        autoFetch: true,
      }),
    ];

    await flushPromises();

    for (const table of tables) {
      expect(table.getState().error).toBeNull();
      expect(table.getState().rows).toHaveLength(1);
      table.destroy();
    }
  });

  it('throws when neither client nor fetchAll is provided', () => {
    const options = {
      columns: () => [] as RoleColumnDef[],
      pagination,
    } as unknown as RoleTableOptions<RoleColumnDef[]>;
    expect(() => createRoleTable(options)).toThrow(/client.*fetchAll|fetchAll.*client/i);
  });

  it('refetch() without force keeps serving the cached list', async () => {
    const table = createRoleTable({
      columns: (c) => [c.id(), c.name()],
      client,
      pagination,
      autoFetch: true,
    });
    try {
      await flushPromises();
      await table.refetch();
      await flushPromises();
      expect(table.getState().error).toBeNull();
      expect(table.getState().rows).toHaveLength(1);
    } finally {
      table.destroy();
    }
  });
});
