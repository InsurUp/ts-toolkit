/**
 * @fileoverview Admin Messages Contracts - The platform's RabbitMQ queues and the messages parked in them
 * @description TypeScript contracts for the admin panel's `observability/messages/*` endpoints. The queue list and its
 * counts come from the broker's metrics, so they lag by about half a minute. A peek reads messages and puts them back;
 * a message that failed every retry is parked in its queue's `_error` queue, one no consumer took in its `_skipped`
 * queue, and those two can be replayed onto their queue or purged. Bodies come masked unless the admin may see them
 * raw and asks to.
 */

import type { UserReference } from '../common.js';
import type { InvestigationState, InvestigationSummaryResult } from './investigations.js';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * What a queue is: one consumers read, or one messages are parked in.
 *
 * Bir kuyruğun ne olduğu: tüketicilerin okuduğu bir kuyruk veya mesajların bekletildiği bir kuyruk.
 */
export enum MessageQueueKind {
  /** A queue its consumers read. */
  Main = 'MAIN',
  /** `<queue>_error`: the messages that failed every retry. */
  Error = 'ERROR',
  /** `<queue>_skipped`: the messages no consumer took. */
  Skipped = 'SKIPPED',
}

/**
 * Where a parked queue stands.
 *
 * Bekletme kuyruğunun durumu.
 */
export enum ParkedQueueState {
  /** It holds messages. */
  Parked = 'PARKED',
  /** It was emptied, by a replay, a purge or anything else. */
  Drained = 'DRAINED',
}

/**
 * What happened to a parked queue, as its timeline records it.
 *
 * Bir bekletme kuyruğuna ne olduğu, zaman çizelgesinin kaydettiği şekliyle.
 */
export enum ParkedQueueTimelineKind {
  /** Messages were parked in it while it was empty: a new episode began. */
  Parked = 'PARKED',
  /** It was emptied. */
  Drained = 'DRAINED',
  /** Someone replayed messages from it onto their queue. */
  Replayed = 'REPLAYED',
  /** Someone purged messages from it. */
  Purged = 'PURGED',
  /** An investigation was started. */
  InvestigationRequested = 'INVESTIGATION_REQUESTED',
  /** An investigation was due but wasn't started, for instance because a limit was reached. */
  InvestigationSkipped = 'INVESTIGATION_SKIPPED',
  /** An investigation completed. */
  InvestigationCompleted = 'INVESTIGATION_COMPLETED',
  /** An investigation failed. */
  InvestigationFailed = 'INVESTIGATION_FAILED',
}

/**
 * How much of a peeked message's body came back.
 *
 * Göz atılan bir mesajın gövdesinden ne kadarının döndüğü.
 */
export enum MessageBodyAvailability {
  /** The body, with its personal data masked. */
  Masked = 'MASKED',
  /** The body as it is. */
  Raw = 'RAW',
  /** The message's type isn't one of ours, so its body can't be masked and is withheld. */
  UnknownType = 'UNKNOWN_TYPE',
  /** The body is too large to show. */
  TooLarge = 'TOO_LARGE',
  /** The body isn't JSON. */
  NotJson = 'NOT_JSON',
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * A queue with its counts, as the broker's metrics last reported them.
 *
 * Bir kuyruk ve sayıları, aracının metriklerinin son bildirdiği şekliyle.
 */
export interface MessageQueueResult {
  /** The queue's name. */
  readonly name: string;
  /** What it is. */
  readonly kind: MessageQueueKind;
  /** The queue its messages came from, for an `_error` or `_skipped` queue; null for the others. */
  readonly queue: string | null;
  /** Its messages ready to be read. */
  readonly messages: number;
  /** Its messages delivered and not acknowledged yet. */
  readonly unacked: number;
  /** Its consumers. */
  readonly consumers: number;
  /** The parked queue it is, for an `_error` or `_skipped` queue the platform tracks; null for the others. */
  readonly parkedQueueId: string | null;
}

/**
 * The queues, and when the metrics they come from were read.
 *
 * Kuyruklar ve geldikleri metriklerin ne zaman okunduğu.
 */
export interface ListMessageQueuesResult {
  /** The queues. */
  readonly queues: readonly MessageQueueResult[];
  /** When the counts were measured (ISO-8601); they lag by about half a minute. */
  readonly metricsAt: string | null;
}

/**
 * One header of a peeked message.
 *
 * Göz atılan bir mesajın bir başlığı.
 */
export interface MessageHeaderResult {
  /** The header's name. */
  readonly name: string;
  /** Its value. */
  readonly value: string;
}

/**
 * Why a parked message is where it is, from MassTransit's fault headers.
 *
 * Bekletilen bir mesajın neden orada olduğu, MassTransit'in hata başlıklarından.
 */
export interface MessageFaultResult {
  /** The exception's type; null for a skipped message. */
  readonly exceptionType: string | null;
  /** The exception's message; null for a skipped message. */
  readonly message: string | null;
  /** The exception's stack trace, at most 4000 characters; null when none. */
  readonly stackTrace: string | null;
  /** When it failed or was skipped (ISO-8601); null when unknown. */
  readonly faultedAt: string | null;
  /** `fault` for a message that failed, `skip` for one no consumer took. */
  readonly reason: string | null;
  /** The address it was consumed from; null when unknown. */
  readonly inputAddress: string | null;
  /** The host that consumed it; null when unknown. */
  readonly host: string | null;
}

/**
 * A message read by a peek and put back.
 *
 * Göz atma sırasında okunan ve geri konan bir mesaj.
 */
export interface PeekedMessageResult {
  /** Its place in the peek, from 1. */
  readonly position: number;
  /** Its message ID; null when it has none. */
  readonly messageId: string | null;
  /** Its correlation ID; null when it has none. */
  readonly correlationId: string | null;
  /** Its conversation ID; null when it has none. */
  readonly conversationId: string | null;
  /** Its message type, such as `urn:message:Namespace:Type`; null when unknown. */
  readonly messageType: string | null;
  /** When it was sent (ISO-8601); null when unknown. */
  readonly sentAt: string | null;
  /** Whether it had been delivered before. */
  readonly redelivered: boolean;
  /** Its body's size in bytes. */
  readonly sizeBytes: number;
  /** Its content type; null when none. */
  readonly contentType: string | null;
  /** Its headers. */
  readonly headers: readonly MessageHeaderResult[];
  /** Why it is parked, for a message in an `_error` or `_skipped` queue; null for the others. */
  readonly fault: MessageFaultResult | null;
  /** Its body as JSON text, masked unless asked raw; null when withheld. */
  readonly body: string | null;
  /** How much of the body came back. */
  readonly bodyAvailability: MessageBodyAvailability;
  /** Whether the body was cut. */
  readonly bodyTruncated: boolean;
}

/**
 * What a peek read. Every message read is back in the queue, marked redelivered, and may have moved.
 *
 * Göz atmanın okudukları. Okunan her mesaj kuyruğa geri döner, yeniden teslim edilmiş olarak işaretlenir ve yeri
 * değişmiş olabilir.
 */
export interface PeekMessagesResult {
  /** The messages read, in the order they came. */
  readonly messages: readonly PeekedMessageResult[];
  /** The queue's ready messages when it was read. */
  readonly queueMessages: number;
}

/**
 * What a replay did.
 *
 * Yeniden oynatmanın sonucu.
 */
export interface ReplayMessagesResult {
  /** The messages replayed onto their queue. */
  readonly replayed: number;
  /** The messages that couldn't be, left where they were. */
  readonly failed: number;
  /** The message IDs asked for that weren't found. */
  readonly notFound: number;
  /** The messages left in the queue. */
  readonly remaining: number;
}

/**
 * What a purge did.
 *
 * Temizlemenin sonucu.
 */
export interface PurgeMessagesResult {
  /** The messages removed. */
  readonly purged: number;
  /** The message IDs asked for that weren't found. */
  readonly notFound: number;
  /** The messages left in the queue. */
  readonly remaining: number;
}

/**
 * A parked queue's latest investigation, in brief.
 *
 * Bir bekletme kuyruğunun son incelemesi, kısaca.
 */
export interface ParkedQueueInvestigationBrief {
  /** The investigation. */
  readonly id: string;
  /** Where it stands. */
  readonly state: InvestigationState;
  /** When it was started (ISO-8601). */
  readonly createdAt: string;
}

/**
 * An `_error` or `_skipped` queue the platform tracks, as the list shows it.
 *
 * Platformun izlediği bir `_error` veya `_skipped` kuyruğu, listede göründüğü şekliyle.
 */
export interface ParkedQueueSummaryResult {
  /** The parked queue's ID. */
  readonly id: string;
  /** The queue's name, such as `consent-changed_error`. */
  readonly name: string;
  /** Whether it holds failed or skipped messages. */
  readonly kind: MessageQueueKind;
  /** The queue its messages came from. */
  readonly queue: string;
  /** Where it stands. */
  readonly state: ParkedQueueState;
  /** When its current episode began (ISO-8601). */
  readonly episodeStartedAt: string;
  /** Its messages when last seen. */
  readonly messages: number;
  /** When it was first seen (ISO-8601). */
  readonly firstSeenAt: string;
  /** When it was last seen with messages (ISO-8601). */
  readonly lastSeenAt: string;
  /** Its latest investigation; null when it was never investigated. */
  readonly latestInvestigation: ParkedQueueInvestigationBrief | null;
}

/**
 * One entry of a parked queue's timeline.
 *
 * Bir bekletme kuyruğunun zaman çizelgesindeki bir kayıt.
 */
export interface ParkedQueueTimelineEntryResult {
  /** When it happened (ISO-8601). */
  readonly at: string;
  /** What happened. */
  readonly kind: ParkedQueueTimelineKind;
  /** Who did it; null for what the platform saw on its own. */
  readonly user: UserReference | null;
  /** How many messages, for a replay or a purge. */
  readonly count: number | null;
  /** The investigation, for the investigation entries. */
  readonly investigationId: string | null;
  /** Why an investigation was skipped or failed. */
  readonly note: string | null;
}

/**
 * What the latest completed investigation found about a parked queue.
 *
 * Son tamamlanan incelemenin bir bekletme kuyruğu hakkında bulduğu.
 */
export interface ParkedQueueFindingsResult {
  /** The investigation. */
  readonly investigationId: string;
  /** What fails and why, as the investigator wrote it. */
  readonly cause: string | null;
  /** How it can be fixed, and whether to replay or purge the messages, as the investigator wrote it. */
  readonly resolution: string | null;
  /** When it completed (ISO-8601). */
  readonly completedAt: string | null;
}

/**
 * A parked queue with its timeline, its investigations and what the latest one found.
 *
 * Bir bekletme kuyruğu; zaman çizelgesi, incelemeleri ve sonuncusunun bulgularıyla birlikte.
 */
export interface ParkedQueueResult extends ParkedQueueSummaryResult {
  /** What happened to it, newest first, at most 200 entries. */
  readonly timeline: readonly ParkedQueueTimelineEntryResult[];
  /** Its investigations, newest first, at most 20. */
  readonly investigations: readonly InvestigationSummaryResult[];
  /** What the latest completed investigation found; null when none has. */
  readonly findings: ParkedQueueFindingsResult | null;
}

/**
 * The parked queues.
 *
 * Bekletme kuyrukları.
 */
export interface ListParkedQueuesResult {
  /** The parked queues, the latest seen first. */
  readonly items: readonly ParkedQueueSummaryResult[];
}

/**
 * Whether parked queues are investigated, and how many at most. Their limits are their own, apart from the errors'.
 *
 * Bekletme kuyruklarının incelenip incelenmediği ve en fazla kaç tane. Sınırları hatalarınkinden ayrıdır.
 */
export interface MessageTrackingSettingsResult {
  /** Whether a parked queue that starts a new episode is investigated by the AI. */
  readonly investigateParkedQueues: boolean;
  /** At most this many automatic investigations an hour. */
  readonly maxPerHour: number;
  /** At most this many automatic investigations a day. */
  readonly maxPerDay: number;
  /** When they were last changed (ISO-8601); null when never. */
  readonly updatedAt: string | null;
  /** Who last changed them; null when nobody did. */
  readonly updatedBy: UserReference | null;
  /** Whether an investigator is configured in this environment; without one nothing is investigated. */
  readonly investigatorAvailable: boolean;
  /** Whether the queues are scanned in this environment; without it no parked queue is tracked. */
  readonly scanAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

/**
 * Which queues to list. Every filter is optional.
 *
 * Hangi kuyrukların listeleneceği. Tüm filtreler isteğe bağlıdır.
 */
export interface ListMessageQueuesQuery {
  /** Only queues of this kind. */
  readonly kind?: MessageQueueKind;
  /** Text to look for in the queue's name. */
  readonly search?: string;
}

/**
 * How many messages to peek at, and whether raw.
 *
 * Kaç mesaja göz atılacağı ve ham olup olmayacağı.
 */
export interface PeekMessagesRequest {
  /** At most this many: 1 to 50, 20 by default. */
  readonly count?: number;
  /** Bodies as they are, which needs the permission to read message payloads; masked by default. */
  readonly raw?: boolean;
}

/**
 * Which parked messages to replay onto their queue. Set exactly one of `messageIds`, `count` and `all`.
 *
 * Hangi bekletilen mesajların kuyruğuna yeniden oynatılacağı. `messageIds`, `count` ve `all` alanlarından tam olarak
 * birini verin.
 */
export interface ReplayMessagesRequest {
  /** These messages, by their message ID. */
  readonly messageIds?: readonly string[];
  /** The oldest this many. */
  readonly count?: number;
  /** Every message. */
  readonly all?: boolean;
  /** Replay from a `_skipped` queue even though its queue has no consumer. */
  readonly force?: boolean;
}

/**
 * Which parked messages to remove. Set exactly one of `messageIds` and `all`.
 *
 * Hangi bekletilen mesajların silineceği. `messageIds` ve `all` alanlarından tam olarak birini verin.
 */
export interface PurgeMessagesRequest {
  /** These messages, by their message ID. */
  readonly messageIds?: readonly string[];
  /** Every message. */
  readonly all?: boolean;
}

/**
 * Which parked queues to list.
 *
 * Hangi bekletme kuyruklarının listeleneceği.
 */
export interface ListParkedQueuesQuery {
  /** Only parked queues in this state. */
  readonly state?: ParkedQueueState;
}

/**
 * Whether parked queues are investigated, and how many at most.
 *
 * Bekletme kuyruklarının incelenip incelenmeyeceği ve en fazla kaç tane.
 */
export interface UpdateMessageTrackingSettingsRequest {
  /** Whether a parked queue that starts a new episode is investigated by the AI. */
  readonly investigateParkedQueues: boolean;
  /** At most this many automatic investigations an hour. */
  readonly maxPerHour: number;
  /** At most this many automatic investigations a day. */
  readonly maxPerDay: number;
}
