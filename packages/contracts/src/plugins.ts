/**
 * Server-side plugin management contracts. Plugins are vetted JavaScript bundles that run in-process
 * on the host's sandboxed JS engine (per agent), reacting to platform events and, for sync hooks,
 * shaping requests. Hooks and the config schema are derived from the uploaded bundle by the host.
 *
 * Sunucu tarafı eklenti yönetimi sözleşmeleri. Eklentiler, platform olaylarına tepki veren, izin
 * verilmiş JavaScript paketleridir ve ana bilgisayarın korumalı JS motorunda (acente bazında) çalışır.
 */

/**
 * A hook a plugin version implements, serialized as its wire name (matches the backend `PluginHook`,
 * which uses `JsonStringEnumConverter` -> UPPER_SNAKE). Event hooks are `ON_*`; synchronous validation
 * hooks are `VALIDATE_*`; synchronous transformation hooks are `TRANSFORM_*`. Append-only.
 *
 * Bir eklenti sürümünün uyguladığı kanca; tel adıyla (UPPER_SNAKE) temsil edilir.
 */
export enum PluginHook {
  OnProposalCreated = 'ON_PROPOSAL_CREATED',
  OnProposalProductPurchaseAttempted = 'ON_PROPOSAL_PRODUCT_PURCHASE_ATTEMPTED',
  OnProposalProductPremiumReceived = 'ON_PROPOSAL_PRODUCT_PREMIUM_RECEIVED',
  OnProposalProductCoverageReceived = 'ON_PROPOSAL_PRODUCT_COVERAGE_RECEIVED',
  OnPolicyCreatedOrUpdated = 'ON_POLICY_CREATED_OR_UPDATED',
  OnPolicyReceived = 'ON_POLICY_RECEIVED',
  OnAsyncPolicyCreationResponded = 'ON_ASYNC_POLICY_CREATION_RESPONDED',
  OnCustomerUpdated = 'ON_CUSTOMER_UPDATED',
  OnAssetCreated = 'ON_ASSET_CREATED',
  OnAssetUpdated = 'ON_ASSET_UPDATED',
  OnAssetPolicyChanged = 'ON_ASSET_POLICY_CHANGED',
  OnCaseCreated = 'ON_CASE_CREATED',
  OnCaseStateChanged = 'ON_CASE_STATE_CHANGED',
  OnAgentInsuranceCompanyUpdated = 'ON_AGENT_INSURANCE_COMPANY_UPDATED',
  OnAgentInsuranceCompanyRemoved = 'ON_AGENT_INSURANCE_COMPANY_REMOVED',
  OnAgentUserCreated = 'ON_AGENT_USER_CREATED',
  ValidateCustomerCreate = 'VALIDATE_CUSTOMER_CREATE',
  ValidateCustomerUpdate = 'VALIDATE_CUSTOMER_UPDATE',
  ValidateProposalCreate = 'VALIDATE_PROPOSAL_CREATE',
  ValidateProposalProductRevise = 'VALIDATE_PROPOSAL_PRODUCT_REVISE',
  TransformCustomerCreate = 'TRANSFORM_CUSTOMER_CREATE',
  TransformCustomerUpdate = 'TRANSFORM_CUSTOMER_UPDATE',
  TransformIgwProposalCreate = 'TRANSFORM_IGW_PROPOSAL_CREATE',
  TransformIgwPolicyCreate = 'TRANSFORM_IGW_POLICY_CREATE',
  TransformIgwTramer = 'TRANSFORM_IGW_TRAMER',
  TransformIgwMernis = 'TRANSFORM_IGW_MERNIS',
}

/**
 * The execution runtime a plugin version targets.
 *
 * Bir eklenti sürümünün hedeflediği çalışma zamanı.
 */
export enum PluginRuntimeType {
  JavaScriptJint = 'JAVASCRIPT_JINT',
}

/**
 * The outcome of a single plugin invocation.
 *
 * Tek bir eklenti çalıştırmasının sonucu.
 */
export enum PluginOutcome {
  /** Ran to completion. */
  Ok = 'OK',
  /** Threw an unhandled error inside the script. */
  Faulted = 'FAULTED',
  /** Exceeded its wall-clock budget. */
  TimedOut = 'TIMED_OUT',
  /** Exceeded a statement/memory/read/http limit. */
  LimitExceeded = 'LIMIT_EXCEEDED',
  /** Skipped because the plugin's circuit breaker was open. */
  Disabled = 'DISABLED',
}

/**
 * One installed version of a plugin.
 *
 * Bir eklentinin yüklü bir sürümü.
 */
export interface PluginVersion {
  /** Semantic version string. */
  readonly version: string;
  /** The runtime this version targets. */
  readonly runtimeType: PluginRuntimeType;
  /** The plugin contract version this bundle targets. */
  readonly contractVersion: string;
  /** The hooks this version exports. */
  readonly hooks: PluginHook[];
  /** SHA-256 of the bundle that produced this version. */
  readonly bundleHash: string;
  /** The version's config JSON Schema, if it declared one. */
  readonly configSchemaJson: string | null;
  /** When this version was installed (ISO-8601). */
  readonly installedAt: string;
  /** Display name of the user who installed this version. */
  readonly installedByName: string;
}

/**
 * Full plugin detail, including version history. Returned by upload and get-by-id.
 *
 * Sürüm geçmişi dahil tam eklenti detayı.
 */
export interface PluginDetail {
  /** The plugin's persistent id (one per agent + slug). */
  readonly id: string;
  /** The plugin slug (manifest id, reverse-DNS). */
  readonly slug: string;
  /** The currently selected version, or null when none is selected. */
  readonly activeVersion: string | null;
  /** Whether the plugin is currently enabled. */
  readonly enabled: boolean;
  /** Ordering priority for the sequential hooks. */
  readonly priority: number;
  /** The active version's per-agent config, with secret (writeOnly) fields masked. */
  readonly maskedConfigJson: string | null;
  /** When the plugin (slug) was first installed (ISO-8601). */
  readonly createdAt: string;
  /** Every installed version, newest first. */
  readonly versions: PluginVersion[];
}

/**
 * Compact plugin row for list views (one per installed slug).
 *
 * Liste görünümleri için kısa eklenti satırı (yüklü slug başına bir tane).
 */
export interface PluginSummary {
  readonly id: string;
  readonly slug: string;
  readonly activeVersion: string | null;
  readonly enabled: boolean;
  /** How many versions are installed. */
  readonly versionCount: number;
  /** The active version's exported hooks (empty when no active version). */
  readonly hooks: PluginHook[];
  readonly priority: number;
}

/**
 * A console line captured during a plugin invocation (secrets redacted).
 *
 * Bir eklenti çalıştırması sırasında yakalanan konsol satırı (sırlar maskelenir).
 */
export interface PluginConsoleLine {
  /** Severity level (debug | info | warn | error). */
  readonly level: string;
  /** Message text. */
  readonly message: string;
  /** Optional JSON-serialized structured data passed to `ctx.log`. */
  readonly data: string | null;
  /** When the line was emitted (ISO-8601). */
  readonly timestamp: string;
}

/**
 * One persisted plugin invocation log entry.
 *
 * Kalıcı hale getirilmiş bir eklenti çalıştırma günlüğü kaydı.
 */
export interface PluginInvocationLog {
  /** The hook that ran. */
  readonly hook: PluginHook;
  /** The plugin version that ran. */
  readonly pluginVersion: string;
  /** The invocation outcome. */
  readonly outcome: PluginOutcome;
  /** Duration in milliseconds. */
  readonly durationMs: number;
  /** Trace id for joining to platform telemetry. */
  readonly traceId: string;
  /** A sanitized failure reason, if the run failed. */
  readonly failureReason: string | null;
  /** Console lines emitted during the run. */
  readonly console: PluginConsoleLine[];
  /** When the run started (ISO-8601). */
  readonly startedAt: string;
}

/**
 * Selects which installed version is active (also enables the plugin).
 *
 * Hangi yüklü sürümün etkin olduğunu seçer (eklentiyi de etkinleştirir).
 */
export interface ActivatePluginRequest {
  readonly version: string;
}

/**
 * Per-agent config values, validated against the active version's JSON Schema. Secret (writeOnly)
 * fields are encrypted at rest and masked in responses.
 *
 * Acente bazlı yapılandırma değerleri; etkin sürümün JSON Şemasına göre doğrulanır.
 */
export interface UpdatePluginConfigRequest {
  readonly config: Record<string, unknown>;
}

/**
 * Ordering priority for the sequential (validate/mutate/igw) hooks.
 *
 * Sıralı kancalar için öncelik değeri.
 */
export interface SetPluginPriorityRequest {
  readonly priority: number;
}

/**
 * Query options for fetching invocation logs.
 *
 * Çalıştırma günlüklerini getirmek için sorgu seçenekleri.
 */
export interface GetPluginLogsOptions {
  /** Maximum number of entries to return (most recent first). Defaults to 100 server-side. */
  readonly limit?: number;
  /** Optional hook filter (e.g. `PluginHook.OnCustomerUpdated`). */
  readonly hook?: PluginHook;
}
