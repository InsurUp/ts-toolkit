/**
 * @fileoverview Common Policy Types - Policy transfer and policy-related types
 * @description Policy transfer enums and types used throughout the InsurUp platform
 */

// ============================================================================
// POLICY TRANSFER ENUMS
// ============================================================================

/**
 * Policy Transfer Trigger Status / Poliçe Transfer Tetikleme Durumu
 *
 * Represents the execution status of a policy transfer trigger operation.
 * This tracks the lifecycle of an automated policy transfer job from initiation
 * to completion. The status indicates whether the transfer process has started,
 * completed successfully, or failed during execution.
 *
 * Poliçe transfer tetikleme işleminin yürütme durumunu temsil eder.
 * Bu, otomatik poliçe transfer işinin başlatılmasından tamamlanmasına kadar olan
 * yaşam döngüsünü takip eder. Durum, transfer sürecinin başlatılıp başlatılmadığını,
 * başarıyla tamamlanıp tamamlanmadığını veya yürütme sırasında başarısız olup olmadığını gösterir.
 */
export enum PolicyTransferTriggerStatus {
  /**
   * The policy transfer process completed successfully without errors.
   * All policies within the specified date range were processed, and the transfer
   * operation finished without any critical failures. Individual policy transfers
   * may still have been skipped or failed, but the overall process completed.
   *
   * Poliçe transfer süreci hatasız olarak başarıyla tamamlandı.
   * Belirtilen tarih aralığındaki tüm poliçeler işlendi ve transfer işlemi
   * kritik herhangi bir başarısızlık olmadan bitti. Bireysel poliçe transferleri
   * yine de atlanmış veya başarısız olmuş olabilir, ancak genel süreç tamamlandı.
   */
  Succeeded = 'SUCCEEDED',

  /**
   * The policy transfer process failed due to an error or exception.
   * This indicates that the transfer job encountered a critical error that prevented
   * it from completing successfully. This could be due to system connectivity issues,
   * authentication failures, or other technical problems that halted the process.
   *
   * Poliçe transfer süreci bir hata veya istisna nedeniyle başarısız oldu.
   * Bu, transfer işinin başarıyla tamamlanmasını engelleyen kritik bir hatayla
   * karşılaştığını gösterir. Bu, sistem bağlantı sorunları, kimlik doğrulama başarısızlıkları
   * veya süreci durduran diğer teknik sorunlar nedeniyle olabilir.
   */
  Failed = 'TRIGGER_STATUS_FAILED',
}

/**
 * Policy Transfer Company Failure Reason / Poliçe Transfer Şirket Başarısızlık Nedeni
 *
 * Represents specific reasons why policy transfer from an insurance company failed during
 * the automated policy transfer process. This is used when attempting to retrieve and transfer
 * policies from one insurance company system to another. Company-level failures occur when
 * the source insurance company's system cannot provide the requested policy data.
 *
 * Otomatik poliçe transfer süreci sırasında sigorta şirketinden poliçe transferinin neden
 * başarısız olduğunu belirten özel nedenleri temsil eder. Bu, bir sigorta şirket sisteminden
 * diğerine poliçeleri almaya ve transfer etmeye çalışırken kullanılır. Şirket seviyesindeki
 * başarısızlıklar, kaynak sigorta şirketinin sistemi talep edilen poliçe verilerini sağlayamadığında oluşur.
 */
export enum PolicyTransferCompanyFailureReason {
  /**
   * An unknown or unspecified failure occurred during the policy transfer process from the company.
   * This is used as a fallback when the specific cause of failure cannot be determined or categorized.
   * It may indicate system errors, unexpected responses, or technical issues that don't fit
   * other specific failure categories.
   *
   * Şirketten poliçe transfer süreci sırasında bilinmeyen veya belirtilmemiş bir hata oluştu.
   * Bu, başarısızlığın özel nedeninin belirlenemediği veya kategorilendirilmediği durumlarda
   * yedek olarak kullanılır. Sistem hataları, beklenmeyen yanıtlar veya diğer özel
   * başarısızlık kategorilerine uymayan teknik sorunları gösterebilir.
   */
  Unknown = 'UNKNOWN',

  /**
   * Failed to retrieve policies from the insurance company's system during the transfer process.
   * This occurs when the source company's API or data systems are unavailable, returning errors,
   * or the requested policy data cannot be accessed. This could be due to system downtime,
   * authentication issues, or data access restrictions.
   *
   * Transfer süreci sırasında sigorta şirketinin sisteminden poliçeler alınamadı.
   * Bu durum, kaynak şirketin API'si veya veri sistemleri kullanılamadığında, hata döndürdüğünde
   * veya talep edilen poliçe verilerine erişilemediğinde oluşur. Sistem kesintisi,
   * kimlik doğrulama sorunları veya veri erişim kısıtlamaları nedeniyle olabilir.
   */
  CouldNotFetchPolicies = 'COULD_NOT_FETCH_POLICIES',
}

/**
 * Transferred Policy Status / Transfer Edilen Poliçe Durumu
 *
 * Represents the final status of an individual policy transfer operation.
 * This indicates whether a specific policy was successfully transferred, failed
 * during processing, or was intentionally skipped due to business rules or
 * data constraints. The status helps in reporting and auditing transfer results.
 *
 * Bireysel poliçe transfer işleminin nihai durumunu temsil eder.
 * Bu, belirli bir poliçenin başarıyla transfer edilip edilmediğini, işleme sırasında
 * başarısız olup olmadığını veya iş kuralları ya da veri kısıtlamaları nedeniyle
 * kasıtlı olarak atlanıp atlanmadığını gösterir. Durum, transfer sonuçlarının
 * raporlanması ve denetlenmesinde yardımcı olur.
 */
export enum TransferredPolicyStatus {
  /**
   * The policy was successfully transferred to the target system.
   * This indicates that all policy data, including customer information,
   * coverage details, and related records, were validated and imported
   * without errors. The policy is now available in the destination system.
   *
   * Poliçe hedef sisteme başarıyla transfer edildi.
   * Bu, müşteri bilgileri, teminat detayları ve ilgili kayıtlar da dahil olmak üzere
   * tüm poliçe verilerinin doğrulandığını ve hatasız olarak içe aktarıldığını gösterir.
   * Poliçe artık hedef sistemde kullanılabilir durumda.
   */
  Success = 'SUCCESS',

  /**
   * The policy transfer failed due to validation errors or processing issues.
   * This occurs when the policy data doesn't meet validation requirements,
   * has missing or invalid information, or encounters system errors during
   * processing. The specific failure reason is typically recorded separately.
   *
   * Poliçe transfer doğrulama hataları veya işleme sorunları nedeniyle başarısız oldu.
   * Bu durum, poliçe verilerinin doğrulama gereksinimlerini karşılamaması,
   * eksik veya geçersiz bilgilere sahip olması veya işleme sırasında sistem
   * hatalarıyla karşılaşması durumunda oluşur. Özel başarısızlık nedeni genellikle ayrı olarak kaydedilir.
   */
  Failed = 'TRANSFER_FAILED',

  /**
   * The policy was intentionally skipped during transfer due to business rules.
   * Unlike failed policies, skipped policies are bypassed for logical reasons
   * such as duplicate prevention, unsupported product types, or dependency
   * requirements. The specific skip reason is typically recorded separately.
   *
   * Poliçe iş kuralları nedeniyle transfer sırasında kasıtlı olarak atlandı.
   * Başarısız poliçelerin aksine, atlanan poliçeler yineleme önleme, desteklenmeyen
   * ürün türleri veya bağımlılık gereksinimleri gibi mantıksal nedenlerle atlanır.
   * Özel atlama nedeni genellikle ayrı olarak kaydedilir.
   */
  Skipped = 'TRANSFER_SKIPPED',
}

/**
 * Transferred Policy Skip Reason / Transfer Edilen Poliçe Atlama Nedeni
 *
 * Represents reasons why a policy was skipped during the automated transfer process.
 * Unlike failures, skipped policies are intentionally bypassed due to business rules,
 * data constraints, or logical conditions that prevent processing. Skipped policies
 * help maintain data integrity and avoid duplicate or invalid transfers.
 *
 * Otomatik transfer süreci sırasında poliçenin neden atlandığını belirten nedenleri temsil eder.
 * Başarısızlıklardan farklı olarak, atlanan poliçeler iş kuralları, veri kısıtlamaları
 * veya işlemeyi engelleyen mantıksal koşullar nedeniyle kasıtlı olarak atlanır. Atlanan poliçeler
 * veri bütünlüğünü korumaya ve yinelenen veya geçersiz transferleri önlemeye yardımcı olur.
 */
export enum TransferredPolicySkipReason {
  /**
   * Unknown or unspecified reason for skipping the policy transfer.
   * This is used when the specific reason for skipping cannot be determined
   * or categorized into other skip reasons. It serves as a fallback value
   * for edge cases or unexpected conditions.
   *
   * Poliçe transferinin atlanması için bilinmeyen veya belirtilmemiş neden.
   * Bu, atlamanın özel nedeninin belirlenemediği veya diğer atlama nedenlerine
   * kategorilendirilemediği durumlarda kullanılır. Sınır durumları veya
   * beklenmeyen koşullar için yedek değer olarak hizmet eder.
   */
  Unknown = 'UNKNOWN',

  /**
   * The policy has already been transferred previously and exists in the target system.
   * This prevents duplicate policy imports and maintains data integrity. The system
   * checks for existing policies using unique identifiers such as policy number,
   * renewal number, and insurance company information.
   *
   * Poliçe daha önce transfer edilmiş ve hedef sistemde mevcut.
   * Bu, yinelenen poliçe içe aktarımlarını önler ve veri bütünlüğünü korur. Sistem,
   * poliçe numarası, yenileme numarası ve sigorta şirket bilgileri gibi benzersiz
   * tanımlayıcıları kullanarak mevcut poliçeleri kontrol eder.
   */
  AlreadyTransferred = 'SKIP_ALREADY_TRANSFERRED',

  /**
   * The previous version of the policy could not be found in the target system.
   * This occurs when transferring policy renewals or endorsements that depend on
   * a base policy version. Without the foundation policy, the renewal or endorsement
   * cannot be properly linked and is skipped to maintain referential integrity.
   *
   * Poliçenin önceki versiyonu hedef sistemde bulunamadı.
   * Bu durum, temel poliçe versiyonuna bağlı olan poliçe yenilemeleri veya zeylleri
   * transfer edilirken oluşur. Temel poliçe olmadan, yenileme veya zeyil düzgün şekilde
   * bağlanamaz ve referans bütünlüğünü korumak için atlanır.
   */
  PreviousVersionNotFound = 'PREVIOUS_VERSION_NOT_FOUND',

  /**
   * The product branch is not supported by the target system.
   * This occurs when the source system contains insurance product types
   * (such as life, health, property, or motor insurance branches) that are not
   * configured or supported in the destination system. These policies are
   * skipped to avoid import errors.
   *
   * Ürün dalı hedef sistem tarafından desteklenmiyor.
   * Bu durum, kaynak sistemin hedef sistemde yapılandırılmamış veya desteklenmeyen
   * sigorta ürün türleri (hayat, sağlık, konut veya motorlu araç sigortası dalları gibi)
   * içermesi durumunda oluşur. Bu poliçeler içe aktarma hatalarını önlemek için atlanır.
   */
  ProductBranchNotSupported = 'PRODUCT_BRANCH_NOT_SUPPORTED',

  /**
   * The specific product is not supported by the target system.
   * This occurs when the exact insurance product variant or configuration
   * from the source system doesn't have a corresponding mapping in the
   * destination system. Even if the general product branch is supported,
   * specific product configurations may not be transferable.
   *
   * Özel ürün hedef sistem tarafından desteklenmiyor.
   * Bu durum, kaynak sistemdeki tam sigorta ürün varyantı veya yapılandırmasının
   * hedef sistemde karşılık gelen eşlemesi bulunmadığında oluşur. Genel ürün dalı
   * desteklense bile, özel ürün yapılandırmaları transfer edilemeyebilir.
   */
  ProductNotSupported = 'PRODUCT_NOT_SUPPORTED',
}

/**
 * Transferred Policy Failure Reason / Transfer Edilen Poliçe Başarısızlık Nedeni
 *
 * Represents specific reasons why an individual policy transfer failed during the automated
 * transfer process. This provides detailed categorization of policy-level failures that occur
 * when transferring individual policies from one system to another. Each reason helps identify
 * the specific data validation or processing issue that prevented successful policy import.
 *
 * Otomatik transfer süreci sırasında bireysel poliçe transferinin neden başarısız olduğunu
 * belirten özel nedenleri temsil eder. Bu, bir sistemden diğerine bireysel poliçe transferi
 * sırasında oluşan poliçe seviyesindeki başarısızlıkların ayrıntılı kategorizasyonunu sağlar.
 * Her neden, başarılı poliçe içe aktarımını engelleyen özel veri doğrulama veya işleme sorununu
 * belirlemeye yardımcı olur.
 */
export enum TransferredPolicyFailureReason {
  /**
   * An unknown or unspecified failure occurred during the individual policy transfer.
   * This is used when the specific cause of failure cannot be determined or categorized
   * into other failure reasons. It may indicate unexpected errors or edge cases
   * not covered by other specific failure categories.
   *
   * Bireysel poliçe transfer sırasında bilinmeyen veya belirtilmemiş bir hata oluştu.
   * Bu, başarısızlığın özel nedeninin belirlenemediği veya diğer başarısızlık nedenlerine
   * kategorilendirilemediği durumlarda kullanılır. Beklenmeyen hataları veya diğer özel
   * başarısızlık kategorileri kapsamında olmayan sınır durumları gösterebilir.
   */
  Unknown = 'UNKNOWN',

  /**
   * The customer's identity number (T.C. Kimlik No) is invalid or incorrectly formatted.
   * This occurs when the Turkish citizenship number doesn't pass validation checks,
   * has incorrect length, contains invalid characters, or fails checksum validation.
   * Valid Turkish identity numbers must be 11 digits and pass specific algorithm checks.
   *
   * Müşterinin kimlik numarası (T.C. Kimlik No) geçersiz veya yanlış formatlı.
   * Bu durum, Türk vatandaşlık numarası doğrulama kontrollerini geçmediğinde,
   * yanlış uzunluğa sahip olduğunda, geçersiz karakterler içerdiğinde veya
   * kontrol toplamı doğrulamasını geçemediğinde oluşur. Geçerli Türk kimlik numaraları
   * 11 haneli olmalı ve belirli algoritma kontrollerini geçmelidir.
   */
  InvalidCustomerIdentityNumber = 'INVALID_CUSTOMER_IDENTITY_NUMBER',

  /**
   * The customer's company title is invalid or missing for corporate customers.
   * This occurs when transferring policies for business entities and the company name
   * is empty, too short, contains invalid characters, or doesn't meet minimum
   * requirements for corporate entity identification.
   *
   * Kurumsal müşteriler için müşterinin şirket unvanı geçersiz veya eksik.
   * Bu durum, işletme kuruluşları için poliçe transferi yapılırken şirket adının
   * boş olması, çok kısa olması, geçersiz karakterler içermesi veya kurumsal
   * kuruluş tanımlaması için minimum gereksinimleri karşılamaması durumunda oluşur.
   */
  InvalidCustomerCompanyTitle = 'INVALID_CUSTOMER_COMPANY_TITLE',

  /**
   * The customer's tax number is invalid or incorrectly formatted for corporate customers.
   * This occurs when the tax identification number doesn't meet the required format,
   * length, or validation rules for Turkish tax numbers. Valid tax numbers must be
   * 10 digits for companies or 11 digits for individual taxpayers.
   *
   * Kurumsal müşteriler için müşterinin vergi numarası geçersiz veya yanlış formatlı.
   * Bu durum, vergi kimlik numarasının Türk vergi numaraları için gerekli format,
   * uzunluk veya doğrulama kurallarını karşılamaması durumunda oluşur. Geçerli vergi numaraları
   * şirketler için 10 haneli veya bireysel mükellefler için 11 haneli olmalıdır.
   */
  InvalidCustomerTaxNumber = 'INVALID_CUSTOMER_TAX_NUMBER',

  /**
   * The customer type is invalid or not supported by the target system.
   * This occurs when the customer classification (individual, corporate, etc.)
   * is not recognized or supported in the destination system, or when the
   * customer type field contains invalid values.
   *
   * Müşteri türü geçersiz veya hedef sistem tarafından desteklenmiyor.
   * Bu durum, müşteri sınıflandırmasının (bireysel, kurumsal, vb.) hedef sistemde
   * tanınmaması veya desteklenmemesi ya da müşteri türü alanının geçersiz
   * değerler içermesi durumunda oluşur.
   */
  InvalidCustomerType = 'INVALID_CUSTOMER_TYPE',

  /**
   * The vehicle information is invalid or incomplete for motor insurance policies.
   * This can occur when vehicle identification data (chassis number, license plate,
   * engine number, model information) is missing, incorrectly formatted, or doesn't
   * match validation requirements for Turkish vehicle registration standards.
   *
   * Motorlu araç sigortası poliçeleri için araç bilgileri geçersiz veya eksik.
   * Bu durum, araç tanımlama verilerinin (şasi numarası, plaka, motor numarası,
   * model bilgileri) eksik olması, yanlış formatlanması veya Türk araç tescil
   * standartları için doğrulama gereksinimlerini karşılamaması durumunda oluşabilir.
   */
  InvalidVehicle = 'INVALID_VEHICLE',

  /**
   * The property information is invalid or incomplete for property insurance policies.
   * This occurs when property details such as address, construction type, area,
   * or value information is missing, incorrectly formatted, or doesn't meet
   * validation requirements for property insurance coverage.
   *
   * Konut sigortası poliçeleri için konut bilgileri geçersiz veya eksik.
   * Bu durum, adres, yapı türü, alan veya değer bilgileri gibi konut detaylarının
   * eksik olması, yanlış formatlanması veya konut sigortası teminatı için
   * doğrulama gereksinimlerini karşılamaması durumunda oluşur.
   */
  InvalidProperty = 'INVALID_PROPERTY',

  /**
   * The policy end date is invalid or in the wrong format.
   * This occurs when the policy expiration date is missing, not a valid date,
   * in an incorrect format, or doesn't make logical sense (e.g., end date
   * before start date). All policy dates must be valid and properly formatted.
   *
   * Poliçe bitiş tarihi geçersiz veya yanlış formatta.
   * Bu durum, poliçe son kullanma tarihinin eksik olması, geçerli bir tarih olmaması,
   * yanlış formatta olması veya mantıksal olarak anlam ifade etmemesi
   * (örneğin, bitiş tarihinin başlangıç tarihinden önce olması) durumunda oluşur.
   * Tüm poliçe tarihleri geçerli ve düzgün formatlanmış olmalıdır.
   */
  InvalidEndDate = 'INVALID_END_DATE',

  /**
   * The policy start date is invalid or in the wrong format.
   * This occurs when the policy effective date is missing, not a valid date,
   * in an incorrect format, or doesn't make logical sense within the policy
   * context. Policy start dates must be valid and properly formatted dates.
   *
   * Poliçe başlangıç tarihi geçersiz veya yanlış formatta.
   * Bu durum, poliçe yürürlük tarihinin eksik olması, geçerli bir tarih olmaması,
   * yanlış formatta olması veya poliçe bağlamında mantıksal olarak anlam ifade
   * etmemesi durumunda oluşur. Poliçe başlangıç tarihleri geçerli ve düzgün
   * formatlanmış tarihler olmalıdır.
   */
  InvalidStartDate = 'INVALID_START_DATE',

  /**
   * The proposal number is invalid or incorrectly formatted.
   * This occurs when the insurance proposal identifier doesn't meet the required
   * format, length, or validation rules. Proposal numbers must follow specific
   * formats defined by the insurance company or regulatory requirements.
   *
   * Teklif numarası geçersiz veya yanlış formatlı.
   * Bu durum, sigorta teklifi tanımlayıcısının gerekli format, uzunluk veya
   * doğrulama kurallarını karşılamaması durumunda oluşur. Teklif numaraları,
   * sigorta şirketi veya düzenleyici gereksinimler tarafından tanımlanan
   * belirli formatları takip etmelidir.
   */
  InvalidProposalNumber = 'INVALID_PROPOSAL_NUMBER',

  /**
   * The premium amount is invalid or incorrectly formatted.
   * This occurs when the insurance premium value is negative, zero when it shouldn't be,
   * in an incorrect format, or doesn't meet validation rules for premium calculations.
   * Premium amounts must be valid positive monetary values.
   *
   * Prim tutarı geçersiz veya yanlış formatlı.
   * Bu durum, sigorta prim değerinin negatif olması, olmaması gereken durumlarda
   * sıfır olması, yanlış formatta olması veya prim hesaplamaları için doğrulama
   * kurallarını karşılamaması durumunda oluşur. Prim tutarları geçerli pozitif
   * parasal değerler olmalıdır.
   */
  InvalidPremium = 'INVALID_PREMIUM',

  /**
   * The commission amount is invalid or incorrectly formatted.
   * This occurs when the agent commission value is negative when it shouldn't be,
   * exceeds the premium amount, or doesn't meet validation rules for commission
   * calculations. Commission amounts must be valid monetary values within acceptable ranges.
   *
   * Komisyon tutarı geçersiz veya yanlış formatlı.
   * Bu durum, acente komisyon değerinin olmaması gereken durumlarda negatif olması,
   * prim tutarını aşması veya komisyon hesaplamaları için doğrulama kurallarını
   * karşılamaması durumunda oluşur. Komisyon tutarları kabul edilebilir aralıklarda
   * geçerli parasal değerler olmalıdır.
   */
  InvalidCommission = 'INVALID_COMMISSION',

  /**
   * The payment type is invalid or not supported by the target system.
   * This occurs when the payment method (cash, credit card, bank transfer, etc.)
   * is not recognized, supported, or properly formatted in the destination system.
   * All payment types must be valid and supported payment methods.
   *
   * Ödeme türü geçersiz veya hedef sistem tarafından desteklenmiyor.
   * Bu durum, ödeme yönteminin (nakit, kredi kartı, banka havalesi, vb.)
   * hedef sistemde tanınmaması, desteklenmemesi veya düzgün formatlanmaması
   * durumunda oluşur. Tüm ödeme türleri geçerli ve desteklenen ödeme yöntemleri olmalıdır.
   */
  InvalidPaymentType = 'INVALID_PAYMENT_TYPE',

  /**
   * The insured customer information is invalid or incomplete.
   * This occurs when the person or entity that benefits from the insurance coverage
   * has missing, incorrectly formatted, or invalid personal information such as
   * name, contact details, or identification data.
   *
   * Sigortalı müşteri bilgileri geçersiz veya eksik.
   * Bu durum, sigorta teminatından yararlanan kişi veya kuruluşun ad, iletişim
   * bilgileri veya kimlik verileri gibi kişisel bilgilerinin eksik, yanlış
   * formatlanmış veya geçersiz olması durumunda oluşur.
   */
  InvalidInsuredCustomer = 'INVALID_INSURED_CUSTOMER',

  /**
   * The insurer customer information is invalid or incomplete.
   * This occurs when the person or entity that purchases and pays for the insurance
   * policy (policyholder) has missing, incorrectly formatted, or invalid personal
   * information such as name, contact details, or identification data.
   *
   * Sigorta ettiren müşteri bilgileri geçersiz veya eksik.
   * Bu durum, sigorta poliçesini satın alan ve ödeyen kişi veya kuruluşun (poliçe sahibi)
   * ad, iletişim bilgileri veya kimlik verileri gibi kişisel bilgilerinin eksik,
   * yanlış formatlanmış veya geçersiz olması durumunda oluşur.
   */
  InvalidInsurerCustomer = 'INVALID_INSURER_CUSTOMER',
}
