/**
 * @fileoverview Policy Table Integration Tests
 * @description Smoke tests for the createPolicyTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPolicyTable } from '../../src/entities/policy/factory.js';
import type {
  Connection,
  InsurUpGraphQLResult,
  PolicyFieldKey,
  GetPoliciesOptions,
} from '@insurup/sdk';
import {
  ProductBranch,
  PaymentOption,
  Currency,
  PolicyState,
  Channel,
  CustomerType,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  PolicyFetchFn,
  PolicyRowType,
  PolicyColumnDef,
} from '../../src/entities/policy/types.js';

// ============================================================================
// Mock Policy Data Types
// ============================================================================

type FullPolicyRow = PolicyRowType<PolicyColumnDef[]>;
type ExpectedFetchFn = PolicyFetchFn<FullPolicyRow, PolicyFieldKey[]>;

// ============================================================================
// Mock Policy Data
// ============================================================================

function createMockPolicy(overrides: Partial<FullPolicyRow> = {}): FullPolicyRow {
  return {
    id: 'POL-001',
    insurerCustomerId: 'CUST-001',
    insuredCustomerId: 'CUST-002',
    productBranch: ProductBranch.Trafik,
    paymentType: PaymentOption.SyncCreditCard,
    currency: Currency.TurkishLira,
    insuranceCompanyProposalNumber: 'PROP-001',
    insuranceCompanyPolicyNumber: 'POLNUM-001',
    createdAt: '2024-01-01T00:00:00Z',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    insuredCustomerType: CustomerType.Individual,
    insuranceCompanyId: 1,
    insuranceCompanyName: 'Acme Insurance',
    state: PolicyState.Active,
    createdBy: {
      id: 'USER-001',
      name: 'Agent Smith',
      email: null,
      userType: null,
    },
    channel: Channel.Manual,
    agentBranch: null,
    agentBranchId: null,
    installmentNumber: null,
    netPremium: null,
    grossPremium: null,
    commission: null,
    arrangementDate: null,
    insuredCustomerName: null,
    insuredCustomerIdentityNumber: null,
    insuredCustomerTaxNumber: null,
    insuredCustomerCityText: null,
    insuredCustomerCityValue: null,
    insuredCustomerDistrictText: null,
    insuredCustomerDistrictValue: null,
    insuredCustomerBirthDate: null,
    insurerCustomerName: null,
    insurerCustomerIdentityNumber: null,
    insurerCustomerTaxNumber: null,
    insurerCustomerCityText: null,
    insurerCustomerCityValue: null,
    insurerCustomerDistrictText: null,
    insurerCustomerDistrictValue: null,
    insurerCustomerBirthDate: null,
    vehiclePlateCode: null,
    vehiclePlateCity: null,
    vehicleDocumentSerialCode: null,
    vehicleDocumentSerialNumber: null,
    vehicleModelBrandText: null,
    vehicleModelBrandValue: null,
    vehicleModelTypeText: null,
    vehicleModelTypeValue: null,
    vehicleModelYear: null,
    vehicleFuelType: null,
    productId: null,
    productName: null,
    insuranceCompanyLogo: null,
    representedBy: null,
    propertyNumber: null,
    daskOldPolicyNumber: null,
    daskPolicyNumber: null,
    vehicleId: null,
    propertyId: null,
    campaign: null,
    ...overrides,
  } as FullPolicyRow;
}

function createPolicyConnection(
  policies: FullPolicyRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullPolicyRow> {
  return {
    nodes: policies,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: totalCount ?? policies.length,
    edges: policies.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createPolicyFetchMock(
  response: InsurUpGraphQLResult<Connection<FullPolicyRow>>
): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetPoliciesOptions<PolicyFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullPolicyRow>>>
    >()
    .mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createPolicyTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createPolicyFetchMock(
      createSuccessResult(
        createPolicyConnection([
          createMockPolicy({ id: 'POL-001', insuranceCompanyPolicyNumber: 'POLNUM-001' }),
          createMockPolicy({ id: 'POL-002', insuranceCompanyPolicyNumber: 'POLNUM-002' }),
        ])
      )
    );
  });

  describe('table creation', () => {
    it('creates a policy table with column builder', () => {
      const table = createPolicyTable({
        columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber('Policy Number')],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      expect(table).toBeDefined();
      expect(table.columns).toHaveLength(2);

      table.destroy();
    });

    it('extracts fields from column definitions', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'insuranceCompanyPolicyNumber', 'state']),
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('data fetching', () => {
    it('fetches and populates rows', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();
      await flushPromises();

      const state = table.getState();
      expect(state.rows).toHaveLength(2);
      expect(state.isSuccess).toBe(true);

      table.destroy();
    });

    it('uses default page size of 20', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ first: 20 }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('filtering', () => {
    it('applies default filter', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        defaultFilter: { state: { eq: PolicyState.Active } },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { state: { eq: PolicyState.Active } },
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('setFilter triggers refetch with new filter', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

      table.setFilter({ state: { eq: PolicyState.Cancelled } });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { state: { eq: PolicyState.Cancelled } },
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('clearFilter triggers refetch without filter', async () => {
      const table = createPolicyTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        defaultFilter: { state: { eq: PolicyState.Active } },
      });

      await table.fetch();
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

      table.clearFilter();
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ filter: undefined }),
        expect.any(Object)
      );

      table.destroy();
    });
  });
});
