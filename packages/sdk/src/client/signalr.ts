/**
 * @fileoverview SignalR Transport - Real-time hub connection manager
 * @description Wraps a single `@microsoft/signalr` HubConnection to the
 *   InsurUp ProposalDetailHub and multiplexes per-proposal subscriptions over
 *   it. The connection is opened lazily on the first subscribe and closed
 *   when the last subscription is torn down. Re-registers active proposal
 *   groups after automatic reconnect.
 */

import {
  HttpTransportType,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';

import type { TokenProvider } from '../core/options.js';
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

/**
 * Set of optional callbacks invoked when the server pushes events for the
 * subscribed proposal. Pass only the handlers you need; missing entries are
 * silently ignored.
 */
export interface ProposalDetailHandlers {
  readonly onProductSuccess?: (event: ProposalProductSuccessEvent) => void;
  readonly onProductFailed?: (event: ProposalProductFailedEvent) => void;
  readonly onProductInProgress?: (event: ProposalProductInProgressEvent) => void;
  readonly onProductRevised?: (event: ProposalProductRevisedEvent) => void;
  readonly onProductPurchasing?: (event: ProposalProductPurchasingEvent) => void;
  readonly onProductPurchased?: (event: ProposalProductPurchasedEvent) => void;
  readonly onProductPurchaseFailed?: (event: ProposalProductPurchaseFailedEvent) => void;
  readonly onProductCoverage?: (event: ProposalProductCoverageEvent) => void;
}

/** Options for constructing a {@link SignalRTransport}. */
export interface SignalRTransportOptions {
  /**
   * Origin (no path) of the InsurUp host that serves the SignalR hubs.
   * For staging this is e.g. `https://api.staging.insurup.com`.
   */
  readonly hubsBaseUrl: string;

  /** Token provider, shared with the rest of the SDK. */
  readonly tokenProvider?: TokenProvider;

  /** Log level for the SignalR client itself. Defaults to `LogLevel.Warning`. */
  readonly logLevel?: LogLevel;
}

/** Server→client method names exposed by `ProposalDetailHub`. */
const HUB_METHODS = {
  success: 'ReceiveProposalProductSuccess',
  failed: 'ReceiveProposalProductFailed',
  inProgress: 'ReceiveProposalProductInProgress',
  revised: 'ReceiveProposalProductRevised',
  purchasing: 'ReceiveProposalProductPurchasing',
  purchased: 'ReceiveProposalProductPurchased',
  purchaseFailed: 'ReceiveProposalProductPurchaseFailed',
  coverage: 'ReceiveProposalProductCoverage',
} as const;

const HUB_PATH = '/hubs/proposal-detail';
const REGISTER_METHOD = 'Register';

type ProposalDetailEventByMethod = {
  readonly [HUB_METHODS.success]: ProposalProductSuccessEvent;
  readonly [HUB_METHODS.failed]: ProposalProductFailedEvent;
  readonly [HUB_METHODS.inProgress]: ProposalProductInProgressEvent;
  readonly [HUB_METHODS.revised]: ProposalProductRevisedEvent;
  readonly [HUB_METHODS.purchasing]: ProposalProductPurchasingEvent;
  readonly [HUB_METHODS.purchased]: ProposalProductPurchasedEvent;
  readonly [HUB_METHODS.purchaseFailed]: ProposalProductPurchaseFailedEvent;
  readonly [HUB_METHODS.coverage]: ProposalProductCoverageEvent;
};

type HubMethod = keyof ProposalDetailEventByMethod;

type HandlerSet = Set<ProposalDetailHandlers>;

/**
 * Manages a single lazily-opened HubConnection and multiplexes proposal-detail
 * subscriptions over it.
 */
export class SignalRTransport {
  private readonly hubUrl: string;
  private readonly tokenProvider?: TokenProvider;
  private readonly logLevel: LogLevel;

  private connection: HubConnection | null = null;
  /** Pending or in-flight start, shared by concurrent subscribers. */
  private startPromise: Promise<HubConnection> | null = null;
  /** Active subscriptions keyed by proposalId. */
  private readonly subscribers: Map<string, HandlerSet> = new Map();

  constructor(options: SignalRTransportOptions) {
    this.hubUrl = new URL(HUB_PATH, ensureTrailingSlash(options.hubsBaseUrl)).toString();
    this.tokenProvider = options.tokenProvider;
    this.logLevel = options.logLevel ?? LogLevel.Warning;
  }

  /**
   * Subscribe to proposal-detail events for a given proposal. Opens the
   * underlying hub connection on first subscribe.
   *
   * @returns an unsubscribe function. When the last subscriber for the last
   *   proposal unsubscribes, the underlying connection is stopped.
   */
  async subscribeProposalDetail(
    proposalId: string,
    handlers: ProposalDetailHandlers
  ): Promise<() => void> {
    if (!proposalId) {
      throw new Error('subscribeProposalDetail: proposalId is required');
    }

    let bucket = this.subscribers.get(proposalId);
    const isFirstForProposal = bucket === undefined;
    if (bucket === undefined) {
      bucket = new Set();
      this.subscribers.set(proposalId, bucket);
    }
    bucket.add(handlers);

    try {
      const connection = await this.ensureStarted();
      if (isFirstForProposal) {
        await connection.send(REGISTER_METHOD, { proposalId });
      }
    } catch (error) {
      bucket.delete(handlers);
      if (bucket.size === 0) {
        this.subscribers.delete(proposalId);
      }
      throw error;
    }

    let disposed = false;
    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      const current = this.subscribers.get(proposalId);
      if (!current) {
        return;
      }
      current.delete(handlers);
      if (current.size === 0) {
        this.subscribers.delete(proposalId);
      }
      if (this.subscribers.size === 0) {
        void this.stop();
      }
    };
  }

  /** Stop the underlying hub connection if open and drop all subscribers. */
  async close(): Promise<void> {
    this.subscribers.clear();
    await this.stop();
  }

  private async ensureStarted(): Promise<HubConnection> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return this.connection;
    }
    if (this.startPromise) {
      return this.startPromise;
    }

    const connection = this.buildConnection();
    this.connection = connection;

    this.startPromise = (async () => {
      await connection.start();
      return connection;
    })();

    try {
      return await this.startPromise;
    } catch (error) {
      this.connection = null;
      throw error;
    } finally {
      this.startPromise = null;
    }
  }

  private buildConnection(): HubConnection {
    const tokenProvider = this.tokenProvider;
    const connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: tokenProvider ? () => resolveToken(tokenProvider) : undefined,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(this.logLevel)
      .build();

    this.registerHandlers(connection);

    connection.onreconnected(() => {
      void this.reRegisterAll(connection);
    });

    return connection;
  }

  private registerHandlers(connection: HubConnection): void {
    const dispatch = <M extends HubMethod>(
      method: M,
      pick: (
        handlers: ProposalDetailHandlers
      ) => ((event: ProposalDetailEventByMethod[M]) => void) | undefined
    ): void => {
      connection.on(method, (event: ProposalDetailEventByMethod[M]) => {
        const bucket = this.subscribers.get(event.proposalId);
        if (!bucket) {
          return;
        }
        for (const handlers of bucket) {
          const fn = pick(handlers);
          fn?.(event);
        }
      });
    };

    dispatch(HUB_METHODS.success, (h) => h.onProductSuccess);
    dispatch(HUB_METHODS.failed, (h) => h.onProductFailed);
    dispatch(HUB_METHODS.inProgress, (h) => h.onProductInProgress);
    dispatch(HUB_METHODS.revised, (h) => h.onProductRevised);
    dispatch(HUB_METHODS.purchasing, (h) => h.onProductPurchasing);
    dispatch(HUB_METHODS.purchased, (h) => h.onProductPurchased);
    dispatch(HUB_METHODS.purchaseFailed, (h) => h.onProductPurchaseFailed);
    dispatch(HUB_METHODS.coverage, (h) => h.onProductCoverage);
  }

  private async reRegisterAll(connection: HubConnection): Promise<void> {
    for (const proposalId of this.subscribers.keys()) {
      await connection.send(REGISTER_METHOD, { proposalId });
    }
  }

  private async stop(): Promise<void> {
    const current = this.connection;
    if (!current) {
      return;
    }
    this.connection = null;
    if (
      current.state === HubConnectionState.Disconnected ||
      current.state === HubConnectionState.Disconnecting
    ) {
      return;
    }
    await current.stop();
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

async function resolveToken(provider: TokenProvider): Promise<string> {
  const result = await provider();
  return result ?? '';
}
