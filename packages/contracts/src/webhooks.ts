/**
 * Defines webhook events that can be triggered during the insurance proposal and policy lifecycle.
 * Each event represents a significant state change that external systems may need to be notified about.
 *
 * Sigorta teklifi ve poliçe yaşam döngüsü sırasında tetiklenebilecek webhook olaylarını tanımlar.
 * Her olay, harici sistemlerin bilgilendirilmesi gerekebilecek önemli bir durum değişikliğini temsil eder.
 */
export enum WebhookEvent {
  /**
   * Triggered when a proposal premium calculation is received and processed successfully.
   *
   * Teklif prim hesaplaması alındığında ve başarıyla işlendiğinde tetiklenir.
   */
  ProposalPremiumReceived = 'proposal_premium.received',

  /**
   * Triggered when a proposal premium purchase process is initiated.
   *
   * Teklif prim satın alma süreci başlatıldığında tetiklenir.
   */
  ProposalPremiumPurchasing = 'proposal_premium.purchasing',

  /**
   * Triggered when a proposal premium purchase process is completed successfully.
   *
   * Teklif prim satın alma süreci başarıyla tamamlandığında tetiklenir.
   */
  ProposalPremiumPurchased = 'proposal_premium.purchased',

  /**
   * Triggered when a proposal premium purchase process fails.
   *
   * Teklif prim satın alma süreci başarısız olduğunda tetiklenir.
   */
  ProposalPremiumPurchaseFailed = 'proposal_premium.purchase_failed',

  /**
   * Triggered when an insurance policy is created in the system.
   *
   * Sistemde bir sigorta poliçesi oluşturulduğunda tetiklenir.
   */
  PolicyCreated = 'policy.created',

  /**
   * Triggered when an existing insurance policy is updated or modified.
   *
   * Mevcut bir sigorta poliçesi güncellendiğinde veya değiştirildiğinde tetiklenir.
   */
  PolicyUpdated = 'policy.updated',

  /**
   * Triggered when a new customer is created.
   *
   * Yeni bir müşteri oluşturulduğunda tetiklenir.
   */
  CustomerCreated = 'customer.created',

  /**
   * Triggered when an existing customer is updated.
   *
   * Mevcut bir müşteri güncellendiğinde tetiklenir.
   */
  CustomerUpdated = 'customer.updated',

  /**
   * Triggered when a customer grants KVKK (personal data protection) consent.
   *
   * Müşteri KVKK (kişisel verilerin korunması) izni verdiğinde tetiklenir.
   */
  CustomerKvkkConsentGiven = 'customer.kvkk_consent_given',

  /**
   * Triggered when a customer revokes KVKK consent.
   *
   * Müşteri KVKK iznini geri aldığında tetiklenir.
   */
  CustomerKvkkConsentRevoked = 'customer.kvkk_consent_revoked',

  /**
   * Triggered when a customer grants ETK (commercial electronic message) consent.
   *
   * Müşteri ETK (ticari elektronik ileti) izni verdiğinde tetiklenir.
   */
  CustomerEtkConsentGiven = 'customer.etk_consent_given',

  /**
   * Triggered when a customer revokes ETK consent.
   *
   * Müşteri ETK iznini geri aldığında tetiklenir.
   */
  CustomerEtkConsentRevoked = 'customer.etk_consent_revoked',

  /**
   * Triggered when a new vehicle is created for a customer.
   *
   * Bir müşteri için yeni bir araç oluşturulduğunda tetiklenir.
   */
  VehicleCreated = 'vehicle.created',

  /**
   * Triggered when an existing vehicle is updated.
   *
   * Mevcut bir araç güncellendiğinde tetiklenir.
   */
  VehicleUpdated = 'vehicle.updated',

  /**
   * Triggered when a new property is created for a customer.
   *
   * Bir müşteri için yeni bir gayrimenkul oluşturulduğunda tetiklenir.
   */
  PropertyCreated = 'property.created',

  /**
   * Triggered when an existing property is updated.
   *
   * Mevcut bir gayrimenkul güncellendiğinde tetiklenir.
   */
  PropertyUpdated = 'property.updated',

  /**
   * Triggered when a new case is created.
   *
   * Yeni bir talep oluşturulduğunda tetiklenir.
   */
  CaseCreated = 'case.created',

  /**
   * Triggered when a case's state (main or sub) changes.
   *
   * Bir talebin durumu (ana veya alt) değiştiğinde tetiklenir.
   */
  CaseStateChanged = 'case.state_changed',
}

// Webhook Contracts

/**
 * Request contract for creating a new webhook endpoint to receive real-time event notifications.
 * Configures event subscriptions and security settings for automated system integrations.
 *
 * Gerçek zamanlı olay bildirimlerini almak için yeni webhook endpoint'i oluşturmak üzere istek sözleşmesi.
 * Otomatik sistem entegrasyonları için olay abonelikleri ve güvenlik ayarlarını yapılandırır.
 */
export interface CreateWebhookRequest {
  /**
   * The complete URL where InsurUp will send HTTP POST requests containing event notifications.
   * This endpoint must be publicly accessible, support HTTPS for security, and be capable of
   * handling JSON payloads. The receiving system should respond with appropriate HTTP status codes
   * to indicate successful receipt and processing of webhook notifications.
   *
   * InsurUp'un olay bildirimlerini içeren HTTP POST isteklerini göndereceği tam URL.
   * Bu endpoint herkese açık erişilebilir olmalı, güvenlik için HTTPS'i desteklemeli ve
   * JSON payload'larını işleyebilmelidir. Alıcı sistem, webhook bildirimlerinin başarılı
   * alınması ve işlenmesini belirtmek için uygun HTTP durum kodları ile yanıt vermelidir.
   */
  readonly url: string;

  /**
   * Array of specific event types that this webhook endpoint will be notified about.
   * Events can include policy changes, claim updates, payment confirmations, customer registrations,
   * and other significant activities within the InsurUp platform. Only events specified in this array
   * will trigger notifications to the configured URL, allowing for precise control over data flow.
   *
   * Bu webhook endpoint'inin bilgilendirilecegi belirli olay türlerinin dizisi.
   * Olaylar poliçe değişiklikleri, hasar güncellemeleri, ödeme onayları, müşteri kayıtları ve
   * InsurUp platformu içindeki diğer önemli etkinlikleri içerebilir. Yalnızca bu dizide belirtilen
   * olaylar yapılandırılmış URL'ye bildirim tetikleyecek, bu da veri akışı üzerinde hassas kontrol sağlar.
   */
  readonly events: WebhookEvent[];

  /**
   * Agent branch IDs this webhook is scoped to. An empty array (the default) means
   * the webhook fires for all of the agent's branches.
   *
   * Bu webhook'un kapsandığı acente şube ID'leri. Boş dizi (varsayılan) webhook'un
   * acentenin tüm şubeleri için tetikleneceği anlamına gelir.
   */
  readonly agentBranchIds?: string[];

  /**
   * Optional secret key used to generate HMAC signatures for webhook payloads, enabling
   * the receiving system to verify that notifications are genuinely from InsurUp and haven't been
   * tampered with during transmission. When provided, InsurUp will include a signature header
   * with each webhook delivery that can be validated using this secret.
   *
   * Webhook payload'ları için HMAC imzaları oluşturmak üzere kullanılan isteğe bağlı gizli anahtar,
   * alıcı sistemin bildirimlerin gerçekten InsurUp'tan geldiğini ve iletim sırasında değiştirilmediğini
   * doğrulamasını sağlar. Sağlandığında, InsurUp her webhook teslimi ile bu gizli anahtar kullanılarak
   * doğrulanabilecek bir imza başlığı ekleyecektir.
   */
  readonly secret: string | null;
}

/**
 * Response contract containing the result of a successful webhook endpoint creation.
 * Returns the unique identifier of the newly created webhook for management and reference purposes.
 *
 * Başarılı webhook endpoint oluşturmanın sonucunu içeren yanıt sözleşmesi.
 * Yönetim ve referans amaçları için yeni oluşturulan webhook'un benzersiz tanımlayıcısını döndürür.
 */
export interface CreateWebhookResult {
  /**
   * The unique identifier assigned to the newly created webhook endpoint.
   * This ID serves as the primary reference for all future operations involving this webhook,
   * including configuration updates, event delivery monitoring, redelivery requests, and deletion.
   * Store this identifier securely for webhook management and integration monitoring purposes.
   *
   * Yeni oluşturulan webhook endpoint'ine atanan benzersiz tanımlayıcı.
   * Bu ID, yapılandırma güncellemeleri, olay teslimat izleme, yeniden teslimat talepleri ve silme
   * dahil olmak üzere bu webhook'u içeren gelecekteki tüm işlemler için birincil referans görevi görür.
   * Webhook yönetimi ve entegrasyon izleme amaçları için bu tanımlayıcıyı güvenli bir şekilde saklayın.
   */
  readonly id: string;
}

/**
 * Response contract containing comprehensive information about a specific webhook endpoint.
 * Provides complete webhook configuration details for management and monitoring purposes.
 *
 * Belirli bir webhook endpoint'i hakkında kapsamlı bilgi içeren yanıt sözleşmesi.
 * Yönetim ve izleme amaçları için tam webhook yapılandırma detaylarını sağlar.
 */
export interface GetWebhookByIdResult {
  /**
   * The unique identifier of the webhook endpoint in the InsurUp platform.
   * This ID is used for all webhook management operations including updates, deletion,
   * and delivery monitoring. It serves as the primary reference for this specific webhook configuration.
   *
   * InsurUp platformundaki webhook endpoint'inin benzersiz tanımlayıcısı.
   * Bu ID, güncellemeler, silme ve teslimat izleme dahil tüm webhook yönetim işlemleri için kullanılır.
   * Bu belirli webhook yapılandırması için birincil referans görevi görür.
   */
  readonly id: string;

  /**
   * The configured URL where InsurUp sends HTTP POST requests containing event notifications.
   * This is the endpoint that receives webhook deliveries and must be accessible to InsurUp's
   * notification system. The URL configuration is essential for successful webhook operation.
   *
   * InsurUp'un olay bildirimlerini içeren HTTP POST isteklerini gönderdiği yapılandırılmış URL.
   * Bu, webhook teslimatlarını alan ve InsurUp'un bildirim sistemine erişilebilir olması gereken endpoint'tir.
   * URL yapılandırması başarılı webhook işlemi için olmazsa olmazdır.
   */
  readonly url: string;

  /**
   * Array of specific event types that this webhook endpoint is configured to receive notifications about.
   * These events represent the various activities within the InsurUp platform that will trigger
   * webhook deliveries to the configured URL. Only events in this list will generate notifications
   * for this particular webhook endpoint.
   *
   * Bu webhook endpoint'inin bildirim almak üzere yapılandırıldığı belirli olay türlerinin dizisi.
   * Bu olaylar, yapılandırılmış URL'ye webhook teslimatlarını tetikleyecek InsurUp platformu içindeki
   * çeşitli etkinlikleri temsil eder. Yalnızca bu listedeki olaylar bu belirli webhook endpoint'i için
   * bildirimler oluşturacaktır.
   */
  readonly events: WebhookEvent[];

  /**
   * Agent branch IDs this webhook is scoped to. An empty array means the webhook
   * fires for all of the agent's branches.
   *
   * Bu webhook'un kapsandığı acente şube ID'leri. Boş dizi webhook'un acentenin
   * tüm şubeleri için tetikleneceği anlamına gelir.
   */
  readonly agentBranchIds: string[];

  /**
   * Optional secret key configured for this webhook to enable payload verification through HMAC signatures.
   * When a secret is configured, InsurUp includes signature headers with webhook deliveries that can be
   * validated by the receiving system to ensure authenticity and integrity of the webhook notifications.
   * This field may be null if no secret verification is configured.
   *
   * HMAC imzaları aracılığıyla payload doğrulamasını etkinleştirmek için bu webhook için yapılandırılan
   * isteğe bağlı gizli anahtar. Bir gizli anahtar yapılandırıldığında, InsurUp webhook teslimatları ile
   * alıcı sistem tarafından webhook bildirimlerinin gerçekliğini ve bütünlüğünü sağlamak için doğrulanabilecek
   * imza başlıkları ekler. Gizli doğrulama yapılandırılmamışsa bu alan null olabilir.
   */
  readonly secret: string | null;
}

/**
 * Response contract containing summary information about webhook endpoints for listing and overview purposes.
 * Provides essential webhook details for management dashboards and monitoring interfaces.
 *
 * Listeleme ve genel bakış amaçları için webhook endpoint'leri hakkında özet bilgi içeren yanıt sözleşmesi.
 * Yönetim panoları ve izleme arayüzleri için temel webhook detaylarını sağlar.
 */
export interface GetWebhooksResult {
  /**
   * The unique identifier of the webhook endpoint in the InsurUp platform.
   * This ID is the primary reference for this webhook and can be used for detailed retrieval,
   * updates, deletion, and delivery monitoring operations through other API endpoints.
   *
   * InsurUp platformundaki webhook endpoint'inin benzersiz tanımlayıcısı.
   * Bu ID, bu webhook için birincil referanstır ve diğer API endpoint'leri aracılığıyla
   * detaylı alma, güncelleme, silme ve teslimat izleme işlemleri için kullanılabilir.
   */
  readonly id: string;

  /**
   * The configured URL where InsurUp delivers webhook notifications for this endpoint.
   * This is the destination where HTTP POST requests containing event data are sent.
   * Having this information in the summary view helps administrators quickly identify
   * and verify webhook endpoint destinations.
   *
   * InsurUp'un bu endpoint için webhook bildirimlerini teslim ettiği yapılandırılmış URL.
   * Bu, olay verilerini içeren HTTP POST isteklerinin gönderildiği hedeftir.
   * Bu bilginin özet görünümde bulunması, yöneticilerin webhook endpoint hedeflerini
   * hızlı bir şekilde tanımlamasına ve doğrulamasına yardımcı olur.
   */
  readonly url: string;

  /**
   * Array of specific event types that this webhook endpoint will receive notifications about.
   * This summary information helps administrators understand the scope of each webhook's
   * responsibilities and ensures proper event distribution across different integration endpoints.
   * Essential for managing event routing and avoiding notification gaps.
   *
   * Bu webhook endpoint'inin bildirim alacağı belirli olay türlerinin dizisi.
   * Bu özet bilgi, yöneticilerin her webhook'un sorumluluklarının kapsamını anlamasına
   * ve farklı entegrasyon endpoint'leri arasında uygun olay dağıtımını sağlamasına yardımcı olur.
   * Olay yönlendirmesini yönetmek ve bildirim boşluklarını önlemek için olmazsa olmazdır.
   */
  readonly events: WebhookEvent[];

  /**
   * Agent branch IDs this webhook is scoped to. An empty array means the webhook
   * fires for all of the agent's branches.
   *
   * Bu webhook'un kapsandığı acente şube ID'leri. Boş dizi webhook'un acentenin
   * tüm şubeleri için tetikleneceği anlamına gelir.
   */
  readonly agentBranchIds: string[];

  /**
   * Indicates the presence of a secret key configuration for webhook payload verification.
   * While the actual secret value is not exposed in list views for security reasons,
   * this field shows whether HMAC signature verification is enabled for this webhook endpoint.
   * This information helps administrators verify security configurations at a glance.
   *
   * Webhook payload doğrulaması için gizli anahtar yapılandırmasının varlığını gösterir.
   * Gerçek gizli değer güvenlik nedenleriyle liste görünümlerinde gösterilmezken,
   * bu alan bu webhook endpoint'i için HMAC imza doğrulamasının etkin olup olmadığını gösterir.
   * Bu bilgi, yöneticilerin güvenlik yapılandırmalarını bir bakışta doğrulamasına yardımcı olur.
   */
  readonly secret: string | null;

  /**
   * The total number of webhook delivery attempts that have been made for this endpoint
   * since its creation. This metric provides a quick overview of webhook activity levels
   * and helps administrators identify highly active endpoints, unused webhooks,
   * or endpoints that may need attention due to high failure rates.
   *
   * Bu endpoint için oluşturulduğundan beri yapılan toplam webhook teslimat deneme sayısı.
   * Bu metrik, webhook etkinlik seviyelerinin hızlı bir genel görünümünü sağlar ve
   * yöneticilerin çok aktif endpoint'leri, kullanılmayan webhook'ları veya yüksek başarısızlık
   * oranları nedeniyle dikkat gerektirebilecek endpoint'leri belirlemesine yardımcı olur.
   */
  readonly deliveryCount: number;
}

/**
 * Request contract for updating an existing webhook endpoint configuration.
 * Allows modification of URL, event subscriptions, and security settings for webhook integrations.
 *
 * Mevcut webhook endpoint yapılandırmasını güncellemek için istek sözleşmesi.
 * Webhook entegrasyonları için URL, olay abonelikleri ve güvenlik ayarlarının değiştirilmesine olanak tanır.
 */
export interface UpdateWebhookRequest {
  /**
   * The unique identifier of the webhook endpoint that will be updated with the new configuration.
   * This identifier is used to locate the specific webhook in the system and ensure that
   * the correct webhook configuration is modified with the provided updates.
   *
   * Yeni yapılandırma ile güncellenecek webhook endpoint'inin benzersiz tanımlayıcısı.
   * Bu tanımlayıcı, sistemde belirli webhook'u bulmak ve doğru webhook yapılandırmasının
   * sağlanan güncellemelerle değiştirilmesini sağlamak için kullanılır.
   */
  readonly id: string;

  /**
   * The new URL where InsurUp will send HTTP POST requests containing event notifications.
   * This updated endpoint must be publicly accessible, support HTTPS for security, and be capable
   * of handling JSON payloads. All future webhook deliveries will be sent to this new URL
   * instead of the previous configuration.
   *
   * InsurUp'un olay bildirimlerini içeren HTTP POST isteklerini göndereceği yeni URL.
   * Bu güncellenmiş endpoint herkese açık erişilebilir olmalı, güvenlik için HTTPS'i desteklemeli
   * ve JSON payload'larını işleyebilmelidir. Gelecekteki tüm webhook teslimatları önceki yapılandırma
   * yerine bu yeni URL'ye gönderilecektir.
   */
  readonly url: string;

  /**
   * Updated array of specific event types that this webhook endpoint will be notified about.
   * This replaces the previous event subscriptions entirely, so all desired events must be included.
   * Events can include policy changes, claim updates, payment confirmations, customer registrations,
   * and other significant activities within the InsurUp platform.
   *
   * Bu webhook endpoint'inin bilgilendirilecegi güncellenmiş belirli olay türlerinin dizisi.
   * Bu, önceki olay aboneliklerini tamamen değiştirir, bu nedenle istenen tüm olaylar dahil edilmelidir.
   * Olaylar poliçe değişiklikleri, hasar güncellemeleri, ödeme onayları, müşteri kayıtları ve
   * InsurUp platformu içindeki diğer önemli etkinlikleri içerebilir.
   */
  readonly events: WebhookEvent[];

  /**
   * Updated agent branch IDs this webhook is scoped to. An empty array means the
   * webhook fires for all of the agent's branches.
   *
   * Bu webhook'un kapsandığı güncellenmiş acente şube ID'leri. Boş dizi webhook'un
   * acentenin tüm şubeleri için tetikleneceği anlamına gelir.
   */
  readonly agentBranchIds?: string[];

  /**
   * Updated optional secret key used to generate HMAC signatures for webhook payloads.
   * This replaces any existing secret configuration. When provided, InsurUp will use this new secret
   * for all future webhook deliveries to generate signature headers for payload verification.
   * Set to null to remove secret-based verification entirely.
   *
   * Webhook payload'ları için HMAC imzaları oluşturmak üzere kullanılan güncellenmiş isteğe bağlı gizli anahtar.
   * Bu, mevcut herhangi bir gizli yapılandırmayı değiştirir. Sağlandığında, InsurUp payload doğrulaması için
   * imza başlıkları oluşturmak üzere gelecekteki tüm webhook teslimatları için bu yeni gizli anahtarı kullanacaktır.
   * Gizli anahtar tabanlı doğrulamayı tamamen kaldırmak için null olarak ayarlayın.
   */
  readonly secret: string | null;
}

/**
 * Response contract containing detailed information about a specific webhook delivery attempt.
 * Provides comprehensive delivery metrics, payload data, and response details for troubleshooting and monitoring.
 *
 * Belirli bir webhook teslimat denemesi hakkında detaylı bilgi içeren yanıt sözleşmesi.
 * Sorun giderme ve izleme için kapsamlı teslimat metrikleri, payload verisi ve yanıt detayları sağlar.
 */
export interface GetWebhookDeliveryResult {
  /**
   * The unique identifier of this specific delivery attempt.
   * This ID can be used to track and reference this particular webhook delivery
   * for monitoring, troubleshooting, and audit purposes.
   *
   * Bu belirli teslimat denemesinin benzersiz tanımlayıcısı.
   * Bu ID, izleme, sorun giderme ve denetim amaçları için bu belirli webhook
   * teslimatını takip etmek ve referans almak için kullanılabilir.
   */
  readonly id: string;

  /**
   * The URL where InsurUp attempted to deliver the webhook notification.
   * This shows the exact endpoint that was contacted for this delivery attempt,
   * which is essential for diagnosing connectivity or configuration issues.
   *
   * InsurUp'un webhook bildirimini teslim etmeye çalıştığı URL.
   * Bu, bu teslimat denemesi için iletişim kurulan tam endpoint'i gösterir,
   * bu da bağlantı veya yapılandırma sorunlarını teşhis etmek için olmazsa olmazdır.
   */
  readonly webhookUrl: string;

  /**
   * The specific type of event that occurred in the InsurUp platform and triggered this webhook delivery.
   * This information helps identify what business activity caused the webhook notification
   * and is useful for understanding event patterns and delivery correlations.
   *
   * InsurUp platformunda gerçekleşen ve bu webhook teslimatını tetikleyen belirli olay türü.
   * Bu bilgi, hangi iş etkinliğinin webhook bildirimini tetiklediğini belirlemeye yardımcı olur
   * ve olay desenlerini ve teslimat korelasyonlarını anlamak için faydalıdır.
   */
  readonly event: WebhookEvent;

  /**
   * The timestamp when the delivery attempt was made.
   *
   * Teslimat denemesinin yapıldığı zaman damgası.
   */
  readonly deliveredAt: string;

  /**
   * The HTTP status code returned by the receiving endpoint.
   *
   * Alıcı endpoint tarafından döndürülen HTTP durum kodu.
   */
  readonly responseStatusCode: number | null;

  /**
   * The response body returned by the receiving endpoint.
   *
   * Alıcı endpoint tarafından döndürülen yanıt gövdesi.
   */
  readonly responseBody: string | null;

  /**
   * The total time elapsed from when InsurUp initiated the webhook delivery request
   * to when the response was received (or the request timed out), measured in milliseconds.
   * This metric is important for monitoring webhook performance and identifying slow-responding endpoints.
   *
   * InsurUp'un webhook teslimat isteğini başlattığı andan yanıtın alındığı ana kadar
   * (veya isteğin zaman aşımına uğradığı ana kadar) geçen toplam süre, milisaniye cinsinden ölçülür.
   * Bu metrik, webhook performansını izlemek ve yavaş yanıt veren endpoint'leri belirlemek için önemlidir.
   */
  readonly durationMs: number;

  /**
   * Boolean indicator showing whether the webhook delivery was considered successful.
   * Success is typically determined by receiving a 2xx HTTP status code from the receiving endpoint
   * within the allowed timeout period. This flag provides a quick way to assess delivery status
   * without examining detailed response codes.
   *
   * Webhook teslimatının başarılı kabul edilip edilmediğini gösteren boolean göstergesi.
   * Başarı genellikle izin verilen zaman aşımı süresinde alıcı endpoint'ten 2xx HTTP durum kodu
   * alınmasıyla belirlenir. Bu bayrak, detaylı yanıt kodlarını incelemeden teslimat durumunu
   * değerlendirmek için hızlı bir yol sağlar.
   */
  readonly isSuccess: boolean;
}
