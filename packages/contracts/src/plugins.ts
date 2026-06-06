/**
 * Server-side plugin management contracts. Plugins are vetted JavaScript bundles that run in-process
 * on the host's sandboxed JS engine (per agent), reacting to platform events and, for sync hooks,
 * shaping requests. Hooks and the config schema are derived from the uploaded bundle by the host.
 *
 * Sunucu tarafı eklenti yönetimi sözleşmeleri. Eklentiler, platform olaylarına tepki veren, izin
 * verilmiş JavaScript paketleridir ve ana bilgisayarın korumalı JS motorunda (acente bazında) çalışır.
 */

/**
 * A hook a plugin version implements, identified by its numeric id (matches the backend `PluginHook`).
 * Event hooks are `on{EventName}` (0-16); sync hooks live in higher bands.
 *
 * Bir eklenti sürümünün uyguladığı kanca; sayısal kimliğiyle tanımlanır.
 */
export enum PluginHook {
  OnProposalCreated = 0,
  OnProposalProductPurchaseAttempted = 1,
  OnProposalProductPremiumReceived = 2,
  OnProposalProductCoverageReceived = 3,
  OnPolicyCreatedOrUpdated = 4,
  OnPolicyReceived = 5,
  OnAsyncPolicyCreationResponded = 6,
  OnCustomerUpdated = 7,
  OnAssetCreated = 8,
  OnAssetUpdated = 9,
  OnAssetPolicyChanged = 10,
  OnCaseCreated = 11,
  OnCaseStateChanged = 12,
  OnAgentCreated = 13,
  OnAgentInsuranceCompanyUpdated = 14,
  OnAgentInsuranceCompanyRemoved = 15,
  OnAgentUserCreated = 16,
  ValidateCustomer = 100_000,
  MutateCustomer = 200_000,
  DecorateIgwRequest = 300_000,
}

/**
 * The execution runtime a plugin version targets.
 *
 * Bir eklenti sürümünün hedeflediği çalışma zamanı.
 */
export enum PluginRuntimeType {
  JavaScriptJint = 1,
}

/**
 * The outcome of a single plugin invocation.
 *
 * Tek bir eklenti çalıştırmasının sonucu.
 */
export enum PluginOutcome {
  /** Ran to completion. */
  Ok = 0,
  /** Threw an unhandled error inside the script. */
  Faulted = 1,
  /** Exceeded its wall-clock budget. */
  TimedOut = 2,
  /** Exceeded a statement/memory/read/http limit. */
  LimitExceeded = 3,
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
  /** The hook export that ran. */
  readonly hookName: string;
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
  /** Optional hook-name filter (e.g. `onCustomerUpdated`). */
  readonly hookName?: string;
}
