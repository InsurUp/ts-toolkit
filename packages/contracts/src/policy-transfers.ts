/**
 * @fileoverview Policy Transfer Contracts - Request and response types for policy transfer operations
 * @description Policy transfer operations for handling bulk policy transfers between systems
 */

import type {
  ProductBranch,
  UserReference,
  PolicyTransferTriggerStatus,
  PolicyTransferCompanyFailureReason,
  TransferredPolicyStatus,
  TransferredPolicySkipReason,
  TransferredPolicyFailureReason,
} from './common.js';

// ============================================================================
// POLICY TRANSFER CONTRACTS
// ============================================================================

/**
 * Request to retrieve detailed information about a policy transfer operation.
 * Used to fetch comprehensive data about transfer status, progress, and execution results.
 *
 * Bir poliçe transfer işlemi hakkında ayrıntılı bilgi almak için istek.
 * Transfer durumu, ilerleme ve yürütme sonuçları hakkında kapsamlı veri getirmek için kullanılır.
 */
export interface GetPolicyTransferDetailRequest {
  /**
   * The unique identifier of the policy transfer operation for which detailed information is requested.
   *
   * Ayrıntılı bilgisi istenen poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly policyTransferId: string;
}

/**
 * Comprehensive response containing detailed information about a policy transfer operation.
 * Returns transfer status, statistics, execution history, and trigger information.
 *
 * Bir poliçe transfer işlemi hakkında ayrıntılı bilgileri içeren kapsamlı yanıt.
 * Transfer durumu, istatistikler, yürütme geçmişi ve tetikleyici bilgilerini döndürür.
 */
export interface GetPolicyTransferDetailResult {
  /**
   * The unique identifier of the policy transfer operation.
   *
   * Poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * The start date of the transfer period.
   *
   * Transfer döneminin başlangıç tarihi.
   */
  readonly startDate: string;

  /**
   * The end date of the transfer period.
   *
   * Transfer döneminin bitiş tarihi.
   */
  readonly endDate: string;

  /**
   * The date and time when the transfer was created.
   *
   * Transferin oluşturulduğu tarih ve saat.
   */
  readonly createdAt: string;

  /**
   * The number of policies that were successfully transferred.
   *
   * Başarıyla transfer edilen poliçe sayısı.
   */
  readonly succeededPolicyCount: number;

  /**
   * The number of policies that failed to transfer.
   *
   * Transfer edilemeyen poliçe sayısı.
   */
  readonly failedPolicyCount: number;

  /**
   * The number of policies that were skipped during transfer.
   *
   * Transfer sırasında atlanan poliçe sayısı.
   */
  readonly skippedPolicyCount: number;

  /**
   * The list of trigger executions for this transfer operation.
   *
   * Bu transfer işlemi için tetikleyici yürütmelerinin listesi.
   */
  readonly triggers: readonly PolicyTransferTrigger[];
}

/**
 * Represents a single trigger execution within a policy transfer operation.
 * Contains timing, statistics, and status information for the execution.
 *
 * Bir poliçe transfer işlemi içindeki tek bir tetikleyici yürütmesini temsil eder.
 * Yürütme için zamanlama, istatistik ve durum bilgilerini içerir.
 */
export interface PolicyTransferTrigger {
  /**
   * The unique identifier for this specific trigger execution within the transfer operation.
   *
   * Transfer işlemi içindeki bu belirli tetikleyici yürütmesinin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * The date and time when this trigger execution occurred.
   *
   * Bu tetikleyici yürütmesinin gerçekleştiği tarih ve saat.
   */
  readonly occurredAt: string;

  /**
   * The total time taken for this trigger execution in milliseconds.
   * Null indicates the execution is still in progress or duration is not available.
   *
   * Bu tetikleyici yürütmesi için geçen toplam süre (milisaniye cinsinden).
   * Null, yürütmenin hala devam ettiğini veya sürenin mevcut olmadığını belirtir.
   */
  readonly durationMs: number | null;

  /**
   * The number of policies that were successfully transferred during this trigger execution.
   *
   * Bu tetikleyici yürütmesi sırasında başarıyla transfer edilen poliçe sayısı.
   */
  readonly succeededPolicyCount: number;

  /**
   * The number of policies that failed to transfer during this trigger execution.
   *
   * Bu tetikleyici yürütmesi sırasında transfer edilemeyen poliçe sayısı.
   */
  readonly failedPolicyCount: number;

  /**
   * The number of policies that were skipped during this trigger execution.
   *
   * Bu tetikleyici yürütmesi sırasında atlanan poliçe sayısı.
   */
  readonly skippedPolicyCount: number;

  /**
   * The number of insurance companies that were processed during this trigger execution.
   *
   * Bu tetikleyici yürütmesi sırasında işlenen sigorta şirketi sayısı.
   */
  readonly insuranceCompanyCount: number;

  /**
   * The current status of this trigger execution.
   *
   * Bu tetikleyici yürütmesinin mevcut durumu.
   */
  readonly status: PolicyTransferTriggerStatus;
}

/**
 * Request to retrieve detailed information about a specific policy transfer trigger execution.
 * Used to fetch comprehensive data about individual trigger runs within a policy transfer operation.
 *
 * Belirli bir poliçe transfer tetikleyici yürütmesi hakkında ayrıntılı bilgi almak için istek.
 * Bir poliçe transfer işlemi içindeki bireysel tetikleyici çalışmaları hakkında kapsamlı veri getirmek için kullanılır.
 */
export interface GetPolicyTransferTriggerDetailRequest {
  /**
   * The unique identifier of the policy transfer operation that contains the trigger to be analyzed.
   *
   * Analiz edilecek tetikleyiciyi içeren poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly policyTransferId: string;

  /**
   * The unique identifier of the specific trigger execution within the policy transfer operation.
   *
   * Poliçe transfer işlemi içindeki belirli tetikleyici yürütmesinin benzersiz tanımlayıcısı.
   */
  readonly policyTransferTriggerId: string;
}

/**
 * Detailed response for a specific policy transfer trigger execution.
 * Returns comprehensive information about trigger performance, timing, and company-specific results.
 *
 * Belirli bir poliçe transfer tetikleyici yürütmesi için ayrıntılı yanıt.
 * Tetikleyici performansı, zamanlama ve şirkete özgü sonuçlar hakkında kapsamlı bilgi döndürür.
 */
export interface GetPolicyTransferTriggerDetailResult {
  /**
   * The unique identifier of this specific trigger execution.
   *
   * Bu belirli tetikleyici yürütmesinin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * The identifier of the policy transfer operation that contains this trigger execution.
   *
   * Bu tetikleyici yürütmesini içeren poliçe transfer işleminin tanımlayıcısı.
   */
  readonly policyTransferId: string;

  /**
   * The exact date and time when this trigger execution was started.
   *
   * Bu tetikleyici yürütmesinin başlatıldığı kesin tarih ve saat.
   */
  readonly occurredAt: string;

  /**
   * The total number of policies that were successfully transferred in this trigger execution.
   *
   * Bu tetikleyici yürütmesinde başarıyla transfer edilen toplam poliçe sayısı.
   */
  readonly succeededPolicyCount: number;

  /**
   * The total number of policies that failed to transfer in this trigger execution.
   *
   * Bu tetikleyici yürütmesinde transfer edilemeyen toplam poliçe sayısı.
   */
  readonly failedPolicyCount: number;

  /**
   * The total number of policies that were skipped during this trigger execution.
   *
   * Bu tetikleyici yürütmesi sırasında atlanan toplam poliçe sayısı.
   */
  readonly skippedPolicyCount: number;

  /**
   * Detailed timing breakdown for different phases of the trigger execution process.
   *
   * Tetikleyici yürütme sürecinin farklı aşamaları için ayrıntılı zamanlama dökümü.
   */
  readonly duration: PolicyTransferTriggerDuration;

  /**
   * Array of company-specific results showing performance and outcomes for each insurance company.
   *
   * Her sigorta şirketi için performans ve sonuçları gösteren şirkete özgü sonuçlar dizisi.
   */
  readonly companies: readonly PolicyTransferTriggerCompany[];
}

/**
 * Detailed timing information for different phases of trigger execution.
 * Provides performance metrics for monitoring and optimization.
 *
 * Tetikleyici yürütmesinin farklı aşamaları için ayrıntılı zamanlama bilgileri.
 * İzleme ve optimizasyon için performans metrikleri sağlar.
 */
export interface PolicyTransferTriggerDuration {
  /**
   * The time spent retrieving policy data from external insurance systems in milliseconds.
   *
   * Harici sigorta sistemlerinden poliçe verilerini alma için harcanan süre (milisaniye cinsinden).
   */
  readonly fetchingMs: number | null;

  /**
   * The time spent filtering and validating the retrieved policy data in milliseconds.
   *
   * Alınan poliçe verilerini filtreleme ve doğrulama için harcanan süre (milisaniye cinsinden).
   */
  readonly filteringMs: number | null;

  /**
   * The time spent transforming policy data into the target system format in milliseconds.
   *
   * Poliçe verilerini hedef sistem formatına dönüştürme için harcanan süre (milisaniye cinsinden).
   */
  readonly transformingMs: number | null;

  /**
   * The time spent importing customer information into the target system in milliseconds.
   *
   * Müşteri bilgilerini hedef sisteme içe aktarma için harcanan süre (milisaniye cinsinden).
   */
  readonly importingCustomersMs: number | null;

  /**
   * The time spent importing policy information into the target system in milliseconds.
   *
   * Poliçe bilgilerini hedef sisteme içe aktarma için harcanan süre (milisaniye cinsinden).
   */
  readonly importingPoliciesMs: number | null;
}

/**
 * Represents the transfer results for a specific insurance company.
 * Contains company-specific statistics and status information.
 *
 * Belirli bir sigorta şirketi için transfer sonuçlarını temsil eder.
 * Şirkete özgü istatistikler ve durum bilgilerini içerir.
 */
export interface PolicyTransferTriggerCompany {
  /**
   * The unique identifier of the insurance company for which these results apply.
   *
   * Bu sonuçların geçerli olduğu sigorta şirketinin benzersiz tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * The number of policies that were successfully transferred for this specific insurance company.
   *
   * Bu belirli sigorta şirketi için başarıyla transfer edilen poliçe sayısı.
   */
  readonly succeededPolicyCount: number;

  /**
   * The number of policies that failed to transfer for this specific insurance company.
   *
   * Bu belirli sigorta şirketi için transfer edilemeyen poliçe sayısı.
   */
  readonly failedPolicyCount: number;

  /**
   * The number of policies that were skipped for this specific insurance company.
   *
   * Bu belirli sigorta şirketi için atlanan poliçe sayısı.
   */
  readonly skippedPolicyCount: number;

  /**
   * Boolean indicator showing whether the overall transfer operation was successful for this company.
   *
   * Bu şirket için genel transfer işleminin başarılı olup olmadığını gösteren boolean göstergesi.
   */
  readonly success: boolean;

  /**
   * The specific reason why the transfer failed for this company, if applicable.
   * Null indicates successful transfer or no specific failure reason available.
   *
   * Bu şirket için transferin neden başarısız olduğunun belirli nedeni, eğer varsa.
   * Null, başarılı transferi veya belirli bir başarısızlık nedeninin mevcut olmadığını belirtir.
   */
  readonly failureReason: PolicyTransferCompanyFailureReason | null;
}

/**
 * Request to create a new policy transfer operation.
 * Used to initiate bulk policy transfers from external insurance systems within a specified date range.
 *
 * Yeni bir poliçe transfer işlemi oluşturma isteği.
 * Belirtilen tarih aralığında harici sigorta sistemlerinden toplu poliçe transferlerini başlatmak için kullanılır.
 */
export interface CreatePolicyTransferRequest {
  /**
   * The starting date of the time period for which policies should be transferred.
   *
   * Poliçelerin transfer edilmesi gereken zaman diliminin başlangıç tarihi.
   */
  readonly startDate: string;

  /**
   * The ending date of the time period for which policies should be transferred.
   *
   * Poliçelerin transfer edilmesi gereken zaman diliminin bitiş tarihi.
   */
  readonly endDate: string;
}

/**
 * Request to trigger the execution of a policy transfer operation.
 * Used to manually initiate the processing of a previously created policy transfer.
 *
 * Bir poliçe transfer işleminin yürütülmesini tetikleme isteği.
 * Önceden oluşturulmuş bir poliçe transferinin işlenmesini manuel olarak başlatmak için kullanılır.
 */
export interface TriggerPolicyTransferRequest {
  /**
   * The unique identifier of the policy transfer operation that should be triggered for execution.
   *
   * Yürütme için tetiklenmesi gereken poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly policyTransferId: string;
}

// ============================================================================
// FILE POLICY TRANSFER CONTRACTS
// ============================================================================

/**
 * Request to initiate a bulk policy transfer operation from a file provided by an insurance company.
 *
 * Sigorta şirketi tarafından sağlanan dosyadan toplu poliçe transfer işlemi başlatma talebi.
 */
export interface CreateFilePolicyTransferRequest {
  /**
   * Unique identifier of the insurance company from which policies are being transferred.
   *
   * Poliçelerin transfer edildiği sigorta şirketinin benzersiz tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;
}

/**
 * Request to retrieve detailed information about a completed or ongoing file policy transfer operation.
 *
 * Tamamlanmış veya devam eden dosya poliçe transfer işlemi hakkında detaylı bilgi alma talebi.
 */
export interface GetFilePolicyTransferDetailRequest {
  /**
   * Unique identifier of the file policy transfer operation for which detailed information is being requested.
   *
   * Detaylı bilgileri talep edilen dosya poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly filePolicyTransferId: string;
}

/**
 * Detailed response containing comprehensive information about a file policy transfer operation,
 * including individual policy processing results.
 *
 * Bireysel poliçe işleme sonuçları dahil dosya poliçe transfer işlemi hakkında kapsamlı bilgiler içeren detaylı yanıt.
 */
export interface GetFilePolicyTransferDetailResult {
  /**
   * Unique identifier of the file policy transfer operation.
   *
   * Dosya poliçe transfer işleminin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * Reference to the system user who initiated the file policy transfer operation.
   *
   * Dosya poliçe transfer işlemini başlatan sistem kullanıcısının referansı.
   */
  readonly createdBy: UserReference;

  /**
   * Date and time when the file policy transfer operation was initiated.
   *
   * Dosya poliçe transfer işleminin başlatıldığı tarih ve saat.
   */
  readonly createdAt: string;

  /**
   * Identifier of the insurance company from which policies are being transferred.
   *
   * Poliçelerin transfer edildiği sigorta şirketinin tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * Name of the data file that contained the policy information for import.
   *
   * İçe aktarma için poliçe bilgilerini içeren veri dosyasının adı.
   */
  readonly fileName: string;

  /**
   * Total number of policies that were successfully processed and imported into the InsurUp system.
   *
   * InsurUp sistemine başarıyla işlenen ve aktarılan toplam poliçe sayısı.
   */
  readonly succeededPolicyCount: number;

  /**
   * Total number of policies that failed to be imported due to data validation errors or processing issues.
   *
   * Veri doğrulama hataları veya işleme sorunları nedeniyle içe aktarılamayan toplam poliçe sayısı.
   */
  readonly failedPolicyCount: number;

  /**
   * Total number of policies that were intentionally skipped during the transfer process.
   *
   * Transfer süreci sırasında kasıtlı olarak atlanan toplam poliçe sayısı.
   */
  readonly skippedPolicyCount: number;

  /**
   * Detailed collection of transfer results for each individual policy in the import batch.
   *
   * İçe aktarma grubundaki her bir poliçe için detaylı transfer sonuçları koleksiyonu.
   */
  readonly transferredPolicies: readonly TransferredPolicy[];
}

/**
 * Detailed transfer result for an individual policy within a bulk transfer operation.
 *
 * Toplu transfer işlemi içinde bireysel bir poliçe için detaylı transfer sonucu.
 */
export interface TransferredPolicy {
  /**
   * Current status of the individual policy transfer operation.
   *
   * Bireysel poliçe transfer işleminin mevcut durumu.
   */
  readonly status: TransferredPolicyStatus;

  /**
   * Specific reason why the policy was intentionally skipped during the transfer process.
   *
   * Transfer süreci sırasında poliçenin kasıtlı olarak atlanmasının belirli nedeni.
   */
  readonly skipReason: TransferredPolicySkipReason | null;

  /**
   * Specific technical or business reason why the policy failed to be imported successfully.
   *
   * Poliçenin başarıyla içe aktarılamamasının belirli teknik veya iş nedeni.
   */
  readonly failureReason: TransferredPolicyFailureReason | null;

  /**
   * Insurance product branch of the policy being transferred.
   *
   * Transfer edilen poliçenin sigorta ürün dalı.
   */
  readonly productBranch: ProductBranch | null;

  /**
   * Identifier of the external insurance company from which this specific policy originated.
   *
   * Bu belirli poliçenin kaynaklandığı dış sigorta şirketinin tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * Sequential endorsement number indicating policy modifications or addendums.
   *
   * Poliçe değişikliklerini veya eklerini gösteren sıralı zeyilname numarası.
   */
  readonly endorsementNumber: number;

  /**
   * Sequential renewal number indicating how many times the policy has been renewed.
   *
   * Poliçenin kaç kez yenilendiğini gösteren sıralı yenileme numarası.
   */
  readonly renewalNumber: number;

  /**
   * Display name of the external insurance company from which the policy was transferred.
   *
   * Poliçenin transfer edildiği dış sigorta şirketinin görüntüleme adı.
   */
  readonly insuranceCompanyName: string;

  /**
   * URL or path to the logo image of the source insurance company.
   *
   * Kaynak sigorta şirketinin logo görselinin URL'si veya yolu.
   */
  readonly insuranceCompanyLogo: string | null;

  /**
   * The original policy number assigned by the source insurance company.
   *
   * Kaynak sigorta şirketi tarafından atanan orijinal poliçe numarası.
   */
  readonly insuranceCompanyPolicyNumber: string;

  /**
   * Identifier of the InsurUp product that corresponds to the original policy's insurance type.
   *
   * Orijinal poliçenin sigorta türüne karşılık gelen InsurUp ürününün tanımlayıcısı.
   */
  readonly productId: number | null;

  /**
   * Display name of the InsurUp product that was mapped to the original policy.
   *
   * Orijinal poliçeye eşlenen InsurUp ürününün görüntüleme adı.
   */
  readonly productName: string | null;

  /**
   * Unique identifier of the policy record created in the InsurUp system after successful transfer.
   *
   * Başarılı transfer sonrası InsurUp sisteminde oluşturulan poliçe kaydının benzersiz tanımlayıcısı.
   */
  readonly transferredPolicyId: string | null;
}
