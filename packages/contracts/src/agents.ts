import type { ProductBranch, Channel } from "./common.js";
import type {
  CaseType,
  SaleOpportunityCaseSubType,
  CancelCaseSubType,
  EndorsementCaseSubType,
  ComplaintCaseSubType,
} from "./cases.js";

/**
 * Represents the robotic process automation (RPA) deployment modes available for agents.
 * Defines how and where automated processes and software robots operate within the agent's infrastructure.
 *
 * Acenteler için mevcut robotik süreç otomasyonu (RPA) dağıtım modlarını temsil eder.
 * Otomatik süreçlerin ve yazılım robotlarının acente altyapısı içinde nasıl ve nerede çalıştığını tanımlar.
 */
export enum RobotMode {
  /**
   * No robotic process automation is enabled.
   * All processes are handled manually by human operators.
   *
   * Robotik süreç otomasyonu etkin değil.
   * Tüm süreçler insan operatörler tarafından manuel olarak yürütülür.
   */
  None = "NONE",

  /**
   * Robotic automation runs on desktop computers within the agent's local environment.
   * Robots operate on individual workstations with direct user interaction capabilities.
   *
   * Robotik otomasyon acente yerel ortamında masaüstü bilgisayarlarda çalışır.
   * Robotlar doğrudan kullanıcı etkileşim yetenekleri ile bireysel iş istasyonlarında çalışır.
   */
  Desktop = "DESKTOP",

  /**
   * Robotic automation runs on centralized servers with 24/7 unattended operation.
   * Robots operate independently without direct human intervention in a server environment.
   *
   * Robotik otomasyon 7/24 gözetimsiz çalışma ile merkezi sunucularda çalışır.
   * Robotlar sunucu ortamında doğrudan insan müdahalesi olmadan bağımsız olarak çalışır.
   */
  Server = "SERVER",
}

/**
 * Represents the different modes available for automatically assigning cases to representatives.
 * Defines how new cases are distributed among available representatives within an agent's organization.
 *
 * Temsilcilere case'lerin otomatik olarak atanması için mevcut farklı modları temsil eder.
 * Yeni case'lerin acente organizasyonu içindeki mevcut temsilciler arasında nasıl dağıtıldığını tanımlar.
 */
export enum CaseRepresentativeAssignmentMode {
  /**
   * No automatic assignment is performed.
   * Cases remain unassigned and must be manually assigned by administrators.
   *
   * Hiçbir otomatik atama yapılmaz.
   * Case'ler atanmamış kalır ve yöneticiler tarafından manuel olarak atanmalıdır.
   */
  None = "NONE",

  /**
   * Cases are randomly distributed among eligible representatives.
   * Each new case is assigned to a randomly selected representative who meets the criteria.
   *
   * Case'ler uygun temsilciler arasında rastgele dağıtılır.
   * Her yeni case, kriterleri karşılayan rastgele seçilmiş bir temsilciye atanır.
   */
  Random = "RANDOM",

  /**
   * Cases are distributed equally among representatives using round-robin algorithm.
   * Representatives take turns receiving cases to ensure balanced workload distribution.
   *
   * Case'ler round-robin algoritması kullanılarak temsilciler arasında eşit olarak dağıtılır.
   * Temsilciler dengeli iş yükü dağılımını sağlamak için sırayla case alırlar.
   */
  RoundRobin = "ROUND_ROBIN",

  /**
   * Cases are distributed based on insurance branch importance weights.
   * Representatives receive cases based on their current workload calculated by importance scores of assigned cases.
   *
   * Case'ler sigorta branşı önem ağırlıklarına göre dağıtılır.
   * Temsilciler, atanmış case'lerin önem puanlarıyla hesaplanan mevcut iş yüklerine göre case alırlar.
   */
  BranchImportanceBalance = "BRANCH_IMPORTANCE_BALANCE",
}

/**
 * Represents the synchronization status between agent systems and insurance company platforms.
 * Tracks the current state of data synchronization for agent appointments, products, and configurations.
 *
 * Acente sistemleri ile sigorta şirketi platformları arasındaki senkronizasyon durumunu temsil eder.
 * Acente randevuları, ürünler ve konfigürasyonlar için veri senkronizasyonunun mevcut durumunu takip eder.
 */
export enum InsuranceSyncState {
  /**
   * Synchronization is currently in progress or queued for processing.
   * The system is attempting to sync data with the insurance company.
   *
   * Senkronizasyon şu anda devam ediyor veya işlem için sıraya alındı.
   * Sistem sigorta şirketi ile veri senkronizasyonu yapmaya çalışıyor.
   */
  Pending = "PENDING",

  /**
   * Synchronization with the insurance company has failed.
   * Manual intervention or retry may be required to resolve the issue.
   *
   * Sigorta şirketi ile senkronizasyon başarısız oldu.
   * Sorunu çözmek için manuel müdahale veya yeniden deneme gerekebilir.
   */
  Failed = "FAILED",

  /**
   * Synchronization with the insurance company has completed successfully.
   * All data is up-to-date and systems are fully operational.
   *
   * Sigorta şirketi ile senkronizasyon başarıyla tamamlandı.
   * Tüm veriler güncel ve sistemler tamamen operasyonel.
   */
  Succeed = "SUCCEED",
}

/**
 * Represents the integration method types used by agents to connect with insurance companies.
 * Defines how agents interface with insurance company systems for quotes, policies, and data exchange.
 *
 * Acentelerin sigorta şirketleri ile bağlantı kurmak için kullandığı entegrasyon yöntem türlerini temsil eder.
 * Acentelerin teklif, poliçe ve veri alışverişi için sigorta şirketi sistemleri ile nasıl arayüz kuracağını tanımlar.
 */
export enum AgentInsuranceCompanyType {
  /**
   * Integration through web service APIs and online portals.
   * Enables real-time data exchange through standard web protocols.
   *
   * Web servis API'leri ve çevrimiçi portallar aracılığıyla entegrasyon.
   * Standart web protokolleri aracılığıyla gerçek zamanlı veri alışverişi sağlar.
   */
  WebService = "WEB_SERVICE",

  /**
   * Integration through robotic process automation (RPA) and automated form filling.
   * Uses software robots to interact with insurance company systems automatically.
   *
   * Robotik süreç otomasyonu (RPA) ve otomatik form doldurma yoluyla entegrasyon.
   * Sigorta şirketi sistemleri ile otomatik etkileşim için yazılım robotları kullanır.
   */
  Robot = "ROBOT",
}

/**
 * SMS implementation types available for agent integrations.
 *
 * Acente entegrasyonları için mevcut SMS uygulama türleri.
 */
export enum SmsImplementation {
  Default = "Default",
  Teknomart = "Teknomart",
  ArtiKurumsal = "ArtiKurumsal",
  Verimor = "Verimor",
}

/**
 * Call center implementation types available for agent integrations.
 *
 * Acente entegrasyonları için mevcut çağrı merkezi uygulama türleri.
 */
export enum CallCenterImplementation {
  None = "None",
  AloTech = "AloTech",
}

/**
 * Agent user state enumeration.
 * Tracks the activation state of an agent user account.
 *
 * Acente kullanıcısı durum enum'u.
 * Acente kullanıcı hesabının aktivasyon durumunu takip eder.
 */
export enum AgentUserState {
  /** User account is pending activation / Kullanıcı hesabı aktivasyon bekliyor */
  Pending = "PENDING",
  /** User account is active and operational / Kullanıcı hesabı aktif ve çalışır durumda */
  Active = "ACTIVE",
  /** User account is inactive or disabled / Kullanıcı hesabı inaktif veya devre dışı */
  Inactive = "INACTIVE",
}

/**
 * Base class for SMS service integration options.
 *
 * SMS hizmet entegrasyon seçenekleri için temel sınıf.
 */
/**
 * Union type for all SMS agent options
 * Tüm SMS acente seçenekleri için birleşim türü
 */
export type SmsAgentOptions =
  | {
      readonly implementation: SmsImplementation.Default;
    }
  | {
      readonly implementation: SmsImplementation.Teknomart;
      readonly sender: string;
      readonly username: string;
      readonly password: string;
    }
  | {
      readonly implementation: SmsImplementation.ArtiKurumsal;
      readonly companyCode: string;
      readonly username: string;
      readonly password: string;
      readonly originator: string;
    }
  | {
      readonly implementation: SmsImplementation.Verimor;
      readonly username: string;
      readonly password: string;
      readonly sourceAddr: string;
    };

/**
 * Union type for all call center agent options
 * Tüm çağrı merkezi acente seçenekleri için birleşim türü
 */
export type CallCenterAgentOptions =
  | ({
      readonly implementation: CallCenterImplementation.None;
    } & CallCenterAgentOptionsBase)
  | ({
      readonly implementation: CallCenterImplementation.AloTech;
      readonly clientSecret: string;
      readonly clientId: string;
      readonly campaignKeyMappings: CampaignKeyMapping[];
      readonly listName: string;
    } & CallCenterAgentOptionsBase);

type CallCenterAgentOptionsBase = {
  readonly tenant: string;
};

/**
 * Campaign key mapping for AloTech call center integration.
 *
 * AloTech çağrı merkezi entegrasyonu için kampanya anahtar eşleme.
 */
export interface CampaignKeyMapping {
  readonly campaignKey: string;
  readonly productBranch: ProductBranch | null;
  readonly caseType: CaseType | null;
}

/**
 * Represents phone number information with country code.
 *
 * Ülke kodu ile telefon numarası bilgilerini temsil eder.
 */
export interface PhoneNumber {
  /**
   * The phone number without country code.
   *
   * Ülke kodu olmadan telefon numarası.
   */
  readonly number: string;

  /**
   * The international country code for the phone number.
   *
   * Telefon numarası için uluslararası ülke kodu.
   */
  readonly countryCode: number;
}

/**
 * Case priority rule definition model.
 *
 * Case öncelik kuralı tanım modeli.
 */
export interface CasePriorityRuleDefinition {
  readonly name: string;
  readonly score: number;
  readonly branches: readonly ProductBranch[];
  readonly caseTypes: readonly CaseType[];
  readonly saleOpportunityCaseSubTypes: readonly SaleOpportunityCaseSubType[];
  readonly cancelCaseSubTypes: readonly CancelCaseSubType[];
  readonly endorsementCaseSubTypes: readonly EndorsementCaseSubType[];
  readonly complaintCaseSubTypes: readonly ComplaintCaseSubType[];
  readonly channels: readonly Channel[];
  readonly arguments: Record<string, unknown>;
}

/**
 * Represents a product branch with its authorized products for the agent.
 *
 * Acente için yetkili ürünler ile bir ürün dalını temsil eder.
 */
export interface Branch {
  /**
   * The insurance product branch category.
   *
   * Sigorta ürün dalı kategorisi.
   */
  readonly productBranch: ProductBranch;

  /**
   * Array of specific product identifiers within the branch that the agent can sell.
   *
   * Acentenin satabileceği dal içindeki belirli ürün tanımlayıcıları dizisi.
   */
  readonly productIds: readonly number[];
}

// Request contracts

/**
 * Represents a request to update the current agent's profile information and operational settings.
 * Allows agents to modify their business details, contact information, and system configurations.
 *
 * Geçerli acentenin profil bilgilerini ve operasyonel ayarlarını güncelleme talebini temsil eder.
 * Acentelerin iş detaylarını, iletişim bilgilerini ve sistem yapılandırmalarını değiştirmesine olanak tanır.
 */
export interface UpdateCurrentAgentRequest {
  /**
   * The updated name of the agent.
   *
   * Acentenin güncellenmiş adı.
   */
  readonly name: string;

  /**
   * The updated phone number information for the agent.
   *
   * Acente için güncellenmiş telefon numarası bilgileri.
   */
  readonly phoneNumber: PhoneNumber | null;

  /**
   * The email address of the agent for business communications and notifications.
   *
   * Acentenin iş iletişimleri ve bildirimler için email adresi.
   */
  readonly email: string | null;

  /**
   * The automation mode for the agent's operations.
   *
   * Acentenin operasyonları için otomasyon modu.
   */
  readonly robotMode: RobotMode;

  /**
   * Optional call center integration options for the agent.
   *
   * Acente için isteğe bağlı çağrı merkezi entegrasyon seçenekleri.
   */
  readonly callCenterOptions: CallCenterAgentOptions | null;

  /**
   * Optional SMS service integration options for the agent.
   *
   * Acente için isteğe bağlı SMS hizmet entegrasyon seçenekleri.
   */
  readonly smsOptions: SmsAgentOptions | null;

  /**
   * The case representative assignment mode for automatic case distribution.
   *
   * Otomatik case dağıtımı için case atama modu.
   */
  readonly caseRepresentativeAssignmentMode: CaseRepresentativeAssignmentMode | null;

  /**
   * The list of allowed role names for case representative assignment.
   *
   * Case ataması için izin verilen rol adlarının listesi.
   */
  readonly caseRepresentativeAssignmentAllowedRoles: readonly string[];

  readonly casePriorityRuleDefinitions: readonly CasePriorityRuleDefinition[];
}

/**
 * Represents a request to add an insurance company connection to an agent.
 * Establishes a business relationship and authorizes the agent to sell the company's products.
 *
 * Bir acenteye sigorta şirketi bağlantısı ekleme talebini temsil eder.
 * İş ilişkisi kurar ve acenteyi şirketin ürünlerini satma konusunda yetkilendirir.
 */
export interface AddInsuranceCompanyToAgentRequest {
  /**
   * The unique identifier of the insurance company to be added.
   *
   * Eklenecek sigorta şirketinin benzersiz tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * The type of relationship between the agent and insurance company.
   *
   * Acente ile sigorta şirketi arasındaki ilişki türü.
   */
  readonly type: AgentInsuranceCompanyType;

  /**
   * The connection configuration fields for integrating with the insurance company's systems.
   *
   * Sigorta şirketinin sistemleri ile entegrasyon için bağlantı yapılandırma alanları.
   */
  readonly connectionFields: Record<string, string>;

  /**
   * Array of product branches and their associated products that the agent is authorized to sell.
   *
   * Acentenin satma yetkisine sahip olduğu ürün dalları ve ilişkili ürünler dizisi.
   */
  readonly branches: readonly Branch[];
}

/**
 * Represents a request to retrieve the product branches and authorizations for an agent's insurance company connection.
 * Used to view which insurance products the agent is authorized to sell from a specific insurance company.
 *
 * Bir acentenin sigorta şirketi bağlantısı için ürün dalları ve yetkilendirmelerini getirme talebini temsil eder.
 * Acentenin belirli bir sigorta şirketinden satma yetkisine sahip olduğu sigorta ürünlerini görüntülemek için kullanılır.
 */
export interface GetAgentInsuranceCompanyBranchesRequest {
  /**
   * The unique identifier of the agent-insurance company relationship to retrieve branches for.
   *
   * Dalları getirilecek acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly agentInsuranceCompanyId: string;
}

/**
 * Represents a request to retrieve the connection configuration for an agent's insurance company integration.
 * Used to view technical connection parameters and credentials for system integration.
 *
 * Bir acentenin sigorta şirketi entegrasyonu için bağlantı yapılandırmasını getirme talebini temsil eder.
 * Sistem entegrasyonu için teknik bağlantı parametrelerini ve kimlik bilgilerini görüntülemek için kullanılır.
 */
export interface GetAgentInsuranceCompanyConnectionRequest {
  /**
   * The unique identifier of the agent-insurance company relationship to retrieve connection details for.
   *
   * Bağlantı detayları getirilecek acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly agentInsuranceCompanyId: string;
}

/**
 * Represents a request to update the connection configuration for an agent's insurance company integration.
 * Modifies technical connection parameters and credentials for system integration.
 *
 * Bir acentenin sigorta şirketi entegrasyonu için bağlantı yapılandırmasını güncelleme talebini temsil eder.
 * Sistem entegrasyonu için teknik bağlantı parametrelerini ve kimlik bilgilerini değiştirir.
 */
export interface UpdateAgentInsuranceCompanyConnectionRequest {
  /**
   * The unique identifier of the agent-insurance company relationship to update.
   *
   * Güncellenecek acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly agentInsuranceCompanyId: string;

  /**
   * Updated connection configuration fields for integrating with the insurance company's systems.
   *
   * Sigorta şirketinin sistemleri ile entegrasyon için güncellenmiş bağlantı yapılandırma alanları.
   */
  readonly connectionFields: Record<string, string>;
}

/**
 * Represents a request to update the product branches and authorizations for an agent's insurance company connection.
 * Modifies which insurance products the agent is authorized to sell from a specific insurance company.
 *
 * Bir acentenin sigorta şirketi bağlantısı için ürün dalları ve yetkilendirmelerini güncelleme talebini temsil eder.
 * Acentenin belirli bir sigorta şirketinden satma yetkisine sahip olduğu sigorta ürünlerini değiştirir.
 */
export interface UpdateAgentInsuranceCompanyBranchesRequest {
  /**
   * The unique identifier of the agent-insurance company relationship to update.
   *
   * Güncellenecek acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly agentInsuranceCompanyId: string;

  /**
   * Array of updated product branches and their associated products that the agent is authorized to sell.
   *
   * Acentenin satma yetkisine sahip olduğu güncellenmiş ürün dalları ve ilişkili ürünler dizisi.
   */
  readonly branches: readonly Branch[];
}

/**
 * Represents a request to re-synchronize an agent's insurance company connection with the insurance company's systems.
 * Triggers a fresh data synchronization to ensure consistency between systems.
 *
 * Bir acentenin sigorta şirketi bağlantısını sigorta şirketinin sistemleri ile yeniden senkronize etme talebini temsil eder.
 * Sistemler arasında tutarlılığı sağlamak için yeni bir veri senkronizasyonu tetikler.
 */
export interface ReSyncAgentInsuranceCompanyWithInsuranceRequest {
  /**
   * The unique identifier of the agent-insurance company relationship to re-sync.
   *
   * Yeniden senkronize edilecek acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly agentInsuranceCompanyId: string;
}

// Response contracts

/**
 * Represents the response containing the current agent's profile information and operational settings.
 * Returns comprehensive agent details including business information and system configurations.
 *
 * Geçerli acentenin profil bilgileri ve operasyonel ayarlarını içeren yanıtı temsil eder.
 * İş bilgileri ve sistem yapılandırmaları dahil olmak üzere kapsamlı acente detaylarını döndürür.
 */
export interface GetCurrentAgentResult {
  /**
   * The name of the agent.
   *
   * Acentenin adı.
   */
  readonly name: string;

  /**
   * The plate number of the agent's registered vehicle (if applicable).
   *
   * Acentenin kayıtlı aracının plaka numarası (varsa).
   */
  readonly plateNo: string | null;

  /**
   * The tax number of the agent for business and regulatory purposes.
   *
   * İş ve düzenleyici amaçlar için acentenin vergi numarası.
   */
  readonly taxNumber: string;

  /**
   * The contact phone number information for the agent.
   *
   * Acente için iletişim telefon numarası bilgileri.
   */
  readonly phoneNumber: PhoneNumber | null;

  /**
   * The email address of the agent for business communications and notifications.
   *
   * Acentenin iş iletişimleri ve bildirimler için email adresi.
   */
  readonly email: string | null;

  /**
   * The automation mode for the agent's operations.
   *
   * Acentenin operasyonları için otomasyon modu.
   */
  readonly robotMode: RobotMode;

  /**
   * The call center integration configuration for the agent.
   *
   * Acente için çağrı merkezi entegrasyon yapılandırması.
   */
  readonly callCenterOptions: CallCenterAgentOptions | null;

  /**
   * The SMS service integration configuration for the agent.
   *
   * Acente için SMS hizmet entegrasyon yapılandırması.
   */
  readonly smsOptions: SmsAgentOptions | null;

  /**
   * The case representative assignment mode for automatic case distribution.
   *
   * Otomatik case dağıtımı için case atama modu.
   */
  readonly caseRepresentativeAssignmentMode: CaseRepresentativeAssignmentMode | null;

  /**
   * The list of allowed role names for case representative assignment.
   *
   * Case ataması için izin verilen rol adlarının listesi.
   */
  readonly caseRepresentativeAssignmentAllowedRoles: readonly string[];

  /**
   * Case priority rule definitions configured for the agent. Empty means no rules.
   */
  readonly casePriorityRuleDefinitions: readonly CasePriorityRuleDefinition[];
}

/**
 * Represents a single insurance company connection item for an agent in the insurance companies list response.
 * Contains comprehensive information about the agent's relationship with an insurance company.
 *
 * Sigorta şirketleri liste yanıtında bir acente için tek bir sigorta şirketi bağlantı öğesini temsil eder.
 * Acentenin bir sigorta şirketi ile ilişkisi hakkında kapsamlı bilgiler içerir.
 */
export interface GetMyAgentInsuranceCompaniesResult {
  /**
   * The unique identifier of the agent-insurance company relationship.
   *
   * Acente-sigorta şirketi ilişkisinin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * The identifier of the insurance company.
   *
   * Sigorta şirketinin tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * The name of the insurance company.
   *
   * Sigorta şirketinin adı.
   */
  readonly insuranceCompanyName: string;

  /**
   * Array of product branches that the agent is authorized to sell from this insurance company.
   *
   * Acentenin bu sigorta şirketinden satma yetkisine sahip olduğu ürün dalları dizisi.
   */
  readonly productBranches: readonly ProductBranch[];

  /**
   * The current synchronization status with the insurance company's systems.
   *
   * Sigorta şirketinin sistemleri ile mevcut senkronizasyon durumu.
   */
  readonly insuranceSyncState: InsuranceSyncState;

  /**
   * The type of business relationship between the agent and insurance company.
   *
   * Acente ile sigorta şirketi arasındaki iş ilişkisinin türü.
   */
  readonly type: AgentInsuranceCompanyType;

  /**
   * The connection configuration fields for integrating with the insurance company's systems.
   *
   * Sigorta şirketinin sistemleri ile entegrasyon için bağlantı yapılandırma alanları.
   */
  readonly connectionFields: Record<string, string>;

  /**
   * The permissions for this agent role.
   *
   * Bu rol için kesinleşmiş izinler dizisi. Permissions parametresi null ise,
   * bu özellik boş bir dizi döndürür ve sistem genelinde izin atamalarının
   * tutarlı şekilde işlenmesini sağlar.
   */
  readonly permissions: readonly string[];
}

/**
 * Represents the response containing product branch information for an agent's insurance company connection.
 * Returns the authorized product categories and specific products that the agent can sell.
 *
 * Bir acentenin sigorta şirketi bağlantısı için ürün dalı bilgilerini içeren yanıtı temsil eder.
 * Acentenin satabileceği yetkili ürün kategorilerini ve belirli ürünlerini döndürür.
 */
export interface GetAgentInsuranceCompanyBranchesResult {
  /**
   * The insurance product branch category that the agent is authorized to sell.
   *
   * Acentenin satma yetkisine sahip olduğu sigorta ürün dalı kategorisi.
   */
  readonly productBranch: ProductBranch;

  /**
   * Array of specific product identifiers within the branch that the agent can sell.
   *
   * Acentenin satabileceği dal içindeki belirli ürün tanımlayıcıları dizisi.
   */
  readonly productIds: number[];
}

/**
 * Represents the response containing connection configuration for an agent's insurance company integration.
 * Returns the technical connection parameters and credentials used for system integration.
 *
 * Bir acentenin sigorta şirketi entegrasyonu için bağlantı yapılandırmasını içeren yanıtı temsil eder.
 * Sistem entegrasyonu için kullanılan teknik bağlantı parametrelerini ve kimlik bilgilerini döndürür.
 */
export interface GetAgentInsuranceCompanyConnectionResult {
  /**
   * The connection configuration fields for integrating with the insurance company's systems.
   *
   * Sigorta şirketinin sistemleri ile entegrasyon için bağlantı yapılandırma alanları.
   */
  readonly connectionFields: Record<string, string>;
}

// Agent Role Contracts

/**
 * Represents a request to create a new role within an agent organization with specific permissions.
 * This defines a custom role that can be assigned to agent users for access control.
 *
 * Belirli izinlerle acente organizasyonu içinde yeni bir rol oluşturma isteğini temsil eder.
 * Bu, erişim kontrolü için acente kullanıcılarına atanabilecek özel bir rol tanımlar.
 */
export interface CreateAgentRoleRequest {
  /**
   * The name of the role to be created within the agent organization.
   * This name should be descriptive and unique within the organization to help
   * administrators identify the role's purpose. Role names are used in user
   * management interfaces and role assignment operations.
   *
   * Acente organizasyonu içinde oluşturulacak rolün adı. Bu ad açıklayıcı
   * ve organizasyon içinde benzersiz olmalıdır, böylece yöneticilerin rolün
   * amacını belirlemesine yardımcı olur. Rol adları kullanıcı yönetimi
   * arayüzlerinde ve rol atama operasyonlarında kullanılır.
   */
  readonly roleName: string;

  /**
   * The finalized array of permissions for this role. If the Permissions parameter
   * was null, this property returns an empty array, ensuring consistent handling
   * of permission assignments throughout the system.
   *
   * Bu rol için kesinleşmiş izinler dizisi. Permissions parametresi null ise,
   * bu özellik boş bir dizi döndürür ve sistem genelinde izin atamalarının
   * tutarlı şekilde işlenmesini sağlar.
   */
  readonly permissions: string[];
}

/**
 * Represents a request to update an existing agent role's permissions, access levels, or configuration settings.
 * This modifies role details and affects all users assigned to this role.
 *
 * Mevcut bir acente rolünün izinlerini, erişim seviyelerini veya yapılandırma ayarlarını güncelleme isteğini temsil eder.
 * Bu, rol detaylarını değiştirir ve bu role atanan tüm kullanıcıları etkiler.
 */
export interface UpdateAgentRoleRequest {
  /**
   * The unique identifier of the agent role that should be updated.
   * This ID is used to locate the specific role within the agent organization
   * and apply the requested changes to its configuration and permissions.
   *
   * Güncellenmesi gereken acente rolünün benzersiz tanımlayıcısı.
   * Bu ID, acente organizasyonu içindeki belirli rolü bulmak ve
   * konfigürasyonuna ve izinlerine istenen değişiklikleri uygulamak için kullanılır.
   */
  readonly id: string;

  /**
   * The new name to be assigned to the agent role. This name should be
   * descriptive and unique within the organization to help administrators
   * identify the role's purpose and distinguish it from other roles.
   *
   * Acente rolüne atanacak yeni ad. Bu ad açıklayıcı ve organizasyon
   * içinde benzersiz olmalıdır, böylece yöneticilerin rolün amacını
   * belirlemesine ve diğer rollerden ayırt etmesine yardımcı olur.
   */
  readonly name: string;

  /**
   * The updated array of permission identifiers that define what actions users with this role
   * can perform. This completely replaces the role's current permissions. If null or empty,
   * the role will have minimal default permissions. Changes affect all users assigned to this role.
   *
   * Bu role sahip kullanıcıların hangi eylemleri gerçekleştirebileceğini tanımlayan güncellenmiş
   * izin tanımlayıcıları dizisi. Bu, rolün mevcut izinlerini tamamen değiştirir. Null veya boş ise,
   * rol minimal varsayılan izinlere sahip olacaktır. Değişiklikler bu role atanan tüm kullanıcıları etkiler.
   */
  readonly permissions: string[] | null;
}

/**
 * Represents a request to permanently delete an agent role from the organization.
 * This removes the role and affects all users who were assigned to this role.
 *
 * Acente rolünü organizasyondan kalıcı olarak silme isteğini temsil eder.
 * Bu, rolü kaldırır ve bu role atanan tüm kullanıcıları etkiler.
 */
export interface DeleteAgentRoleRequest {
  /**
   * The unique identifier of the agent role that should be permanently deleted.
   * This ID is used to locate the specific role within the agent organization
   * and remove it from the system along with all its associated permissions and user assignments.
   *
   * Kalıcı olarak silinmesi gereken acente rolünün benzersiz tanımlayıcısı.
   * Bu ID, acente organizasyonu içindeki belirli rolü bulmak ve
   * ilişkili tüm izinleri ve kullanıcı atamalarıyla birlikte sistemden kaldırmak için kullanılır.
   */
  readonly id: string;
}

/**
 * Represents detailed information about a specific agent role retrieved by its unique identifier.
 * This provides comprehensive role configuration and permission details.
 *
 * Benzersiz tanımlayıcısı ile alınan belirli bir acente rolü hakkında detaylı bilgileri temsil eder.
 * Bu, kapsamlı rol konfigürasyonu ve izin detaylarını sağlar.
 */
export interface GetAgentRoleByIdResult {
  /**
   * The unique identifier for this agent role within the organization.
   * This ID serves as the primary reference for all role-related operations
   * and is used across the platform for role identification and management.
   *
   * Bu acente rolünün organizasyon içindeki benzersiz tanımlayıcısı.
   * Bu ID, tüm rolle ilgili operasyonlar için birincil referans olarak
   * hizmet verir ve platform genelinde rol tanımlaması ve yönetimi için kullanılır.
   */
  readonly id: string;

  /**
   * The human-readable name that identifies this role within the agent organization.
   * This name represents the role's purpose and responsibilities and is used throughout
   * the system for role identification and user assignment operations.
   *
   * Bu rolü acente organizasyonu içinde tanımlayan insan tarafından okunabilir ad.
   * Bu ad rolün amacını ve sorumluluklarını temsil eder ve sistem genelinde
   * rol tanımlaması ve kullanıcı atama operasyonları için kullanılır.
   */
  readonly name: string;

  /**
   * Complete collection of permission identifiers that define what actions users with this role
   * can perform within the system. These permissions control access to specific features,
   * data operations, and administrative functions across the agent organization.
   *
   * Bu role sahip kullanıcıların sistem içinde hangi eylemleri gerçekleştirebileceğini
   * tanımlayan izin tanımlayıcılarının tam koleksiyonu. Bu izinler acente organizasyonu
   * genelinde belirli özelliklere, veri operasyonlarına ve yönetici fonksiyonlarına erişimi kontrol eder.
   */
  readonly permissions: string[];

  /**
   * The timestamp when this agent role was initially created. This information
   * is useful for auditing purposes and understanding the evolution of the
   * organization's role structure over time.
   *
   * Bu acente rolünün ilk olarak oluşturulduğu zaman damgası. Bu bilgi
   * denetim amaçları ve organizasyonun rol yapısının zaman içindeki gelişimini
   * anlamak için yararlıdır.
   */
  readonly createdAt: string;

  /**
   * The timestamp when this agent role was last modified. Null if the role
   * has never been updated since creation. This helps track recent changes
   * and maintenance activities on the role configuration.
   *
   * Bu acente rolünün son değiştirildiği zaman damgası. Rol oluşturulduktan
   * sonra hiç güncellenmemişse null. Bu, rol konfigürasyonundaki son değişiklikleri
   * ve bakım faaliyetlerini takip etmeye yardımcı olur.
   */
  readonly updatedAt: string | null;

  /**
   * The unique identifier of the user who originally created this agent role.
   * This information is important for audit trails and understanding who
   * established the role within the organization.
   *
   * Bu acente rolünü orijinal olarak oluşturan kullanıcının benzersiz tanımlayıcısı.
   * Bu bilgi denetim izleri ve organizasyon içinde rolü kimin kurduğunu anlamak için önemlidir.
   */
  readonly createdById: string;

  /**
   * The unique identifier of the user who last modified this agent role.
   * Null if the role has never been updated since creation. This helps identify
   * who made recent changes to the role configuration.
   *
   * Bu acente rolünü son değiştiren kullanıcının benzersiz tanımlayıcısı.
   * Rol oluşturulduktan sonra hiç güncellenmemişse null. Bu, rol konfigürasyonunda
   * son değişiklikleri kimin yaptığını belirlemeye yardımcı olur.
   */
  readonly updatedById: string | null;

  /**
   * The display name of the user who originally created this agent role.
   * This provides a human-readable reference to the role creator for
   * administrative interfaces and audit reports.
   *
   * Bu acente rolünü orijinal olarak oluşturan kullanıcının görüntü adı.
   * Bu, yönetici arayüzleri ve denetim raporları için rol oluşturucusuna
   * insan tarafından okunabilir referans sağlar.
   */
  readonly createdByName: string;

  /**
   * The display name of the user who last modified this agent role.
   * Null if the role has never been updated since creation. This provides
   * a human-readable reference to the last modifier for administrative tracking.
   *
   * Bu acente rolünü son değiştiren kullanıcının görüntü adı. Rol oluşturulduktan
   * sonra hiç güncellenmemişse null. Bu, yönetici takibi için son değiştirici için
   * insan tarafından okunabilir referans sağlar.
   */
  readonly updatedByName: string | null;
}

/**
 * Represents response data for an agent role in a list of all roles within the organization.
 * This provides essential role information for administrative overview and management.
 *
 * Organizasyon içindeki tüm rollerin listesinde bir acente rolü için yanıt verilerini temsil eder.
 * Bu, yönetici görünümü ve yönetimi için temel rol bilgilerini sağlar.
 */
export interface GetAllAgentRolesResult {
  /**
   * The unique identifier for this agent role within the organization.
   * This ID serves as the primary reference for role management operations,
   * user assignments, and permission configurations.
   *
   * Bu acente rolünün organizasyon içindeki benzersiz tanımlayıcısı.
   * Bu ID, rol yönetimi operasyonları, kullanıcı atamaları ve izin
   * konfigürasyonları için birincil referans olarak hizmet verir.
   */
  readonly id: string;

  /**
   * The human-readable name that identifies this role within the agent organization.
   * This name should be descriptive and help administrators understand the role's
   * purpose and scope of responsibilities.
   *
   * Bu rolü acente organizasyonu içinde tanımlayan insan tarafından okunabilir ad.
   * Bu ad açıklayıcı olmalı ve yöneticilerin rolün amacını ve sorumluluk kapsamını
   * anlamalarına yardımcı olmalıdır.
   */
  readonly name: string;

  /**
   * Collection of permission identifiers that define what actions users with this role
   * can perform within the system. These permissions control access to specific features,
   * data operations, and administrative functions across the agent organization.
   *
   * Bu role sahip kullanıcıların sistem içinde hangi eylemleri gerçekleştirebileceğini
   * tanımlayan izin tanımlayıcıları koleksiyonu. Bu izinler acente organizasyonu genelinde
   * belirli özelliklere, veri operasyonlarına ve yönetici fonksiyonlarına erişimi kontrol eder.
   */
  readonly permissions: string[];

  /**
   * The timestamp when this agent role was initially created. This information
   * is useful for auditing purposes and understanding the evolution of the
   * organization's role structure over time.
   *
   * Bu acente rolünün ilk olarak oluşturulduğu zaman damgası. Bu bilgi
   * denetim amaçları ve organizasyonun rol yapısının zaman içindeki gelişimini
   * anlamak için yararlıdır.
   */
  readonly createdAt: string;

  /**
   * The timestamp when this agent role was last modified. Null if the role
   * has never been updated since creation. This helps track recent changes
   * and maintenance activities on the role configuration.
   *
   * Bu acente rolünün son değiştirildiği zaman damgası. Rol oluşturulduktan
   * sonra hiç güncellenmemişse null. Bu, rol konfigürasyonundaki son değişiklikleri
   * ve bakım faaliyetlerini takip etmeye yardımcı olur.
   */
  readonly updatedAt: string | null;

  /**
   * The unique identifier of the user who originally created this agent role.
   * This information is important for audit trails and understanding who
   * established the role within the organization.
   *
   * Bu acente rolünü orijinal olarak oluşturan kullanıcının benzersiz tanımlayıcısı.
   * Bu bilgi denetim izleri ve organizasyon içinde rolü kimin kurduğunu anlamak için önemlidir.
   */
  readonly createdById: string;

  /**
   * The unique identifier of the user who last modified this agent role.
   * Null if the role has never been updated since creation. This helps identify
   * who made recent changes to the role configuration.
   *
   * Bu acente rolünü son değiştiren kullanıcının benzersiz tanımlayıcısı.
   * Rol oluşturulduktan sonra hiç güncellenmemişse null. Bu, rol konfigürasyonunda
   * son değişiklikleri kimin yaptığını belirlemeye yardımcı olur.
   */
  readonly updatedById: string | null;

  /**
   * The display name of the user who originally created this agent role.
   * This provides a human-readable reference to the role creator for
   * administrative interfaces and audit reports.
   *
   * Bu acente rolünü orijinal olarak oluşturan kullanıcının görüntü adı.
   * Bu, yönetici arayüzleri ve denetim raporları için rol oluşturucusuna
   * insan tarafından okunabilir referans sağlar.
   */
  readonly createdByName: string;

  /**
   * The display name of the user who last modified this agent role.
   * Null if the role has never been updated since creation. This provides
   * a human-readable reference to the last modifier for administrative tracking.
   *
   * Bu acente rolünü son değiştiren kullanıcının görüntü adı. Rol oluşturulduktan
   * sonra hiç güncellenmemişse null. Bu, yönetici takibi için son değiştirici için
   * insan tarafından okunabilir referans sağlar.
   */
  readonly updatedByName: string | null;
}

// Agent Setup Contracts

/**
 * Represents a request to enter an agent setup process using a provided access code.
 * This validates the code and initiates the agent registration workflow.
 *
 * Sağlanan erişim kodu kullanarak acente kurulum sürecine girme isteğini temsil eder.
 * Bu, kodu doğrular ve acente kayıt iş akışını başlatır.
 */
export interface EnterAgentSetupRequestRequest {
  /**
   * The unique access code associated with an agent setup request. This code is generated
   * when an administrator creates a setup request and is shared with prospective agents to
   * begin their registration process. The code must be valid and not expired for access to be granted.
   *
   * Bir acente kurulum talebi ile ilişkili benzersiz erişim kodu. Bu kod, bir yönetici
   * kurulum talebi oluşturduğunda üretilir ve kayıt süreçlerini başlatmaları için potansiyel
   * acentelerle paylaşılır. Erişim verilmesi için kodun geçerli ve süresi dolmamış olması gerekir.
   */
  readonly code: string;
}

/**
 * Represents the response when successfully entering an agent setup request process.
 * Contains the human-readable label associated with the validated setup request.
 *
 * Acente kurulum talebi sürecine başarıyla girildiğinde verilen yanıtı temsil eder.
 * Doğrulanan kurulum talebi ile ilişkili insan tarafından okunabilir etiketi içerir.
 */
export interface EnterAgentSetupRequestResult {
  /**
   * The descriptive label associated with the validated agent setup request.
   * This label was originally set when the setup request was created by an administrator
   * and helps identify the specific onboarding process or campaign that the agent is entering.
   *
   * Doğrulanan acente kurulum talebi ile ilişkili açıklayıcı etiket.
   * Bu etiket orijinal olarak bir yönetici tarafından kurulum talebi oluşturulduğunda
   * ayarlanmıştır ve acentenin girdiği belirli onboarding sürecini veya kampanyayı
   * tanımlamaya yardımcı olur.
   */
  readonly label: string;
}

/**
 * Represents a request to complete an agent setup process with comprehensive agent and user information.
 * This finalizes the agent onboarding workflow by creating both the agent entity and associated user account.
 *
 * Kapsamlı acente ve kullanıcı bilgileri ile acente kurulum sürecini tamamlama isteğini temsil eder.
 * Bu, hem acente varlığını hem de ilişkili kullanıcı hesabını oluşturarak acente onboarding iş akışını sonlandırır.
 */
export interface CompleteAgentSetupRequestRequest {
  /**
   * The unique access code that was generated when the agent setup request was created.
   * This code validates that the completion request corresponds to a valid, active setup process.
   * Must match an existing, non-expired setup request for successful completion.
   *
   * Acente kurulum talebi oluşturulduğunda üretilen benzersiz erişim kodu.
   * Bu kod, tamamlama talebinin geçerli, aktif bir kurulum sürecine karşılık geldiğini doğrular.
   * Başarılı tamamlama için mevcut, süresi dolmamış bir kurulum talebiyle eşleşmelidir.
   */
  readonly code: string;

  /**
   * Complete agent profile including business information, insurance company connections,
   * and product branch assignments. This defines the agent's operational capabilities
   * and system permissions within InsurUp's platform.
   *
   * İş bilgileri, sigorta şirketi bağlantıları ve ürün dalı atamalarını içeren
   * tam acente profili. Bu, acentenin InsurUp platformu içindeki operasyonel yeteneklerini
   * ve sistem yetkilerini tanımlar.
   */
  readonly agent: Agent;

  /**
   * Primary user account details for the agent's main administrative user.
   * This user will have full access to the agent's operations and serve as the
   * primary contact for system communications and management activities.
   *
   * Acentenin ana yönetici kullanıcısı için birincil kullanıcı hesabı detayları.
   * Bu kullanıcı acentenin operasyonlarına tam erişime sahip olacak ve sistem
   * iletişimleri ile yönetim faaliyetleri için birincil iletişim noktası olarak hizmet verecek.
   */
  readonly agentUser: AgentUser;
}

// Agent User Contracts

/**
 * Represents a request to invite a new user to join an agent organization.
 * This initiates the user invitation workflow with role assignments and creates a pending user account.
 *
 * Acente organizasyonuna katılması için yeni bir kullanıcıyı davet etme isteğini temsil eder.
 * Bu, rol atamaları ile kullanıcı davet iş akışını başlatır ve beklemedeki kullanıcı hesabı oluşturur.
 */
export interface InviteAgentUserRequest {
  /**
   * The email address of the person being invited to join the agent organization.
   * This address will receive the invitation email and will serve as the primary
   * identifier for the user account. Must be unique within the system and will be
   * used for authentication and account management purposes.
   *
   * Acente organizasyonuna katılmaya davet edilen kişinin e-posta adresi.
   * Bu adres davet e-postasını alacak ve kullanıcı hesabı için birincil tanımlayıcı
   * olarak hizmet verecektir. Sistem içinde benzersiz olmalı ve kimlik doğrulama
   * ve hesap yönetimi amaçları için kullanılacaktır.
   */
  readonly email: string;

  /**
   * The first name of the person being invited to join the agent organization.
   * This information is used for personalization in invitation emails and will be
   * part of the user's profile once they accept the invitation and join the organization.
   *
   * Acente organizasyonuna katılmaya davet edilen kişinin adı.
   * Bu bilgi davet e-postalarında kişiselleştirme için kullanılır ve daveti kabul
   * edip organizasyona katıldıklarında kullanıcının profilinin bir parçası olacaktır.
   */
  readonly firstName: string;

  /**
   * The last name (surname) of the person being invited to join the agent organization.
   * Combined with the first name, this provides complete identification for the invited user
   * and is used in communication and user management within the organization.
   *
   * Acente organizasyonuna katılmaya davet edilen kişinin soyadı.
   * Ad ile birleştirildiğinde, davet edilen kullanıcı için tam kimlik sağlar ve
   * organizasyon içinde iletişim ve kullanıcı yönetiminde kullanılır.
   */
  readonly lastName: string;

  /**
   * Collection of role names that will be assigned to the user once they accept the invitation.
   * These roles determine the user's permissions and access levels within the agent organization.
   * Roles control what operations the user can perform and which parts of the system they can access.
   * An empty array means the user will have minimal default permissions.
   *
   * Kullanıcının daveti kabul etmesi durumunda atanacak rol adlarının koleksiyonu.
   * Bu roller, kullanıcının acente organizasyonu içindeki izinlerini ve erişim seviyelerini belirler.
   * Roller kullanıcının hangi operasyonları gerçekleştirebileceğini ve sistemin hangi bölümlerine
   * erişebileceğini kontrol eder. Boş dizi, kullanıcının minimal varsayılan izinlere sahip olacağı anlamına gelir.
   */
  readonly roles: string[];
}

/**
 * Represents a request to accept an agent user invitation and complete the registration process.
 * This activates a pending user account and sets the initial password.
 *
 * Acente kullanıcı davetini kabul etme ve kayıt sürecini tamamlama isteğini temsil eder.
 * Bu, beklemedeki kullanıcı hesabını aktifleştirir ve başlangıç şifresini ayarlar.
 */
export interface AcceptAgentUserInviteRequest {
  /**
   * The unique invitation code that was sent to the user's email when they were
   * invited to join the agent organization. This code validates the invitation
   * and ensures that only the intended recipient can accept the invitation and
   * create their account.
   *
   * Kullanıcının acente organizasyonuna katılmaya davet edildiğinde e-postasına
   * gönderilen benzersiz davet kodu. Bu kod daveti doğrular ve yalnızca hedeflenen
   * alıcının daveti kabul edebilmesini ve hesabını oluşturabilmesini sağlar.
   */
  readonly code: string;

  /**
   * The password that will be set for the new agent user account. This password
   * should meet the system's security requirements and will be used for future
   * authentication. The user should be encouraged to change this password after
   * their first login for enhanced security.
   *
   * Yeni acente kullanıcı hesabı için ayarlanacak şifre. Bu şifre sistemin
   * güvenlik gereksinimlerini karşılamalı ve gelecekteki kimlik doğrulamaları için
   * kullanılacaktır. Gelişmiş güvenlik için kullanıcının ilk girişinden sonra
   * bu şifreyi değiştirmesi teşvik edilmelidir.
   */
  readonly password: string;
}

/**
 * Represents a request for an agent user to update their own profile information.
 * This allows users to modify their personal details without administrative intervention.
 *
 * Acente kullanıcısının kendi profil bilgilerini güncelleme isteğini temsil eder.
 * Bu, kullanıcıların yönetici müdahalesi olmadan kişisel detaylarını değiştirmelerine olanak tanır.
 */
export interface UpdateMyAgentUserRequest {
  /**
   * The new first name that the user wants to set for their profile.
   * This information is used for identification and personalization throughout
   * the system and will be displayed in user interfaces and communications.
   *
   * Kullanıcının profili için ayarlamak istediği yeni ad. Bu bilgi sistem
   * genelinde kimlik belirleme ve kişiselleştirme için kullanılır ve kullanıcı
   * arayüzleri ile iletişimlerde görüntülenecektir.
   */
  readonly firstName: string;

  /**
   * The new last name (surname) that the user wants to set for their profile.
   * Combined with the first name, this provides complete updated identification
   * for the user within the agent organization and system communications.
   *
   * Kullanıcının profili için ayarlamak istediği yeni soyad. Ad ile birleştirildiğinde,
   * acente organizasyonu ve sistem iletişimleri içinde kullanıcı için tam güncellenmiş
   * kimlik sağlar.
   */
  readonly lastName: string;
}

/**
 * Represents a request to update an existing agent user's profile information and security settings.
 * This modifies user details, role assignments, and two-factor authentication configuration.
 *
 * Mevcut bir acente kullanıcısının profil bilgilerini ve güvenlik ayarlarını güncelleme isteğini temsil eder.
 * Bu, kullanıcı detaylarını, rol atamalarını ve iki faktörlü kimlik doğrulama konfigürasyonunu değiştirir.
 */
export interface UpdateAgentUserRequest {
  /**
   * The unique identifier of the agent user whose information should be updated.
   * This ID is used to locate the specific user account within the agent organization
   * and apply the requested changes to their profile and settings.
   *
   * Bilgileri güncellenmesi gereken acente kullanıcısının benzersiz tanımlayıcısı.
   * Bu ID, acente organizasyonu içindeki belirli kullanıcı hesabını bulmak ve
   * profiline ve ayarlarına istenen değişiklikleri uygulamak için kullanılır.
   */
  readonly id: string;

  /**
   * The new first name to be assigned to the agent user. This information
   * is used for identification and personalization throughout the system and
   * will be reflected in user interfaces and communications.
   *
   * Acente kullanıcısına atanacak yeni ad. Bu bilgi sistem genelinde
   * kimlik belirleme ve kişiselleştirme için kullanılır ve kullanıcı arayüzleri
   * ile iletişimlerde yansıtılacaktır.
   */
  readonly firstName: string;

  /**
   * The new last name (surname) to be assigned to the agent user.
   * Combined with the first name, this provides complete updated identification
   * for the user within the agent organization.
   *
   * Acente kullanıcısına atanacak yeni soyad. Ad ile birleştirildiğinde,
   * acente organizasyonu içinde kullanıcı için tam güncellenmiş kimlik sağlar.
   */
  readonly lastName: string;

  /**
   * The complete set of roles to be assigned to the agent user after the update.
   * This replaces the user's current role assignments and determines their new
   * permissions and access levels within the agent organization. All existing roles
   * are removed and replaced with the roles specified in this array.
   *
   * Güncelleme sonrasında acente kullanıcısına atanacak tam rol seti.
   * Bu, kullanıcının mevcut rol atamalarını değiştirir ve acente organizasyonu
   * içindeki yeni izinlerini ve erişim seviyelerini belirler. Mevcut tüm roller
   * kaldırılır ve bu dizide belirtilen rollerle değiştirilir.
   */
  readonly roles: string[];

  /**
   * Specifies whether two-factor authentication (2FA) should be enabled or disabled
   * for this agent user. When enabled, the user will be required to provide a second
   * form of authentication (such as a mobile app code) in addition to their password
   * when logging in, providing enhanced security for their account.
   *
   * Bu acente kullanıcısı için iki faktörlü kimlik doğrulamanın (2FA) etkinleştirilip
   * etkinleştirilmeyeceğini belirtir. Etkinleştirildiğinde, kullanıcının giriş yaparken
   * şifresine ek olarak ikinci bir kimlik doğrulama biçimi (mobil uygulama kodu gibi)
   * sağlaması gerekecek ve hesabı için gelişmiş güvenlik sağlayacaktır.
   */
  readonly twoFactorEnabled: boolean;
}

/**
 * Represents a request for an agent user to change their own password by providing their current password.
 * This enables users to update their authentication credentials securely.
 *
 * Acente kullanıcısının mevcut şifresini sağlayarak kendi şifresini değiştirme isteğini temsil eder.
 * Bu, kullanıcıların kimlik doğrulama bilgilerini güvenli bir şekilde güncellemelerini sağlar.
 */
export interface UpdateAgentUserPasswordRequest {
  /**
   * The user's current password that must be provided for verification before
   * the password can be changed. This security measure ensures that only the
   * authenticated user can modify their password and prevents unauthorized access.
   *
   * Şifre değiştirilebilmesi için doğrulama amacıyla sağlanması gereken kullanıcının
   * mevcut şifresi. Bu güvenlik önlemi, yalnızca kimliği doğrulanan kullanıcının
   * şifresini değiştirebilmesini sağlar ve yetkisiz erişimi önler.
   */
  readonly currentPassword: string;

  /**
   * The new password that will replace the user's current password. This password
   * should meet the system's security requirements including minimum length, complexity,
   * and character requirements. Once set, the user will use this password for
   * future authentication to their account.
   *
   * Kullanıcının mevcut şifresinin yerini alacak yeni şifre. Bu şifre, minimum
   * uzunluk, karmaşıklık ve karakter gereksinimleri dahil olmak üzere sistemin
   * güvenlik gereksinimlerini karşılamalıdır. Ayarlandıktan sonra kullanıcı,
   * hesabına gelecekteki kimlik doğrulamaları için bu şifreyi kullanacaktır.
   */
  readonly newPassword: string;
}

/**
 * Represents comprehensive information about a specific agent user retrieved from the system.
 * This response contains detailed user profile data, role assignments, and security settings.
 *
 * Sistemden alınan belirli bir acente kullanıcısı hakkında kapsamlı bilgileri temsil eder.
 * Bu yanıt detaylı kullanıcı profil verileri, rol atamaları ve güvenlik ayarlarını içerir.
 */
export interface GetAgentUserResult {
  /**
   * The unique identifier for this agent user within the system.
   * This ID serves as the primary reference for all user-related operations
   * and is used across the platform for user identification and management.
   *
   * Bu acente kullanıcısının sistem içindeki benzersiz tanımlayıcısı.
   * Bu ID, tüm kullanıcı ile ilgili operasyonlar için birincil referans olarak
   * hizmet verir ve platform genelinde kullanıcı tanımlaması ve yönetimi için kullanılır.
   */
  readonly id: string;

  /**
   * The first name of the agent user as stored in their profile.
   * This information is used for personalization and identification
   * throughout the system and in communications with the user.
   *
   * Acente kullanıcısının profilinde saklanan adı.
   * Bu bilgi sistem genelinde kişiselleştirme ve kimlik belirleme
   * ve kullanıcıyla iletişimlerde kullanılır.
   */
  readonly firstName: string;

  /**
   * The last name (surname) of the agent user as stored in their profile.
   * Combined with the first name, this provides complete identification
   * for the user within the agent organization.
   *
   * Acente kullanıcısının profilinde saklanan soyadı.
   * Ad ile birleştirildiğinde, acente organizasyonu içinde kullanıcı
   * için tam kimlik sağlar.
   */
  readonly lastName: string;

  /**
   * The email address associated with the agent user account.
   * This serves as the primary identifier for authentication and
   * is used for system communications and notifications.
   *
   * Acente kullanıcı hesabıyla ilişkili e-posta adresi.
   * Bu, kimlik doğrulama için birincil tanımlayıcı olarak hizmet verir
   * ve sistem iletişimleri ve bildirimleri için kullanılır.
   */
  readonly email: string;

  /**
   * Collection of role names that have been assigned to this agent user.
   * These roles determine the user's access levels and permissions within
   * the agent organization. Each role represents a set of capabilities
   * and responsibilities within the system.
   *
   * Bu acente kullanıcısına atanan rol adlarının koleksiyonu.
   * Bu roller, kullanıcının acente organizasyonu içindeki erişim seviyelerini
   * ve izinlerini belirler. Her rol, sistem içinde bir dizi yetenek ve
   * sorumluluğu temsil eder.
   */
  readonly roles: string[];

  /**
   * Collection of permission identifiers that this user has been granted
   * through their assigned roles. These permissions define what specific actions
   * and operations the user can perform within the agent organization's systems.
   *
   * Bu kullanıcının atanan rolleri aracılığıyla kendisine verilen izin
   * tanımlayıcıları koleksiyonu. Bu izinler, kullanıcının acente organizasyonunun
   * sistemleri içinde hangi belirli eylemleri ve operasyonları gerçekleştirebileceğini tanımlar.
   */
  readonly permissions: string[];

  /**
   * The name of the agent organization that this user is a member of.
   * This provides organizational context and helps identify which agent
   * business the user represents and works for.
   *
   * Bu kullanıcının üyesi olduğu acente organizasyonunun adı.
   * Bu, organizasyonel bağlam sağlar ve kullanıcının hangi acente işletmesini
   * temsil ettiğini ve için çalıştığını belirlemeye yardımcı olur.
   */
  readonly agentName: string;

  /**
   * Boolean flag indicating whether two-factor authentication (2FA) is
   * currently enabled for this agent user. When true, the user must provide
   * a second form of authentication in addition to their password when logging in.
   *
   * Bu acente kullanıcısı için iki faktörlü kimlik doğrulamanın (2FA) şu anda
   * etkin olup olmadığını gösteren boolean bayrağı. True olduğunda, kullanıcı
   * giriş yaparken şifresine ek olarak ikinci bir kimlik doğrulama biçimi sağlamalıdır.
   */
  readonly twoFactorEnabled: boolean;

  /**
   * The call center implementation configuration assigned to this agent user.
   * This determines which call center system or integration the user will use
   * for customer communications and support operations within their role.
   *
   * Bu acente kullanıcısına atanan çağrı merkezi uygulama konfigürasyonu.
   * Bu, kullanıcının rolü dahilinde müşteri iletişimleri ve destek operasyonları
   * için hangi çağrı merkezi sistemini veya entegrasyonunu kullanacağını belirler.
   */
  readonly callCenterImplementation: CallCenterImplementation;
}

/**
 * Represents the response containing the robot automation code for the current agent user.
 * This code is used for robotic process automation and API integrations.
 *
 * Mevcut acente kullanıcısı için robot otomasyon kodunu içeren yanıtı temsil eder.
 * Bu kod robotik süreç otomasyonu ve API entegrasyonları için kullanılır.
 */
export interface GetMyAgentUserRobotCodeResult {
  /**
   * The unique robot automation code assigned to the current agent user.
   * This code is used to identify and authenticate automated processes, API calls,
   * and robotic process automation workflows that operate on behalf of the user.
   * Essential for integration with external systems and automated business processes.
   *
   * Mevcut acente kullanıcısına atanan benzersiz robot otomasyon kodu.
   * Bu kod, kullanıcı adına çalışan otomatik süreçleri, API çağrılarını ve
   * robotik süreç otomasyonu iş akışlarını tanımlamak ve kimlik doğrulamak için kullanılır.
   * Harici sistemlerle entegrasyon ve otomatik iş süreçleri için gereklidir.
   */
  readonly robotCode: string;
}

// Agent Setup Models

/**
 * Represents comprehensive agent business information and operational configuration.
 *
 * Kapsamlı acente iş bilgilerini ve operasyonel konfigürasyonu temsil eder.
 */
export interface Agent {
  /**
   * The official legal name under which the agent or agency operates.
   * This name is used for official documentation, contracts, and legal identification
   * within the insurance system. Must match official business registration records.
   *
   * Acentenin veya acenteliğin faaliyet gösterdiği resmi yasal adı.
   * Bu ad resmi belgeler, sözleşmeler ve sigorta sistemi içindeki yasal kimlik
   * için kullanılır. Resmi iş kayıt kayıtlarıyla eşleşmelidir.
   */
  readonly name: string;

  /**
   * License plate number of the company vehicle used by the agent for business operations.
   * This is optional and used for identification and tracking purposes when the agent
   * operates with a designated company vehicle for field work and client visits.
   *
   * Acentenin iş operasyonları için kullandığı şirket aracının plaka numarası.
   * Bu isteğe bağlıdır ve acente saha çalışması ve müşteri ziyaretleri için
   * belirlenmiş şirket aracı ile çalıştığında kimlik ve takip amaçları için kullanılır.
   */
  readonly plateNo: string | null;

  /**
   * Official tax identification number required for legal compliance and financial reporting.
   * This number is essential for tax obligations, official documentation, and regulatory
   * compliance within Turkey's business and insurance regulatory framework.
   *
   * Yasal uyumluluk ve mali raporlama için gerekli resmi vergi kimlik numarası.
   * Bu numara vergi yükümlülükleri, resmi belgeler ve Türkiye'nin iş ve sigorta
   * düzenleyici çerçevesi içindeki mevzuat uyumluluğu için gereklidir.
   */
  readonly taxNumber: string;

  /**
   * Primary contact phone number for business communications with the agent.
   * This number is used for customer service, technical support, and official
   * communications from InsurUp and partner insurance companies.
   *
   * Acente ile iş iletişimi için birincil iletişim telefonu numarası.
   * Bu numara müşteri hizmetleri, teknik destek ve InsurUp ile partner
   * sigorta şirketlerinden resmi iletişimler için kullanılır.
   */
  readonly phoneNumber: PhoneNumber | null;

  /**
   * Array of insurance company relationships and technical integrations for the agent.
   * Each connection defines which insurance company the agent works with, the type of
   * relationship, connection credentials, and specific product branches they can offer.
   *
   * Acente için sigorta şirketi ilişkileri ve teknik entegrasyonların dizisi.
   * Her bağlantı acentenin hangi sigorta şirketi ile çalıştığını, ilişki türünü,
   * bağlantı kimlik bilgilerini ve sunabilecekleri belirli ürün dallarını tanımlar.
   */
  readonly companies: Company[];

  /**
   * Defines the level of automated processing and robotic process automation (RPA)
   * capabilities enabled for this agent. This determines which automated workflows
   * and AI-assisted processes the agent can utilize for improved efficiency.
   *
   * Bu acente için etkinleştirilen otomatik işlem seviyesini ve robotik süreç
   * otomasyonu (RPA) yeteneklerini tanımlar. Bu, acentenin geliştirilmiş verimlilik
   * için hangi otomatik iş akışlarını ve AI destekli süreçleri kullanabileceğini belirler.
   */
  readonly robotMode: RobotMode;
}

/**
 * Defines a specific relationship between the agent and an insurance company,
 * including integration credentials, product branch permissions, and technical
 * connection parameters required for automated policy processing.
 *
 * Acente ile sigorta şirketi arasındaki belirli ilişkiyi, entegrasyon kimlik
 * bilgilerini, ürün dalı izinlerini ve otomatik poliçe işleme için gerekli
 * teknik bağlantı parametrelerini tanımlar.
 */
export interface Company {
  /**
   * Defines the nature of the business relationship between the agent and insurance company.
   * This determines the agent's authority level, commission structure, and operational
   * permissions within the specific insurance company's systems and processes.
   *
   * Acente ile sigorta şirketi arasındaki iş ilişkisinin doğasını tanımlar.
   * Bu, acentenin yetki seviyesini, komisyon yapısını ve belirli sigorta şirketinin
   * sistemleri ve süreçleri içindeki operasyonel izinlerini belirler.
   */
  readonly type: AgentInsuranceCompanyType;

  /**
   * The unique system identifier for the insurance company that the agent will
   * be connected to. This ID references the insurance company's profile and
   * integration configuration within InsurUp's platform.
   *
   * Acentenin bağlanacağı sigorta şirketinin benzersiz sistem tanımlayıcısı.
   * Bu ID, sigorta şirketinin InsurUp platformu içindeki profilini ve
   * entegrasyon konfigürasyonunu referans alır.
   */
  readonly insuranceCompanyId: number;

  /**
   * Dictionary of technical parameters and credentials required for establishing
   * automated integration with the insurance company's systems. These fields typically
   * include API keys, authentication tokens, endpoint URLs, and other connection-specific
   * configuration required for automated policy processing and data exchange.
   *
   * Sigorta şirketinin sistemleri ile otomatik entegrasyon kurmak için gerekli
   * teknik parametreler ve kimlik bilgileri sözlüğü. Bu alanlar genellikle API anahtarları,
   * kimlik doğrulama tokenları, endpoint URL'leri ve otomatik poliçe işleme ve
   * veri alışverişi için gerekli diğer bağlantıya özgü konfigürasyonları içerir.
   */
  readonly connectionFields: Record<string, string>;

  /**
   * Array of insurance product branches and specific products that the agent is
   * authorized to sell from this insurance company. Each branch defines a category
   * of insurance products (like auto, health, property) and the specific product
   * variants within that category that the agent can offer to customers.
   *
   * Acentenin bu sigorta şirketinden satma yetkisine sahip olduğu sigorta ürün
   * dalları ve belirli ürünlerin dizisi. Her dal bir sigorta ürün kategorisini
   * (otomobil, sağlık, emlak gibi) ve o kategori içinde acentenin müşterilere
   * sunabileceği belirli ürün varyantlarını tanımlar.
   */
  readonly branches: Branch[];
}

/**
 * Defines the primary user account that will be created for the agent's main administrative user.
 * This account serves as the primary access point for the agent to manage their operations,
 * view reports, process policies, and interact with InsurUp's platform features.
 *
 * Acentenin ana yönetici kullanıcısı için oluşturulacak birincil kullanıcı hesabını tanımlar.
 * Bu hesap, acentenin operasyonlarını yönetmesi, raporları görüntülemesi, poliçeleri işlemesi
 * ve InsurUp platform özelliklerini kullanması için birincil erişim noktası olarak hizmet verir.
 */
export interface AgentUser {
  /**
   * The first name of the person who will serve as the primary agent user.
   * This information is used for personalization, communication, and identification
   * purposes within the system and in correspondence with customers and partners.
   *
   * Birincil acente kullanıcısı olarak hizmet verecek kişinin adı.
   * Bu bilgi sistem içinde ve müşteriler ve partnerlerle yazışmalarda
   * kişiselleştirme, iletişim ve kimlik belirleme amaçları için kullanılır.
   */
  readonly firstName: string;

  /**
   * The last name (surname) of the person who will serve as the primary agent user.
   * Combined with the first name, this provides complete identification for the user
   * and is used in official communications and system records.
   *
   * Birincil acente kullanıcısı olarak hizmet verecek kişinin soyadı.
   * Ad ile birleştirildiğinde, kullanıcı için tam kimlik sağlar ve
   * resmi iletişimlerde ve sistem kayıtlarında kullanılır.
   */
  readonly lastName: string;

  /**
   * The email address that will be used for account authentication, system notifications,
   * and official communications. This serves as the primary identifier for login purposes
   * and must be unique within the system. All important system communications will be sent to this address.
   *
   * Hesap kimlik doğrulaması, sistem bildirimleri ve resmi iletişimler için kullanılacak
   * e-posta adresi. Bu, giriş amaçları için birincil tanımlayıcı olarak hizmet verir ve
   * sistem içinde benzersiz olmalıdır. Tüm önemli sistem iletişimleri bu adrese gönderilecektir.
   */
  readonly email: string;

  /**
   * The initial password for the agent user account. This password will be used for
   * the first login and should meet security requirements. The user should be encouraged
   * to change this password after their first successful login for enhanced security.
   *
   * Acente kullanıcı hesabı için başlangıç şifresi. Bu şifre ilk giriş için kullanılacak
   * ve güvenlik gereksinimlerini karşılamalıdır. Gelişmiş güvenlik için kullanıcının
   * ilk başarılı girişinden sonra bu şifreyi değiştirmesi teşvik edilmelidir.
   */
  readonly password: string;
}

// ============================================================================
// B2C CONFIGURATION TYPES
// ============================================================================

/**
 * Enumeration of B2C configuration field types
 */
export enum B2CConfigFieldType {
  Object = 1,
  Array = 2,
  Text = 3,
  Number = 4,
  Boolean = 5,
  File = 6,
  Color = 7,
  ProductBranch = 8,
  Icon = 9,
  InsuranceCompany = 10,
  MultiLineText = 11,
  InsuranceProduct = 12,
}

/**
 * Base interface for B2C configuration fields
 */
export interface B2CConfigFieldBase {
  readonly name: string;
  readonly labelResourceKey?: string | null;
  readonly descriptionResourceKey?: string | null;
}

/**
 * B2C configuration field for text input
 */
export interface TextB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Text;
}

/**
 * B2C configuration field for multi-line text input
 */
export interface MultiLineTextB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.MultiLineText;
}

/**
 * B2C configuration field for numeric input
 */
export interface NumberB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Number;
}

/**
 * B2C configuration field for boolean input
 */
export interface BooleanB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Boolean;
}

/**
 * B2C configuration field for file upload
 */
export interface FileB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.File;
  readonly allowedExtensions: readonly string[];
}

/**
 * B2C configuration field for color selection
 */
export interface ColorB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Color;
}

/**
 * B2C configuration field for product branch selection
 */
export interface ProductBranchB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.ProductBranch;
}

/**
 * B2C configuration field for icon selection
 */
export interface IconB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Icon;
}

/**
 * B2C configuration field for insurance company selection
 */
export interface InsuranceCompanyB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.InsuranceCompany;
}

/**
 * B2C configuration field for insurance product selection
 */
export interface InsuranceProductB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.InsuranceProduct;
}

/**
 * B2C configuration field for nested objects
 */
export interface ObjectB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Object;
  readonly children: readonly B2CConfigField[];
}

/**
 * B2C configuration field for arrays of items
 */
export interface ArrayB2CConfigField extends B2CConfigFieldBase {
  readonly type: B2CConfigFieldType.Array;
  readonly itemType: B2CConfigField;
}

/**
 * Union type for all B2C configuration fields
 */
export type B2CConfigField =
  | TextB2CConfigField
  | MultiLineTextB2CConfigField
  | NumberB2CConfigField
  | BooleanB2CConfigField
  | FileB2CConfigField
  | ColorB2CConfigField
  | ProductBranchB2CConfigField
  | IconB2CConfigField
  | InsuranceCompanyB2CConfigField
  | InsuranceProductB2CConfigField
  | ObjectB2CConfigField
  | ArrayB2CConfigField;

/**
 * Response containing B2C configuration fields
 */
export interface GetB2CConfigFieldsResult {
  readonly fields: readonly B2CConfigField[];
}

/**
 * Request to update B2C configuration fields
 */
export interface UpdateB2CConfigFieldsRequest {
  readonly fields: readonly B2CConfigField[];
}

// ============================================================================
// MIGRATION TYPES
// ============================================================================

/**
 * Response containing migration result for all agent users
 */
export interface MigrateAllAgentUsersResult {
  readonly migratedCount: number;
}
