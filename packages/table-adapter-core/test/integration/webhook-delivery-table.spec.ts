/**
 * @fileoverview Webhook Delivery Table Integration Tests (smoke)
 * @description Verifies wiring of the createWebhookDeliveryTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWebhookDeliveryTable } from '../../src/entities/webhook-delivery/factory.js';
import { WebhookEvent, WebhookDeliveryState } from '@insurup/sdk';
import type {
  Connection,
  InsurUpGraphQLResult,
  WebhookDeliveryFieldKey,
  GetWebhookDeliveriesOptions,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import type {
  WebhookDeliveryFetchFn,
  WebhookDeliveryRowType,
  WebhookDeliveryColumnDef,
} from '../../src/entities/webhook-delivery/types.js';

type FullRow = WebhookDeliveryRowType<WebhookDeliveryColumnDef[]>;
type ExpectedFetchFn = WebhookDeliveryFetchFn<FullRow, WebhookDeliveryFieldKey[]>;

function createMockDelivery(overrides: Partial<FullRow> = {}): FullRow {
  return {
    id: 'WD-001',
    webhookId: 'WH-001',
    webhookName: 'Customer Created Hook',
    event: WebhookEvent.ProposalPremiumReceived,
    state: WebhookDeliveryState.Success,
    responseStatusCode: 200,
    createdAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-01T00:00:01Z',
    retryCount: 0,
    ...overrides,
  } as FullRow;
}

function createConnection(rows: FullRow[], hasNextPage = false): Connection<FullRow> {
  return {
    nodes: rows,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: rows.length,
    edges: rows.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createFetchMock(response: InsurUpGraphQLResult<Connection<FullRow>>): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetWebhookDeliveriesOptions<WebhookDeliveryFieldKey[]>,
        requestOptions?: { signal?: AbortSignal }
      ) => Promise<InsurUpGraphQLResult<Connection<FullRow>>>
    >()
    .mockResolvedValue(response);
}

describe('createWebhookDeliveryTable (smoke)', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createFetchMock(
      createSuccessResult(
        createConnection([
          createMockDelivery({ id: 'WD-001' }),
          createMockDelivery({ id: 'WD-002', state: WebhookDeliveryState.Failed }),
        ])
      )
    );
  });

  it('creates a table with the column builder', () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event(), col.state()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    expect(table).toBeDefined();
    expect(table.columns).toHaveLength(3);

    table.destroy();
  });

  it('extracts selected fields from column definitions', async () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event(), col.state(), col.responseStatusCode()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.arrayContaining(['id', 'event', 'state', 'responseStatusCode']),
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('fetches and populates rows', async () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id(), col.event()],
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

  it('applies a default filter', async () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { isSuccess: { eq: false } },
    });

    await table.fetch();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { isSuccess: { eq: false } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('setFilter triggers a refetch with the new filter', async () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.setFilter({ isSuccess: { eq: true } });
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { isSuccess: { eq: true } },
      }),
      expect.any(Object)
    );

    table.destroy();
  });

  it('clearFilter removes the active filter', async () => {
    const table = createWebhookDeliveryTable({
      columns: (col) => [col.id()],
      fetch: mockFetch,
      pagination: { type: 'cursor' },
      defaultFilter: { isSuccess: { eq: false } },
    });

    await table.fetch();
    (mockFetch as ReturnType<typeof vi.fn>).mockClear();

    table.clearFilter();
    await flushPromises();

    expect(mockFetch).toHaveBeenCalled();
    const args = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      filter?: unknown;
    };
    expect(args.filter).toBeUndefined();

    table.destroy();
  });
});
