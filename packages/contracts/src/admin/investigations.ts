/**
 * @fileoverview Admin Investigations Contracts - What the AI found when it looked into an alert or an error
 * @description TypeScript contracts for the admin panel's `observability/investigations/*` endpoints. An
 * investigation is started for a firing alert whose rule asks for one, for a new or returning error group while the
 * project-wide switch is on, or by an admin; the investigator reads production read-only and reports back.
 */

import type { UserReference } from '../common.js';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * What an investigation looks into.
 *
 * Bir incelemenin neyi incelediği.
 */
export enum InvestigationKind {
  /** A firing alert. */
  Alert = 'ALERT',
  /** An error group. */
  Error = 'ERROR',
  /** A parked queue: an `_error` or `_skipped` queue holding messages. */
  Queue = 'QUEUE',
}

/**
 * Who started an investigation.
 *
 * Bir incelemeyi kimin başlattığı.
 */
export enum InvestigationTrigger {
  /** The platform, for a firing alert or a new or returning error. */
  Automatic = 'AUTOMATIC',
  /** An admin. */
  Manual = 'MANUAL',
}

/**
 * Where an investigation stands.
 *
 * Bir incelemenin durumu.
 */
export enum InvestigationState {
  /** Waiting for the investigator. */
  Queued = 'QUEUED',
  /** The investigator is working on it. */
  Running = 'RUNNING',
  /** The investigator reported what it found. */
  Completed = 'COMPLETED',
  /** It couldn't be finished; `failure` says why. */
  Failed = 'FAILED',
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * An investigation, without its report.
 *
 * Bir inceleme, raporu olmadan.
 */
export interface InvestigationSummaryResult {
  /** The investigation's ID. */
  readonly id: string;
  /** What it looks into. */
  readonly kind: InvestigationKind;
  /** Who started it. */
  readonly trigger: InvestigationTrigger;
  /** Where it stands. */
  readonly state: InvestigationState;
  /** The admin who started it; null when the platform did. */
  readonly requestedBy: UserReference | null;
  /** The alert rule's name, the error group's title, or the parked queue's name. */
  readonly title: string;
  /** The alert's rule, for an alert. */
  readonly ruleId: string | null;
  /** The alert's notification, for an alert. */
  readonly notificationId: string | null;
  /** The error group, for an error. */
  readonly errorGroupId: string | null;
  /** The parked queue, for a queue; absent from cores older than the Messages page. */
  readonly parkedQueueId?: string | null;
  /** When it was started (ISO-8601). */
  readonly createdAt: string;
  /** When the investigator picked it up (ISO-8601). */
  readonly startedAt: string | null;
  /** When it completed or failed (ISO-8601). */
  readonly completedAt: string | null;
  /**
   * The draft pull requests the investigator opened, on any of InsurUp's repositories (core, the admin panel, this SDK,
   * compose); empty when it opened none.
   */
  readonly pullRequestUrls: readonly string[];
  /** Why it failed, when it did. */
  readonly failure: string | null;
}

/**
 * An investigation with what the investigator found.
 *
 * Bir inceleme ve araştırmacının bulguları.
 */
export interface InvestigationResult extends InvestigationSummaryResult {
  /** The report, in Slack's mrkdwn; null until it completes. */
  readonly report: string | null;
  /** What the error is and why it happens, as the investigator wrote it. */
  readonly cause: string | null;
  /** How it can be fixed, or why it can't, as the investigator wrote it. */
  readonly resolution: string | null;
  /** The model that ran it. */
  readonly model: string | null;
  /** What the model cost, in US dollars. */
  readonly costUsd: number | null;
}

/**
 * One page of investigations, newest first.
 *
 * İncelemelerin bir sayfası, en yeniden başlayarak.
 */
export interface ListInvestigationsResult {
  /** The investigations. */
  readonly items: readonly InvestigationSummaryResult[];
  /** Where the next page starts; null on the last page. */
  readonly nextCursor: string | null;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/**
 * Which investigations to list. Every filter is optional.
 *
 * Hangi incelemelerin listeleneceği. Tüm filtreler isteğe bağlıdır.
 */
export interface ListInvestigationsQuery {
  /** Only alerts', only errors' or only parked queues'. */
  readonly kind?: InvestigationKind;
  /** Only one alert rule's. */
  readonly ruleId?: string;
  /** Only one alert notification's. */
  readonly notificationId?: string;
  /** Only one error group's. */
  readonly errorGroupId?: string;
  /** Where the page starts: the previous page's `nextCursor`. */
  readonly cursor?: string;
  /** At most this many: 1 to 100, 50 by default. */
  readonly limit?: number;
}
