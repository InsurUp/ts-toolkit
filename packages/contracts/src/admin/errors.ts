/**
 * @fileoverview Admin Error Groups Contracts - The platform's errors, grouped by fingerprint
 * @description TypeScript contracts for the admin panel's `observability/errors/*` and
 * `observability/error-tracking/settings` endpoints. Every Error and Fatal log entry carries a fingerprint; the
 * entries that share one are a group, which admins triage: a status, what the error is and why it happens, and how
 * it was fixed or why it can't be. Only people set the status; the AI writes the texts while nobody else has.
 */

import type { UserReference } from '../common.js';
import type { InvestigationState, InvestigationSummaryResult } from './investigations.js';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * Where an error group stands. Only people change it.
 *
 * Bir hata grubunun durumu. Yalnızca insanlar değiştirir.
 */
export enum ErrorGroupStatus {
  /** Nobody has dealt with it yet. */
  Open = 'OPEN',
  /** It was fixed; if it comes back, it opens again as regressed. */
  Resolved = 'RESOLVED',
  /** It can't be fixed on our side; it isn't investigated again. */
  Unresolvable = 'UNRESOLVABLE',
  /** It isn't a problem; it is hidden and never investigated. */
  Ignored = 'IGNORED',
}

/**
 * Who wrote an error group's cause or resolution.
 *
 * Bir hata grubunun nedenini veya çözümünü kimin yazdığı.
 */
export enum AuthorKind {
  /** A person. */
  Human = 'HUMAN',
  /** The AI, during an investigation. */
  Ai = 'AI',
}

/**
 * What happened to an error group, as its timeline records it.
 *
 * Bir hata grubuna ne olduğu, zaman çizelgesinin kaydettiği şekliyle.
 */
export enum ErrorTimelineKind {
  /** The error was seen for the first time. */
  FirstSeen = 'FIRST_SEEN',
  /** A resolved error was seen again. */
  Regressed = 'REGRESSED',
  /** Someone changed the status. */
  StatusChanged = 'STATUS_CHANGED',
  /** Someone, or the AI, wrote the cause. */
  CauseWritten = 'CAUSE_WRITTEN',
  /** Someone, or the AI, wrote the resolution. */
  ResolutionWritten = 'RESOLUTION_WRITTEN',
  /** An investigation was started. */
  InvestigationRequested = 'INVESTIGATION_REQUESTED',
  /** An investigation completed. */
  InvestigationCompleted = 'INVESTIGATION_COMPLETED',
  /** An investigation failed. */
  InvestigationFailed = 'INVESTIGATION_FAILED',
  /** An investigation was due but wasn't started, for instance because a limit was reached. */
  InvestigationSkipped = 'INVESTIGATION_SKIPPED',
  /** Someone cleared the cause. */
  CauseCleared = 'CAUSE_CLEARED',
  /** Someone cleared the resolution. */
  ResolutionCleared = 'RESOLUTION_CLEARED',
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * Who wrote a text: a person, or the AI during an investigation.
 *
 * Bir metni kimin yazdığı: bir kişi veya bir inceleme sırasında AI.
 */
export interface ErrorAuthorResult {
  /** A person or the AI. */
  readonly kind: AuthorKind;
  /** The person; null for the AI. */
  readonly user: UserReference | null;
  /** The investigation, for the AI. */
  readonly investigationId: string | null;
}

/**
 * An error group's cause or resolution.
 *
 * Bir hata grubunun nedeni veya çözümü.
 */
export interface ErrorNoteResult {
  /** The text. */
  readonly text: string;
  /** Who wrote it. */
  readonly author: ErrorAuthorResult;
  /** When (ISO-8601). */
  readonly at: string;
}

/**
 * An error group's latest investigation, in brief.
 *
 * Bir hata grubunun son incelemesi, kısaca.
 */
export interface ErrorGroupInvestigationBrief {
  /** The investigation. */
  readonly id: string;
  /** Where it stands. */
  readonly state: InvestigationState;
  /** When it was started (ISO-8601). */
  readonly createdAt: string;
}

/**
 * An error group as the list shows it.
 *
 * Bir hata grubu, listede göründüğü şekliyle.
 */
export interface ErrorGroupSummaryResult {
  /** The group's ID. */
  readonly id: string;
  /** The fingerprint every entry of the group carries in `error.fingerprint`. */
  readonly fingerprint: string;
  /** The service that logs it, such as `core` or `agent-panel`. */
  readonly service: string;
  /** The exception's type; null when the entries carry no exception. */
  readonly exceptionType: string | null;
  /** Where in our code it happens (`Namespace.Type.Method`), or the logger; null when unknown. */
  readonly culprit: string | null;
  /** The message template, without its values; null when there is none. */
  readonly template: string | null;
  /** The latest logger seen; null when none. */
  readonly logger: string | null;
  /** A readable title. */
  readonly title: string;
  /** Where it stands. */
  readonly status: ErrorGroupStatus;
  /** Whether it came back after being resolved, until someone sets its status again. */
  readonly regressed: boolean;
  /** When it was first seen (ISO-8601). */
  readonly firstSeenAt: string;
  /** When it was last seen (ISO-8601). */
  readonly lastSeenAt: string;
  /** Its entries over the last 24 hours; null when the logs can't be reached. */
  readonly count24h: number | null;
  /** Its entries over the last 7 days; null when the logs can't be reached. */
  readonly count7d: number | null;
  /** Whether its cause is written. */
  readonly hasCause: boolean;
  /** Whether its resolution is written. */
  readonly hasResolution: boolean;
  /** Its latest investigation; null when it was never investigated. */
  readonly latestInvestigation: ErrorGroupInvestigationBrief | null;
}

/**
 * One entry of an error group's timeline.
 *
 * Bir hata grubunun zaman çizelgesindeki bir kayıt.
 */
export interface ErrorTimelineEntryResult {
  /** When it happened (ISO-8601). */
  readonly at: string;
  /** What happened. */
  readonly kind: ErrorTimelineKind;
  /** Who did it; null for what the platform saw on its own. */
  readonly author: ErrorAuthorResult | null;
  /** The new status, for a status change. */
  readonly status: ErrorGroupStatus | null;
  /** The investigation, for the investigation entries. */
  readonly investigationId: string | null;
  /** Why an investigation was skipped or failed. */
  readonly note: string | null;
}

/**
 * An error group with its texts, its timeline and its investigations.
 *
 * Bir hata grubu; metinleri, zaman çizelgesi ve incelemeleriyle birlikte.
 */
export interface ErrorGroupResult extends ErrorGroupSummaryResult {
  /** What the error is and why it happens; null when nobody wrote it. */
  readonly cause: ErrorNoteResult | null;
  /** How it was fixed, or why it can't be; null when nobody wrote it. */
  readonly resolution: ErrorNoteResult | null;
  /** The trace of one of its entries; null when none had one. */
  readonly sampleTraceId: string | null;
  /** What happened to it, newest first, at most 200 entries. */
  readonly timeline: readonly ErrorTimelineEntryResult[];
  /** Its investigations, newest first, at most 20. */
  readonly investigations: readonly InvestigationSummaryResult[];
}

/**
 * One page of error groups.
 *
 * Hata gruplarının bir sayfası.
 */
export interface ListErrorGroupsResult {
  /** The groups. */
  readonly items: readonly ErrorGroupSummaryResult[];
  /** Where the next page starts; null on the last page. */
  readonly nextCursor: string | null;
}

/**
 * Whether new errors are investigated, and how many at most.
 *
 * Yeni hataların incelenip incelenmediği ve en fazla kaç tane.
 */
export interface ErrorTrackingSettingsResult {
  /** Whether a new error group, or a resolved one that comes back, is investigated by the AI. */
  readonly investigateNewErrors: boolean;
  /** At most this many automatic investigations an hour. */
  readonly maxPerHour: number;
  /** At most this many automatic investigations a day. */
  readonly maxPerDay: number;
  /** When they were last changed (ISO-8601); null when never. */
  readonly updatedAt: string | null;
  /** Who last changed them; null when nobody did. */
  readonly updatedBy: UserReference | null;
  /** Whether an investigator is configured in this environment; without one nothing is investigated. */
  readonly investigatorAvailable?: boolean;
  /** Whether the logs are scanned for errors in this environment; without it the list stays empty. */
  readonly scanAvailable?: boolean;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/**
 * Which error groups to list. Every filter is optional.
 *
 * Hangi hata gruplarının listeleneceği. Tüm filtreler isteğe bağlıdır.
 */
export interface ListErrorGroupsQuery {
  /** Only groups in these statuses. */
  readonly status?: readonly ErrorGroupStatus[];
  /** Only one service's groups. */
  readonly service?: string;
  /** Text to look for in the title, the culprit, the template or the fingerprint. */
  readonly search?: string;
  /** Where the page starts: the previous page's `nextCursor`. */
  readonly cursor?: string;
  /** At most this many: 1 to 100, 50 by default. */
  readonly limit?: number;
}

/**
 * Changes what a person decides about an error group. Every field is optional; an empty `cause` or `resolution`
 * clears it.
 *
 * Bir kişinin bir hata grubu hakkındaki kararını değiştirir. Tüm alanlar isteğe bağlıdır; boş bir `cause` veya
 * `resolution` onu temizler.
 */
export interface UpdateErrorGroupRequest {
  /** Its new status. */
  readonly status?: ErrorGroupStatus;
  /** What the error is and why it happens, at most 4000 characters. */
  readonly cause?: string;
  /** How it was fixed, or why it can't be, at most 4000 characters. */
  readonly resolution?: string;
}

/**
 * Whether new errors are investigated, and how many at most.
 *
 * Yeni hataların incelenip incelenmeyeceği ve en fazla kaç tane.
 */
export interface UpdateErrorTrackingSettingsRequest {
  /** Whether a new error group, or a resolved one that comes back, is investigated by the AI. */
  readonly investigateNewErrors: boolean;
  /** At most this many automatic investigations an hour. */
  readonly maxPerHour: number;
  /** At most this many automatic investigations a day. */
  readonly maxPerDay: number;
}
