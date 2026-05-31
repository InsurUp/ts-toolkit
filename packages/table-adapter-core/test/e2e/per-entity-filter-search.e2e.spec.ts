/**
 * @fileoverview Parameterized E2E filter + search routing across every entity.
 *
 * Each entity is exercised through three uniform probes:
 *   1. `$search`-marked entry routes through the server search slot
 *   2. A renamed/typed filter op (`notContains` for strings, `gte` for numerics,
 *      `eq` for booleans) succeeds when set via `defaultFilter`
 *   3. A mixed filter + search payload in one call splits across both slots
 *
 * Customer (rich operator surface, `it.each` per-op coverage) and
 * customer-infinite (infinite-scroll-specific behaviors) keep their own files;
 * everything else lives here.
 */

import { expect, it } from 'vitest';
import { CaseType } from '@insurup/sdk';
import { createE2EClient } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

import { createAgentUserTable } from '../../src/entities/agent-user/factory.js';
import { createCaseTable } from '../../src/entities/case/factory.js';
import { createFilePolicyTransferTable } from '../../src/entities/file-policy-transfer/factory.js';
import { createPolicyTable } from '../../src/entities/policy/factory.js';
import { createPolicyTransferTable } from '../../src/entities/policy-transfer/factory.js';
import { createProposalTable } from '../../src/entities/proposal/factory.js';
import { createWebhookDeliveryTable } from '../../src/entities/webhook-delivery/factory.js';

const client = createE2EClient();

/**
 * Run the three uniform filter+search probes against an entity. Each probe is
 * its own `it`, so vitest reports per-probe pass/fail.
 *
 * `<const TFilter>` preserves the literal `$search: true` discriminator
 * through the generic so callers don't need `as const` boilerplate. Don't
 * strip the `const` — without it, TS widens `$search: true` to `boolean` and
 * the discriminated union narrowing fails at each call site.
 *
 * `verifyDefaultProbeRows` is optional: when supplied, each row returned by
 * the default-filter probe is checked against it. Use it for filters that
 * have a deterministic row-level effect (enum eq, boolean eq) to prove the
 * server actually applied the filter — not just that the call returned 200.
 */
function runEntityProbes<const TFilter, TRow>(
  name: string,
  build: (extra?: { defaultFilter?: TFilter }) => {
    fetch(): Promise<unknown>;
    setFilter(filter: TFilter): void;
    getState(): {
      error: unknown;
      isSuccess: boolean;
      isFetching: boolean;
      isLoading: boolean;
      rows: readonly TRow[];
    };
    destroy(): void;
  },
  filters: { search: TFilter; defaultProbe: TFilter; mixed: TFilter },
  verifyDefaultProbeRows?: (rows: readonly TRow[]) => void
): void {
  const expectSuccess = (table: ReturnType<typeof build>) => {
    expect(table.getState().error).toBeNull();
    expect(table.getState().isSuccess).toBe(true);
  };

  describeE2E(`${name} filter + search [e2e]`, () => {
    it('routes a $search-marked entry through the server search slot', async () => {
      const table = build();
      try {
        table.setFilter(filters.search);
        await waitForIdle(table);
        expectSuccess(table);
      } finally {
        table.destroy();
      }
    });

    it('accepts the entity-specific filter probe as a default filter', async () => {
      const table = build({ defaultFilter: filters.defaultProbe });
      try {
        await table.fetch();
        await waitForIdle(table);
        expectSuccess(table);
        verifyDefaultProbeRows?.(table.getState().rows);
      } finally {
        table.destroy();
      }
    });

    it('splits a mixed filter + search payload across both server slots in one call', async () => {
      const table = build();
      try {
        table.setFilter(filters.mixed);
        await waitForIdle(table);
        expectSuccess(table);
      } finally {
        table.destroy();
      }
    });
  });
}

runEntityProbes(
  'createCaseTable',
  (extra) =>
    createCaseTable({
      columns: (col) => [col.id(), col.type('Type'), col.ref('Ref')],
      fetch: (vars, opts) => client.cases.getCases(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      ...extra,
    }),
  {
    search: { ref: { $search: true, textSearch: 'a' } },
    defaultProbe: { type: { eq: CaseType.SaleOpportunity } },
    mixed: {
      ref: { $search: true, textSearch: 'a' },
      type: { eq: CaseType.SaleOpportunity },
    },
  },
  (rows) => {
    for (const row of rows) {
      expect(row.type).toBe(CaseType.SaleOpportunity);
    }
  }
);

runEntityProbes(
  'createAgentUserTable',
  (extra) =>
    createAgentUserTable({
      columns: (col) => [col.id(), col.firstName('First'), col.email('Email')],
      fetch: (vars, opts) => client.agentUsers.getAgentUsers(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      ...extra,
    }),
  {
    search: { email: { $search: true, textSearch: 'a' } },
    defaultProbe: { email: { notContains: 'zzzunlikely' } },
    mixed: {
      email: { $search: true, textSearch: 'a' },
      firstName: { notContains: 'zzz' },
    },
  }
);

runEntityProbes(
  'createPolicyTable',
  (extra) =>
    createPolicyTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.policies.getPolicies(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      ...extra,
    }),
  {
    search: { insuredCustomerName: { $search: true, textSearch: 'a' } },
    defaultProbe: { insuredCustomerName: { notContains: 'zzzunlikely' } },
    mixed: {
      insuredCustomerName: { $search: true, textSearch: 'a' },
      insuranceCompanyPolicyNumber: { notContains: 'zzz' },
    },
  }
);

runEntityProbes(
  'createProposalTable',
  (extra) =>
    createProposalTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      ...extra,
    }),
  {
    search: { insuredCustomerName: { $search: true, textSearch: 'a' } },
    defaultProbe: { insuredCustomerName: { notContains: 'zzzunlikely' } },
    mixed: {
      insuredCustomerName: { $search: true, textSearch: 'a' },
      insuredCustomerIdentityNumber: { notContains: 'zzz' },
    },
  }
);

// PolicyTransfer has no free-text searchable field: its `id` is not search-indexed
// on the deployed schema (see #61/#62). Its searchable fields are numeric/date
// (e.g. succeededPolicyCount), so the $search probe routes a numeric search clause.
runEntityProbes(
  'createPolicyTransferTable',
  (extra) =>
    createPolicyTransferTable({
      columns: (col) => [col.id()],
      fetch: (vars, opts) => client.policies.getPolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      ...extra,
    }),
  {
    search: { succeededPolicyCount: { $search: true, gte: 0 } },
    defaultProbe: { succeededPolicyCount: { gte: 0 } },
    mixed: {
      succeededPolicyCount: { $search: true, gte: 0 },
      failedPolicyCount: { gte: 0 },
    },
  }
);

runEntityProbes(
  'createFilePolicyTransferTable',
  (extra) =>
    createFilePolicyTransferTable({
      columns: (col) => [col.id(), col.fileName('File'), col.totalPolicyCount('Total')],
      fetch: (vars, opts) => client.policies.getFilePolicyTransfers(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
      ...extra,
    }),
  {
    search: { fileName: { $search: true, textSearch: 'a' } },
    defaultProbe: { fileName: { notContains: 'zzzunlikely' } },
    mixed: {
      fileName: { $search: true, textSearch: 'a' },
      succeededPolicyCount: { gte: 0 },
    },
  }
);

runEntityProbes(
  'createWebhookDeliveryTable',
  (extra) =>
    createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event('Event')],
      fetch: (vars, opts) => client.webhooks.getWebhookDeliveries(vars, opts),
      pagination: { type: 'cursor', pageSize: 5 },
      ...extra,
    }),
  {
    search: { errorMessage: { $search: true, textSearch: 'timeout' } },
    // `isSuccess` is filterable but not projected into the output model, so
    // no row-side verify hook is possible — the call-succeeds assertion is
    // the only signal here. (Case carries the verify-hook demonstration.)
    defaultProbe: { isSuccess: { eq: false } },
    mixed: {
      errorMessage: { $search: true, textSearch: 'timeout' },
      isSuccess: { eq: false },
    },
  }
);

// One entity-specific extra: proposal exercises the `score.boost` shape that
// isn't covered by any other entity's filter probe.
describeE2E('createProposalTable filter + search [e2e] — score.boost', () => {
  it('accepts a search clause with score.boost', async () => {
    const table = createProposalTable({
      columns: (col) => [col.id(), col.insuredCustomerName('Name')],
      fetch: (vars, opts) => client.proposals.getProposals(vars, opts),
      pagination: { type: 'cursor', pageSize: 3 },
    });
    try {
      table.setFilter({
        insuredCustomerName: {
          $search: true,
          textSearch: { value: 'a', score: { boost: 2 } },
        },
      });
      await waitForIdle(table);
      expect(table.getState().error).toBeNull();
      expect(table.getState().isSuccess).toBe(true);
    } finally {
      table.destroy();
    }
  });
});
