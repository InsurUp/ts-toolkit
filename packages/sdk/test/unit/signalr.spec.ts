/**
 * @fileoverview SignalR Transport Tests
 * @description Unit tests for SignalRTransport: subscription lifecycle,
 *   multiplexing, hub event dispatch, reconnect re-registration, and
 *   teardown. The `@microsoft/signalr` module is fully mocked so these
 *   tests run without a network.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type DispatchHandler = (...args: unknown[]) => void;

interface FakeHubConnectionInstance {
  state: 'Disconnected' | 'Connecting' | 'Connected' | 'Disconnecting' | 'Reconnecting';
  start_call_count: number;
  stop_call_count: number;
  sent: Array<{ method: string; args: unknown[] }>;
  on(method: string, handler: DispatchHandler): void;
  onreconnected(handler: (connectionId?: string) => void): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  send(method: string, ...args: unknown[]): Promise<void>;
  emit(method: string, payload: unknown): void;
  triggerReconnect(): Promise<void>;
}

interface BuilderConfig {
  url?: string;
  options?: { accessTokenFactory?: () => string | Promise<string> };
  withAutomaticReconnect_called: boolean;
  logLevel?: unknown;
}

interface MockState {
  builtConnections: FakeHubConnectionInstance[];
  builderConfigs: BuilderConfig[];
  startImpl: (conn: FakeHubConnectionInstance) => Promise<void>;
  defaultStartImpl: (conn: FakeHubConnectionInstance) => Promise<void>;
}

const mockState = vi.hoisted<MockState>(() => {
  const defaultStartImpl = async (conn: FakeHubConnectionInstance) => {
    conn.state = 'Connected';
  };
  return {
    builtConnections: [],
    builderConfigs: [],
    startImpl: defaultStartImpl,
    defaultStartImpl,
  };
});

vi.mock('@microsoft/signalr', () => {
  class FakeHubConnection implements FakeHubConnectionInstance {
    public state: FakeHubConnectionInstance['state'] = 'Disconnected';
    public readonly on_handlers = new Map<string, DispatchHandler[]>();
    public readonly sent: Array<{ method: string; args: unknown[] }> = [];
    public readonly reconnected_callbacks: Array<(connectionId?: string) => void> = [];

    public start_call_count = 0;
    public stop_call_count = 0;

    on(method: string, handler: DispatchHandler): void {
      const list = this.on_handlers.get(method) ?? [];
      list.push(handler);
      this.on_handlers.set(method, list);
    }

    onreconnected(handler: (connectionId?: string) => void): void {
      this.reconnected_callbacks.push(handler);
    }

    async start(): Promise<void> {
      this.start_call_count += 1;
      await mockState.startImpl(this);
    }

    async stop(): Promise<void> {
      this.stop_call_count += 1;
      this.state = 'Disconnected';
    }

    async send(method: string, ...args: unknown[]): Promise<void> {
      this.sent.push({ method, args });
    }

    emit(method: string, payload: unknown): void {
      const list = this.on_handlers.get(method);
      if (!list) {
        return;
      }
      for (const fn of list) {
        fn(payload);
      }
    }

    async triggerReconnect(): Promise<void> {
      for (const cb of this.reconnected_callbacks) {
        cb('new-connection-id');
      }
      await Promise.resolve();
    }
  }

  class FakeHubConnectionBuilder {
    private cfg: BuilderConfig = { withAutomaticReconnect_called: false };

    withUrl(url: string, options?: { accessTokenFactory?: () => string | Promise<string> }): this {
      this.cfg.url = url;
      this.cfg.options = options;
      return this;
    }

    withAutomaticReconnect(): this {
      this.cfg.withAutomaticReconnect_called = true;
      return this;
    }

    configureLogging(level: unknown): this {
      this.cfg.logLevel = level;
      return this;
    }

    build(): FakeHubConnection {
      mockState.builderConfigs.push(this.cfg);
      const conn = new FakeHubConnection();
      mockState.builtConnections.push(conn);
      return conn;
    }
  }

  return {
    HubConnectionBuilder: FakeHubConnectionBuilder,
    HttpTransportType: { None: 0, WebSockets: 1, ServerSentEvents: 2, LongPolling: 4 },
    LogLevel: {
      Trace: 0,
      Debug: 1,
      Information: 2,
      Warning: 3,
      Error: 4,
      Critical: 5,
      None: 6,
    },
    HubConnectionState: {
      Disconnected: 'Disconnected',
      Connecting: 'Connecting',
      Connected: 'Connected',
      Disconnecting: 'Disconnecting',
      Reconnecting: 'Reconnecting',
    },
  };
});

const { builtConnections, builderConfigs } = mockState;

// Import AFTER vi.mock so the SUT picks up the fake.
import { LogLevel } from '@microsoft/signalr';
import { SignalRTransport } from '../../src/client/signalr';
import { DefaultInsurUpClient } from '../../src/client/client';
import type {
  ProposalProductCoverageEvent,
  ProposalProductFailedEvent,
  ProposalProductInProgressEvent,
  ProposalProductPurchaseFailedEvent,
  ProposalProductPurchasedEvent,
  ProposalProductPurchasingEvent,
  ProposalProductRevisedEvent,
  ProposalProductSuccessEvent,
} from '@insurup/contracts';
import { Currency, InsuranceProductType, PaymentOption, ProductBranch } from '@insurup/contracts';

const HUB_URL = 'https://api.test.insurup/hubs/proposal-detail';

beforeEach(() => {
  builtConnections.length = 0;
  builderConfigs.length = 0;
  mockState.startImpl = mockState.defaultStartImpl;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------- Fixtures ----------

function baseEvent(proposalId: string, proposalProductId = 'PP-1') {
  return {
    proposalId,
    proposalProductId,
    productId: 1,
    productName: 'Trafik',
    productType: InsuranceProductType.WebService,
    insuranceCompanyId: 7,
    insuranceCompanyName: 'TestCo',
    supportedPaymentOptions: [PaymentOption.SyncCreditCard],
  } as const;
}

const successEvent = (id: string): ProposalProductSuccessEvent => ({
  ...baseEvent(id),
  needsInvestigationByCompany: false,
  hasVocationalDiscount: false,
  hasUndamagedDiscount: false,
  premiums: [
    {
      installmentNumber: 1,
      insurancePremiumReference: '00000000-0000-0000-0000-000000000001',
      netPremium: 100,
      grossPremium: 120,
      commission: 10,
      exchangeRate: 1,
      currency: Currency.TurkishLira,
    },
  ],
});

const failedEvent = (id: string, msg = 'boom'): ProposalProductFailedEvent => ({
  ...baseEvent(id),
  errorMessage: msg,
});

const inProgressEvent = (id: string): ProposalProductInProgressEvent => baseEvent(id);
const revisedEvent = (id: string): ProposalProductRevisedEvent => baseEvent(id);
const purchasingEvent = (id: string): ProposalProductPurchasingEvent => baseEvent(id);
const purchasedEvent = (id: string): ProposalProductPurchasedEvent => ({
  ...baseEvent(id),
  policyId: 'POL-1',
});
const purchaseFailedEvent = (id: string): ProposalProductPurchaseFailedEvent => ({
  ...baseEvent(id),
  errorMessage: 'card declined',
});
const coverageEvent = (id: string): ProposalProductCoverageEvent => ({
  proposalId: id,
  proposalProductId: 'PP-1',
  pdfCoverage: { productBranch: ProductBranch.Trafik },
});

// ---------- Tests ----------

describe('SignalRTransport', () => {
  describe('construction & hub URL', () => {
    it('does not open a connection until first subscribe', () => {
      new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      expect(builtConnections).toHaveLength(0);
    });

    it('builds the hub URL from hubsBaseUrl (no trailing slash)', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      expect(builderConfigs[0]?.url).toBe(HUB_URL);
    });

    it('builds the hub URL from hubsBaseUrl (with trailing slash)', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup/' });
      await transport.subscribeProposalDetail('PR-1', {});
      expect(builderConfigs[0]?.url).toBe(HUB_URL);
    });

    it('configures auto-reconnect and the requested log level', async () => {
      const transport = new SignalRTransport({
        hubsBaseUrl: 'https://api.test.insurup',
        logLevel: LogLevel.Information,
      });
      await transport.subscribeProposalDetail('PR-1', {});
      expect(builderConfigs[0]?.withAutomaticReconnect_called).toBe(true);
      expect(builderConfigs[0]?.logLevel).toBe(LogLevel.Information);
    });

    it('defaults log level to Warning when not provided', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      expect(builderConfigs[0]?.logLevel).toBe(LogLevel.Warning);
    });

    it('rejects empty proposalId', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await expect(transport.subscribeProposalDetail('', {})).rejects.toThrow(/proposalId/);
      expect(builtConnections).toHaveLength(0);
    });
  });

  describe('access token wiring', () => {
    it('omits accessTokenFactory when no tokenProvider is supplied', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      expect(builderConfigs[0]?.options?.accessTokenFactory).toBeUndefined();
    });

    it('resolves async tokenProvider values', async () => {
      const transport = new SignalRTransport({
        hubsBaseUrl: 'https://api.test.insurup',
        tokenProvider: async () => 'tok-123',
      });
      await transport.subscribeProposalDetail('PR-1', {});
      const factory = builderConfigs[0]?.options?.accessTokenFactory;
      expect(factory).toBeDefined();
      await expect(factory?.()).resolves.toBe('tok-123');
    });

    it('coerces a null token to empty string', async () => {
      const transport = new SignalRTransport({
        hubsBaseUrl: 'https://api.test.insurup',
        tokenProvider: () => null,
      });
      await transport.subscribeProposalDetail('PR-1', {});
      const factory = builderConfigs[0]?.options?.accessTokenFactory;
      await expect(factory?.()).resolves.toBe('');
    });
  });

  describe('subscription lifecycle', () => {
    it('opens the connection on first subscribe and Registers the proposal id', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});

      expect(builtConnections).toHaveLength(1);
      const conn = builtConnections[0]!;
      expect(conn.start_call_count).toBe(1);
      expect(conn.sent).toEqual([{ method: 'Register', args: [{ proposalId: 'PR-1' }] }]);
    });

    it('reuses the connection for a second subscriber on the SAME proposalId without re-registering', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-1', {});

      expect(builtConnections).toHaveLength(1);
      const conn = builtConnections[0]!;
      expect(conn.start_call_count).toBe(1);
      expect(conn.sent).toHaveLength(1);
    });

    it('reuses the connection for a different proposalId and Registers the new id', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-2', {});

      const conn = builtConnections[0]!;
      expect(conn.sent.map((s) => s.args[0])).toEqual([
        { proposalId: 'PR-1' },
        { proposalId: 'PR-2' },
      ]);
    });

    it('shares one start() across concurrent first subscribers', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });

      // Block the first start until both subscribers are in flight.
      let resolveStart: (() => void) | undefined;
      const startGate = new Promise<void>((resolve) => {
        resolveStart = resolve;
      });
      mockState.startImpl = async (conn) => {
        await startGate;
        conn.state = 'Connected';
      };

      const p1 = transport.subscribeProposalDetail('PR-1', {});
      const p2 = transport.subscribeProposalDetail('PR-2', {});
      // give both subscribes a tick to attach to startPromise
      await Promise.resolve();
      resolveStart?.();
      await Promise.all([p1, p2]);

      expect(builtConnections).toHaveLength(1);
      expect(builtConnections[0]!.start_call_count).toBe(1);
    });

    it('rolls back subscriber state when start() rejects', async () => {
      mockState.startImpl = async () => {
        throw new Error('cannot connect');
      };

      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await expect(transport.subscribeProposalDetail('PR-1', {})).rejects.toThrow('cannot connect');

      // restore for the follow-up subscribe
      mockState.startImpl = mockState.defaultStartImpl;

      // After failure, a subsequent subscribe should build a NEW connection that succeeds.
      const conn = await subscribeAndGetConnection(transport, 'PR-1');
      expect(conn.start_call_count).toBe(1);
    });
  });

  describe('unsubscribe behavior', () => {
    it('does not stop the connection while other subscribers exist (same proposal)', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsubA = await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-1', {});

      unsubA();
      await Promise.resolve();

      expect(builtConnections[0]!.stop_call_count).toBe(0);
    });

    it('does not stop the connection while subscribers for OTHER proposals exist', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsubA = await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-2', {});

      unsubA();
      await Promise.resolve();

      expect(builtConnections[0]!.stop_call_count).toBe(0);
    });

    it('stops the connection when the last subscriber unsubscribes', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsub = await transport.subscribeProposalDetail('PR-1', {});

      unsub();
      // stop() is fire-and-forget inside the unsubscribe
      await flushMicrotasks();

      expect(builtConnections[0]!.stop_call_count).toBe(1);
    });

    it('is idempotent — calling unsubscribe twice does not double-stop', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsub = await transport.subscribeProposalDetail('PR-1', {});

      unsub();
      unsub();
      await flushMicrotasks();

      expect(builtConnections[0]!.stop_call_count).toBe(1);
    });

    it('builds a fresh connection on subscribe after the previous one was stopped', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsub = await transport.subscribeProposalDetail('PR-1', {});
      unsub();
      await flushMicrotasks();

      await transport.subscribeProposalDetail('PR-2', {});

      expect(builtConnections).toHaveLength(2);
      expect(builtConnections[1]!.start_call_count).toBe(1);
      expect(builtConnections[1]!.sent).toEqual([
        { method: 'Register', args: [{ proposalId: 'PR-2' }] },
      ]);
    });
  });

  describe('event dispatch', () => {
    it('routes events to handlers subscribed to the matching proposalId only', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const onA = vi.fn();
      const onB = vi.fn();
      await transport.subscribeProposalDetail('PR-A', { onProductSuccess: onA });
      await transport.subscribeProposalDetail('PR-B', { onProductSuccess: onB });

      builtConnections[0]!.emit('ReceiveProposalProductSuccess', successEvent('PR-A'));

      expect(onA).toHaveBeenCalledTimes(1);
      expect(onB).not.toHaveBeenCalled();
    });

    it('fans out a single event to every handler set subscribed to that proposalId', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const a = vi.fn();
      const b = vi.fn();
      await transport.subscribeProposalDetail('PR-1', { onProductSuccess: a });
      await transport.subscribeProposalDetail('PR-1', { onProductSuccess: b });

      builtConnections[0]!.emit('ReceiveProposalProductSuccess', successEvent('PR-1'));

      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('silently ignores events when the matching handler callback is not set', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {
        onProductSuccess: vi.fn(), // failed handler intentionally missing
      });

      expect(() =>
        builtConnections[0]!.emit('ReceiveProposalProductFailed', failedEvent('PR-1'))
      ).not.toThrow();
    });

    it('drops events for proposalIds with no subscribers', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const onSuccess = vi.fn();
      await transport.subscribeProposalDetail('PR-1', { onProductSuccess: onSuccess });

      builtConnections[0]!.emit('ReceiveProposalProductSuccess', successEvent('PR-ORPHAN'));

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('stops dispatching to a handler after it unsubscribes', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const fn = vi.fn();
      const unsub = await transport.subscribeProposalDetail('PR-1', { onProductSuccess: fn });
      // keep another subscriber so the connection stays open
      await transport.subscribeProposalDetail('PR-1', {});

      unsub();
      builtConnections[0]!.emit('ReceiveProposalProductSuccess', successEvent('PR-1'));

      expect(fn).not.toHaveBeenCalled();
    });

    it('dispatches every server→client method to the correct callback', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const handlers = {
        onProductSuccess: vi.fn(),
        onProductFailed: vi.fn(),
        onProductInProgress: vi.fn(),
        onProductRevised: vi.fn(),
        onProductPurchasing: vi.fn(),
        onProductPurchased: vi.fn(),
        onProductPurchaseFailed: vi.fn(),
        onProductCoverage: vi.fn(),
      };
      await transport.subscribeProposalDetail('PR-1', handlers);
      const conn = builtConnections[0]!;

      conn.emit('ReceiveProposalProductSuccess', successEvent('PR-1'));
      conn.emit('ReceiveProposalProductFailed', failedEvent('PR-1'));
      conn.emit('ReceiveProposalProductInProgress', inProgressEvent('PR-1'));
      conn.emit('ReceiveProposalProductRevised', revisedEvent('PR-1'));
      conn.emit('ReceiveProposalProductPurchasing', purchasingEvent('PR-1'));
      conn.emit('ReceiveProposalProductPurchased', purchasedEvent('PR-1'));
      conn.emit('ReceiveProposalProductPurchaseFailed', purchaseFailedEvent('PR-1'));
      conn.emit('ReceiveProposalProductCoverage', coverageEvent('PR-1'));

      expect(handlers.onProductSuccess).toHaveBeenCalledTimes(1);
      expect(handlers.onProductFailed).toHaveBeenCalledTimes(1);
      expect(handlers.onProductInProgress).toHaveBeenCalledTimes(1);
      expect(handlers.onProductRevised).toHaveBeenCalledTimes(1);
      expect(handlers.onProductPurchasing).toHaveBeenCalledTimes(1);
      expect(handlers.onProductPurchased).toHaveBeenCalledTimes(1);
      expect(handlers.onProductPurchaseFailed).toHaveBeenCalledTimes(1);
      expect(handlers.onProductCoverage).toHaveBeenCalledTimes(1);
    });
  });

  describe('reconnect', () => {
    it('re-Registers every active proposalId when the connection reconnects', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-2', {});
      const conn = builtConnections[0]!;
      conn.sent.length = 0; // clear initial Registers

      await conn.triggerReconnect();
      await flushMicrotasks();

      expect(conn.sent.map((s) => s.args[0])).toEqual(
        expect.arrayContaining([{ proposalId: 'PR-1' }, { proposalId: 'PR-2' }])
      );
      expect(conn.sent).toHaveLength(2);
    });

    it('does not Register anything if all subscribers were removed before reconnect fired', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      const unsub = await transport.subscribeProposalDetail('PR-1', {});
      // simulate: connection got into a reconnect cycle and the only subscriber went away in the meantime.
      // We need another subscription to keep the connection alive (otherwise stop() races us).
      await transport.subscribeProposalDetail('PR-2', {});
      const conn = builtConnections[0]!;
      conn.sent.length = 0;
      unsub();

      await conn.triggerReconnect();
      await flushMicrotasks();

      expect(conn.sent).toEqual([{ method: 'Register', args: [{ proposalId: 'PR-2' }] }]);
    });
  });

  describe('close()', () => {
    it('stops the connection and clears subscribers', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      await transport.subscribeProposalDetail('PR-2', {});

      await transport.close();

      expect(builtConnections[0]!.stop_call_count).toBe(1);

      // Re-subscribing builds a fresh connection.
      await transport.subscribeProposalDetail('PR-3', {});
      expect(builtConnections).toHaveLength(2);
    });

    it('is a no-op when called before any subscribe', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await expect(transport.close()).resolves.toBeUndefined();
      expect(builtConnections).toHaveLength(0);
    });

    it('does not call stop twice if invoked repeatedly', async () => {
      const transport = new SignalRTransport({ hubsBaseUrl: 'https://api.test.insurup' });
      await transport.subscribeProposalDetail('PR-1', {});
      await transport.close();
      await transport.close();

      expect(builtConnections[0]!.stop_call_count).toBe(1);
    });
  });
});

describe('InsurUpProposalClient.subscribeToDetail', () => {
  it('delegates to SignalRTransport and returns its unsubscribe function', async () => {
    const client = new DefaultInsurUpClient({
      baseUrl: 'https://api.test.insurup/api/',
      tokenProvider: () => 'tok',
    });

    const unsub = await client.proposals.subscribeToDetail('PR-9', {
      onProductSuccess: vi.fn(),
    });

    expect(builtConnections).toHaveLength(1);
    expect(builtConnections[0]!.sent).toEqual([
      { method: 'Register', args: [{ proposalId: 'PR-9' }] },
    ]);

    unsub();
    await flushMicrotasks();
    expect(builtConnections[0]!.stop_call_count).toBe(1);

    await client.close();
  });

  it('derives the hub URL from baseUrl origin when hubsBaseUrl is not provided', async () => {
    const client = new DefaultInsurUpClient({
      baseUrl: 'https://api.staging.insurup.com/api/',
    });

    await client.proposals.subscribeToDetail('PR-1', {});

    expect(builderConfigs[0]?.url).toBe('https://api.staging.insurup.com/hubs/proposal-detail');

    await client.close();
  });

  it('honors an explicit hubsBaseUrl override', async () => {
    const client = new DefaultInsurUpClient({
      baseUrl: 'https://api.insurup.com/api/',
      hubsBaseUrl: 'https://hubs.example.com',
    });

    await client.proposals.subscribeToDetail('PR-1', {});

    expect(builderConfigs[0]?.url).toBe('https://hubs.example.com/hubs/proposal-detail');

    await client.close();
  });

  it('wires the tokenProvider through to the SignalR accessTokenFactory', async () => {
    const tokenProvider = vi.fn().mockReturnValue('bearer-abc');
    const client = new DefaultInsurUpClient({
      baseUrl: 'https://api.test.insurup/api/',
      tokenProvider,
    });

    await client.proposals.subscribeToDetail('PR-1', {});

    const factory = builderConfigs[0]?.options?.accessTokenFactory;
    await expect(factory?.()).resolves.toBe('bearer-abc');
    expect(tokenProvider).toHaveBeenCalled();

    await client.close();
  });

  it('DefaultInsurUpClient.close() stops the hub connection if open', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: 'https://api.test.insurup/api/' });
    await client.proposals.subscribeToDetail('PR-1', {});

    await client.close();

    expect(builtConnections[0]!.stop_call_count).toBe(1);
  });
});

// ---------- helpers ----------

async function subscribeAndGetConnection(
  transport: SignalRTransport,
  proposalId: string
): Promise<FakeHubConnectionInstance> {
  const before = builtConnections.length;
  await transport.subscribeProposalDetail(proposalId, {});
  return builtConnections[before]!;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
