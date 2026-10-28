/**
 * @fileoverview Admin Messages Client - The platform's RabbitMQ queues and the messages parked in them
 * @description The queues with their counts, a peek at their messages, the replay and purge of the `_error` and
 * `_skipped` queues, the parked queues the platform tracks, their investigations, and whether new ones are
 * investigated by the AI
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  InvestigationSummaryResult,
  ListMessageQueuesQuery,
  ListMessageQueuesResult,
  ListParkedQueuesQuery,
  ListParkedQueuesResult,
  MessageTrackingSettingsResult,
  ParkedQueueResult,
  PeekMessagesRequest,
  PeekMessagesResult,
  PurgeMessagesRequest,
  PurgeMessagesResult,
  ReplayMessagesRequest,
  ReplayMessagesResult,
  UpdateMessageTrackingSettingsRequest,
} from '@insurup/contracts';

/**
 * The platform's RabbitMQ queues. A message that failed every retry is parked in its queue's `_error` queue, one no
 * consumer took in its `_skipped` queue; those can be replayed onto their queue or purged, and the AI investigates why
 * they were parked. It never replays or purges them itself.
 *
 * Platformun RabbitMQ kuyrukları. Tüm denemelerde başarısız olan bir mesaj kuyruğunun `_error` kuyruğunda, hiçbir
 * tüketicinin almadığı bir mesaj `_skipped` kuyruğunda bekletilir; bunlar kuyruklarına yeniden oynatılabilir veya
 * silinebilir, AI da neden bekletildiklerini inceler. AI onları hiçbir zaman kendisi oynatmaz veya silmez.
 */
export class InsurUpAdminMessagesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * The queues with their counts, from the broker's metrics, which lag by about half a minute.
   *
   * Kuyruklar ve sayıları, aracının yaklaşık yarım dakika geriden gelen metriklerinden.
   */
  async listQueues(
    query?: ListMessageQueuesQuery,
    options?: RequestOptions
  ): Promise<InsurUpResult<ListMessageQueuesResult>> {
    return this.http.get<ListMessageQueuesResult>(admin.messages.queues.render(query), options);
  }

  /**
   * Reads a queue's first messages and puts them back; each comes back marked redelivered and may move. Bodies are
   * masked unless `raw` is asked and allowed.
   *
   * Bir kuyruğun ilk mesajlarını okur ve geri koyar; her biri yeniden teslim edilmiş olarak döner ve yeri değişebilir.
   * Gövdeler, `raw` istenmedikçe ve izin verilmedikçe maskelenir.
   *
   * @param name The queue / Kuyruk
   */
  async peek(
    name: string,
    request?: PeekMessagesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<PeekMessagesResult>> {
    return this.http.post<PeekMessagesResult>(
      admin.messages.peek.render(name),
      request ?? {},
      options
    );
  }

  /**
   * Moves an `_error` or `_skipped` queue's messages back onto their queue, without their fault headers.
   *
   * Bir `_error` veya `_skipped` kuyruğunun mesajlarını, hata başlıkları olmadan kuyruklarına geri taşır.
   *
   * @param name The `_error` or `_skipped` queue / `_error` veya `_skipped` kuyruğu
   */
  async replay(
    name: string,
    request: ReplayMessagesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ReplayMessagesResult>> {
    return this.http.post<ReplayMessagesResult>(
      admin.messages.replay.render(name),
      request,
      options
    );
  }

  /**
   * Removes an `_error` or `_skipped` queue's messages for good.
   *
   * Bir `_error` veya `_skipped` kuyruğunun mesajlarını kalıcı olarak siler.
   *
   * @param name The `_error` or `_skipped` queue / `_error` veya `_skipped` kuyruğu
   */
  async purge(
    name: string,
    request: PurgeMessagesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<PurgeMessagesResult>> {
    return this.http.post<PurgeMessagesResult>(admin.messages.purge.render(name), request, options);
  }

  /**
   * The `_error` and `_skipped` queues the platform tracks, the latest seen first.
   *
   * Platformun izlediği `_error` ve `_skipped` kuyrukları, en son görülenden başlayarak.
   */
  async listParked(
    query?: ListParkedQueuesQuery,
    options?: RequestOptions
  ): Promise<InsurUpResult<ListParkedQueuesResult>> {
    return this.http.get<ListParkedQueuesResult>(admin.messages.parkedList.render(query), options);
  }

  /**
   * One parked queue with its timeline, its investigations and what the latest one found.
   *
   * Tek bir bekletme kuyruğu; zaman çizelgesi, incelemeleri ve sonuncusunun bulgularıyla birlikte.
   *
   * @param parkedQueueId The parked queue / Bekletme kuyruğu
   */
  async getParked(
    parkedQueueId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<ParkedQueueResult>> {
    return this.http.get<ParkedQueueResult>(admin.messages.parked.render(parkedQueueId), options);
  }

  /**
   * Asks the AI to investigate a parked queue now, whatever the switch says.
   *
   * AI'dan bir bekletme kuyruğunu, anahtar ne derse desin, şimdi incelemesini ister.
   *
   * @param parkedQueueId The parked queue / Bekletme kuyruğu
   * @returns The investigation started / Başlatılan inceleme
   */
  async investigate(
    parkedQueueId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<InvestigationSummaryResult>> {
    return this.http.post<InvestigationSummaryResult>(
      admin.messages.investigate.render(parkedQueueId),
      {},
      options
    );
  }

  /**
   * Whether parked queues are investigated by the AI, and how many at most.
   *
   * Bekletme kuyruklarının AI tarafından incelenip incelenmediği ve en fazla kaç tane.
   */
  async getSettings(
    options?: RequestOptions
  ): Promise<InsurUpResult<MessageTrackingSettingsResult>> {
    return this.http.get<MessageTrackingSettingsResult>(admin.messages.settings, options);
  }

  /**
   * Turns the investigation of parked queues on or off and sets its limits, apart from the errors'.
   *
   * Bekletme kuyruklarının incelenmesini açar veya kapatır ve sınırlarını, hatalarınkinden ayrı olarak belirler.
   */
  async updateSettings(
    request: UpdateMessageTrackingSettingsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<MessageTrackingSettingsResult>> {
    return this.http.put<MessageTrackingSettingsResult>(admin.messages.settings, request, options);
  }
}
