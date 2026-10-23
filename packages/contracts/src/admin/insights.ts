/**
 * @fileoverview Admin Insights Contracts - How agencies use the platform
 * @description TypeScript contracts for the admin panel's `observability/insights/*` endpoints: the platform
 * overview, every agency's activity, one agency's users, the feature matrix, sales, channels, case operations
 * and assistant usage. Mirrors the backend `InsurUp.Api.Contracts.Observability` insights models.
 */

import type { AgentUserState } from '../agents.js';
import type { InsuranceProductType } from '../common.base.js';
import type { SubscriptionStatus } from './agents.js';
import type { Feature, Module } from './subscriptionPlans.js';

// ============================================================================
// Enums
// ============================================================================

/**
 * How long one bucket of an insights series is.
 *
 * Bir içgörü serisindeki tek bir dilimin uzunluğu.
 */
export enum InsightsBucketSize {
  /** An hour; ranges of two days or less. */
  Hour = 'HOUR',
  /** A day in Istanbul. */
  Day = 'DAY',
}

/**
 * Why the insights mark an agent as at risk of leaving.
 *
 * İçgörülerin bir acenteyi ayrılma riski taşıyor olarak işaretleme nedeni.
 */
export enum InsightsAgentRisk {
  /** It opened no proposal in the last 14 days, having opened some before. */
  NoProposals = 'NO_PROPOSALS',
  /** Its activity is at most half of the range before's. */
  ActivityDropped = 'ACTIVITY_DROPPED',
  /** Its active users are at most half of the range before's. */
  FewActiveUsers = 'FEW_ACTIVE_USERS',
  /** Its subscription payment is overdue. */
  PastDue = 'PAST_DUE',
}

/**
 * What a column of the insights feature matrix is, and so which of its `module`, `feature` and `integration` is set.
 *
 * İçgörü özellik matrisindeki bir sütunun ne olduğu; dolayısıyla `module`, `feature` ve `integration` alanlarından
 * hangisinin dolu olduğu.
 */
export enum InsightsFeatureKind {
  /** A subscription {@link Module}. */
  Module = 'MODULE',
  /** A subscription {@link Feature}. */
  Feature = 'FEATURE',
  /** An {@link InsightsFeature}: something an agent sets up or uses that no subscription gates. */
  Integration = 'INTEGRATION',
}

/**
 * What an agent sets up or uses beyond its subscription's modules and features: the integration columns of the
 * feature matrix.
 *
 * Bir acentenin abonelik modülleri ve özellikleri dışında kurduğu veya kullandığı şeyler: özellik matrisinin
 * entegrasyon sütunları.
 */
export enum InsightsFeature {
  /** Webhooks set up, and their deliveries. */
  Webhooks = 'WEBHOOKS',
  /** API clients (OAuth client credentials) set up. */
  ApiClients = 'API_CLIENTS',
  /** Plugins installed, and their invocations. */
  Plugins = 'PLUGINS',
  /** Business partners set up. */
  Partners = 'PARTNERS',
  /** Coverage groups set up, and the proposals that used one. */
  CoverageGroups = 'COVERAGE_GROUPS',
  /** Templates the agent overrode. */
  Templates = 'TEMPLATES',
  /** Policy transfers from insurance companies that ran. */
  PolicyTransfers = 'POLICY_TRANSFERS',
  /** Policies transferred from a file. */
  FilePolicyTransfers = 'FILE_POLICY_TRANSFERS',
  /** Call-center (AloTech) calls. */
  CallCenterCalls = 'CALL_CENTER_CALLS',
  /** Call-center (AloTech) contact flows started. */
  CallCenterFlows = 'CALL_CENTER_FLOWS',
  /** Contact plans (planned calls, meetings) made. */
  Contacts = 'CONTACTS',
  /** Consent verifications (İYS, UDI) requested. */
  ConsentVerifications = 'CONSENT_VERIFICATIONS',
  /** Policies bought online with an asynchronous request, through the agent's own 3-D Secure provider or not. */
  OnlinePolicyPurchases = 'ONLINE_POLICY_PURCHASES',
  /** The insurance companies the agent is connected to. */
  InsuranceCompanies = 'INSURANCE_COMPANIES',
  /** Whether the agent's insurance companies are reached through a robot. */
  Robot = 'ROBOT',
  /** Whether the agent signs its users in through its own identity providers. */
  Sso = 'SSO',
  /** The agent panel screens the agent's users opened. */
  Screens = 'SCREENS',
}

// ============================================================================
// Requests
// ============================================================================

/**
 * The range an insights read covers. Pass the start of a day in Istanbul as `from`: the series are counted in
 * Istanbul days, or in hours for a range of two days or less. At most 366 days; most reads allow less.
 *
 * Bir içgörü okumasının kapsadığı aralık. `from` olarak İstanbul'da bir günün başlangıcını gönderin: seriler
 * İstanbul günlerine, iki gün veya daha kısa aralıklarda saatlere göre sayılır. En fazla 366 gün; çoğu okuma daha
 * kısasına izin verir.
 */
export interface InsightsRangeRequest {
  /** Where the range starts, inclusive (ISO-8601). */
  readonly from: string;
  /** Where the range ends, exclusive (ISO-8601). */
  readonly to: string;
}

/**
 * Reads what happened on the platform, or at one agent, over a range of at most 366 days, with the range before it
 * to compare.
 *
 * En fazla 366 günlük bir aralıkta platformda veya tek bir acentede olanları, karşılaştırma için önceki aralıkla
 * birlikte okur.
 */
export interface GetInsightsOverviewRequest extends InsightsRangeRequest {
  /** The agent to read; null or omitted reads the whole platform. */
  readonly agentId?: string | null;
  /** Whether the platform's figures include the agents marked as test agents (default false). Ignored for one agent. */
  readonly includeTestAgents?: boolean;
}

/**
 * Reads every agent's activity over a range of at most 93 days.
 *
 * En fazla 93 günlük bir aralıkta tüm acentelerin etkinliğini okur.
 */
export type GetInsightsAgentsRequest = InsightsRangeRequest;

/**
 * Reads how one agent's users used the platform over a range of at most 93 days.
 *
 * Bir acentenin kullanıcılarının en fazla 93 günlük bir aralıkta platformu nasıl kullandığını okur.
 */
export interface GetInsightsAgentRequest extends InsightsRangeRequest {
  /** The agent. */
  readonly agentId: string;
}

/**
 * Reads which features each agent is entitled to, has set up and used over a range of at most 93 days.
 *
 * Her acentenin en fazla 93 günlük bir aralıkta hangi özelliklere hakkı olduğunu, hangilerini kurduğunu ve
 * kullandığını okur.
 */
export interface GetInsightsFeaturesRequest extends InsightsRangeRequest {
  /** The one agent to read; null or omitted reads every agent. */
  readonly agentId?: string | null;
}

/**
 * Reads the sales over a range of at most 93 days: insurance companies' quotes, premium, renewals ahead,
 * endorsements.
 *
 * En fazla 93 günlük bir aralıktaki satışları okur: sigorta şirketlerinin fiyatları, prim, yaklaşan yenilemeler,
 * zeyiller.
 */
export interface GetInsightsSalesRequest extends InsightsRangeRequest {
  /** The agent to read; null or omitted reads every agent. */
  readonly agentId?: string | null;
}

/**
 * Reads where the business came from over a range of at most 93 days.
 *
 * En fazla 93 günlük bir aralıkta işin nereden geldiğini okur.
 */
export interface GetInsightsChannelsRequest extends InsightsRangeRequest {
  /** The agent to read; null or omitted reads every agent. */
  readonly agentId?: string | null;
}

/**
 * Reads how the cases were worked over a range of at most 93 days.
 *
 * En fazla 93 günlük bir aralıkta taleplerin nasıl işlendiğini okur.
 */
export interface GetInsightsOperationsRequest extends InsightsRangeRequest {
  /** The agent to read; null or omitted reads every agent. */
  readonly agentId?: string | null;
}

/**
 * Reads how the assistant was used over a range of at most 31 days.
 *
 * En fazla 31 günlük bir aralıkta asistanın nasıl kullanıldığını okur.
 */
export interface GetInsightsAssistantRequest extends InsightsRangeRequest {
  /** The agent to read; null or omitted reads every agent. */
  readonly agentId?: string | null;
}

// ============================================================================
// Shared result parts
// ============================================================================

/**
 * The buckets an insights result's series are counted in.
 *
 * Bir içgörü sonucundaki serilerin sayıldığı dilimler.
 */
export interface InsightsBucketsResult {
  /** How long each bucket is. */
  readonly size: InsightsBucketSize;
  /** The start of each bucket, ascending (ISO-8601); the last ends at the range's end. */
  readonly starts: readonly string[];
}

/**
 * A count over the range, the same count over the range before it, and per bucket.
 *
 * Aralıktaki sayı, hemen önceki aynı uzunluktaki aralıktaki sayı ve dilim başına sayılar.
 */
export interface InsightsMetricResult {
  /** The count over the range. */
  readonly total: number;
  /** The count over the range of the same length just before it. */
  readonly previous: number;
  /** The count per bucket, in the buckets' order. */
  readonly series: readonly number[];
}

/**
 * An amount of Turkish lira over the range, the same over the range before it, and per bucket.
 *
 * Aralıktaki Türk lirası tutarı, hemen önceki aynı uzunluktaki aralıktaki tutar ve dilim başına tutarlar.
 */
export interface InsightsAmountResult {
  /** The amount over the range. */
  readonly total: number;
  /** The amount over the range of the same length just before it. */
  readonly previous: number;
  /** The amount per bucket, in the buckets' order. */
  readonly series: readonly number[];
}

/**
 * How many of something one value of a breakdown has, and how much money where it carries any.
 *
 * Bir kırılımdaki tek bir değerin kaç kayıt içerdiği ve varsa ne kadar tutar taşıdığı.
 */
export interface InsightsShareResult {
  /**
   * The value: an enum member's backend name (e.g. `Kasko`, not the API's `KASKO`), an insurance company's id or
   * name, a path.
   */
  readonly key: string;
  /** How many. */
  readonly count: number;
  /** How much gross premium in Turkish lira, for a breakdown of policies. */
  readonly amountTL: number | null;
}

/**
 * How often one agent panel screen was opened.
 *
 * Bir acente paneli ekranının ne sıklıkla açıldığı.
 */
export interface InsightsScreenUsageResult {
  /** The screen's path, its ids replaced by `{id}`. */
  readonly path: string;
  /** How many times it was opened. */
  readonly views: number;
  /** How many users opened it. */
  readonly users: number;
  /** How many agents' users opened it. */
  readonly agents: number;
}

/**
 * Tokens a model read and wrote.
 *
 * Bir modelin okuduğu ve yazdığı token'lar.
 */
export interface InsightsTokensResult {
  /** The tokens read, cached ones included. */
  readonly input: number;
  /** The tokens written. */
  readonly output: number;
  /** The tokens read from the prompt cache. */
  readonly cachedInput: number;
}

// ============================================================================
// Agents
// ============================================================================

/**
 * An agent's subscription, as the insights show it.
 *
 * İçgörülerde gösterildiği haliyle bir acentenin aboneliği.
 */
export interface InsightsSubscriptionResult {
  /** The plan's id. */
  readonly planId: number | null;
  /** The plan's name. */
  readonly planName: string | null;
  /** Where the subscription stands. */
  readonly status: SubscriptionStatus | null;
  /** What it pays a month, in Turkish lira. */
  readonly monthlyPrice: number | null;
  /** Whether a payment is overdue and being retried. */
  readonly inDunning: boolean;
  /** The insurance companies it may connect; null when it has no limit. */
  readonly insuranceCompanyLimit: number | null;
  /** The proposals it may open a month; null when it has no limit. */
  readonly proposalLimit: number | null;
}

/**
 * How an agent's activity compares with before, and whether it looks like it is leaving.
 *
 * Bir acentenin etkinliğinin öncekiyle karşılaştırması ve ayrılıyor gibi görünüp görünmediği.
 */
export interface InsightsAgentHealthResult {
  /** This range's activity against the range before, in percent; null when there was nothing before. */
  readonly activityPercent: number | null;
  /** Whether the agent looks like it is leaving. */
  readonly atRisk: boolean;
  /** Why it is at risk. */
  readonly reasons: readonly InsightsAgentRisk[];
}

/**
 * One agent's activity over a range.
 *
 * Bir acentenin bir aralıktaki etkinliği.
 */
export interface InsightsAgentRowResult {
  /** The agent. */
  readonly agentId: string;
  /** Its name. */
  readonly name: string;
  /** Whether it is marked as a test agent. */
  readonly isTest: boolean;
  /** Whether it is disabled. */
  readonly disabled: boolean;
  /** When it was created, where its id tells (ISO-8601). */
  readonly createdAt: string | null;
  /** Its subscription. */
  readonly subscription: InsightsSubscriptionResult | null;
  /** The proposals it opened. */
  readonly proposals: number;
  /** The proposals it opened over the range before. */
  readonly proposalsPrevious: number;
  /** The proposals it opened per bucket. */
  readonly proposalSeries: readonly number[];
  /** The proposals it opened that some insurance company quoted. */
  readonly pricedProposals: number;
  /** The proposals it opened that a policy was bought from. */
  readonly purchasedProposals: number;
  /** The policies it produced. */
  readonly policies: number;
  /** The policies it produced over the range before. */
  readonly policiesPrevious: number;
  /** The policies transferred in for it. */
  readonly transferredPolicies: number;
  /** The gross premium of the policies it produced. */
  readonly grossPremiumTL: number;
  /** The gross premium over the range before. */
  readonly grossPremiumTLPrevious: number;
  /** The cases it opened. */
  readonly cases: number;
  /** The customers it added. */
  readonly customers: number;
  /** Its users as seats: active and invited, service accounts left out. */
  readonly users: number;
  /** The users it may have; null when it has no limit. */
  readonly userLimit: number | null;
  /** Its users who used the platform; null where the logs aren't configured. */
  readonly activeUsers: number | null;
  /** Its users who used the platform over the range before. */
  readonly activeUsersPrevious: number | null;
  /** When one of its users last used the platform within the range (ISO-8601). */
  readonly lastActiveAt: string | null;
  /** The prompts its users wrote to the assistant, over at most its last 30 days. */
  readonly assistantPrompts: number | null;
  /** When it opened its first proposal, ever (ISO-8601). */
  readonly firstProposalAt: string | null;
  /** When it got its first policy, ever (ISO-8601). */
  readonly firstPolicyAt: string | null;
  /** The insurance companies it connected. */
  readonly insuranceCompanies: number;
  /** How its activity compares with before. */
  readonly health: InsightsAgentHealthResult;
}

/**
 * What one agent user did over a range.
 *
 * Bir acente kullanıcısının bir aralıkta yaptıkları.
 */
export interface InsightsUserRowResult {
  /** The agent user. */
  readonly userId: string;
  /** Their name. */
  readonly name: string;
  /** Their e-mail address. */
  readonly email: string;
  /** Where their membership stands. */
  readonly state: AgentUserState;
  /** Whether it is an API client's service account. */
  readonly isServiceAccount: boolean;
  /** The proposals they opened. */
  readonly proposals: number;
  /** The proposals they opened that a policy was bought from. */
  readonly purchasedProposals: number;
  /** The policies they produced. */
  readonly policies: number;
  /** The gross premium of the policies they produced. */
  readonly grossPremiumTL: number;
  /** The cases they opened. */
  readonly cases: number;
  /** The Istanbul days they used the platform on. */
  readonly activeDays: number | null;
  /** The requests they made. */
  readonly requests: number | null;
  /** When they last used the platform within the range (ISO-8601). */
  readonly lastActiveAt: string | null;
}

/**
 * Every agent's activity over a range.
 *
 * Tüm acentelerin bir aralıktaki etkinliği.
 */
export interface GetInsightsAgentsResult {
  /** The buckets each agent's series is counted in. */
  readonly buckets: InsightsBucketsResult;
  /** Whether the active users and last activity come from the logs. */
  readonly activityAvailable: boolean;
  /** Every agent, the most proposals first. */
  readonly agents: readonly InsightsAgentRowResult[];
}

/**
 * One agent's users and screens over a range.
 *
 * Bir acentenin bir aralıktaki kullanıcıları ve ekranları.
 */
export interface GetInsightsAgentResult {
  /** The agent's row. */
  readonly agent: InsightsAgentRowResult;
  /** Whether the users' activity and the screens come from the logs. */
  readonly activityAvailable: boolean;
  /** Every user of the agent, the most proposals first. */
  readonly users: readonly InsightsUserRowResult[];
  /** The agent panel screens its users opened, most views first. */
  readonly screens: readonly InsightsScreenUsageResult[];
}

// ============================================================================
// Overview
// ============================================================================

/**
 * The platform's, or one agent's, activity over a range.
 *
 * Platformun veya tek bir acentenin bir aralıktaki etkinliği.
 */
export interface GetInsightsOverviewResult {
  /** The buckets every series is counted in. */
  readonly buckets: InsightsBucketsResult;
  /** The proposals opened. */
  readonly proposals: InsightsMetricResult;
  /** The proposals opened that some insurance company quoted. */
  readonly pricedProposals: InsightsMetricResult;
  /** The proposals opened that a policy was bought from. */
  readonly purchasedProposals: InsightsMetricResult;
  /** The proposals opened with a quote typed in by hand. */
  readonly manualProposals: number;
  /** The policies produced: issued through InsurUp or entered by hand. */
  readonly policies: InsightsMetricResult;
  /** The policies transferred in from insurance companies or files. */
  readonly transferredPolicies: InsightsMetricResult;
  /** The gross premium of the policies produced. */
  readonly grossPremiumTL: InsightsAmountResult;
  /** The commission on the policies produced. */
  readonly commissionTL: InsightsAmountResult;
  /** The cases opened. */
  readonly cases: InsightsMetricResult;
  /** The customers added, test accounts left out. */
  readonly customers: InsightsMetricResult;
  /** The agent users who used the platform; null where the logs aren't configured. */
  readonly activeUsers: InsightsMetricResult | null;
  /** The agents with an active user; null where the logs aren't configured. */
  readonly activeAgents: InsightsMetricResult | null;
  /** The prompts written to the assistant, over at most its last 30 days. */
  readonly assistantPrompts: InsightsMetricResult | null;
  /** The proposals opened per channel. */
  readonly proposalsByChannel: readonly InsightsShareResult[];
  /** The proposals opened per product branch. */
  readonly proposalsByProductBranch: readonly InsightsShareResult[];
  /** The proposals opened per state they are in now. */
  readonly proposalsByState: readonly InsightsShareResult[];
  /** The policies produced per product branch, with their gross premium. */
  readonly policiesByProductBranch: readonly InsightsShareResult[];
  /** The policies produced per channel, with their gross premium. */
  readonly policiesByChannel: readonly InsightsShareResult[];
  /** The cases opened per type. */
  readonly casesByType: readonly InsightsShareResult[];
  /** The cases opened per state they are in now. */
  readonly casesByState: readonly InsightsShareResult[];
  /** The cases opened per channel. */
  readonly casesByChannel: readonly InsightsShareResult[];
  /** The customers added per type. */
  readonly customersByType: readonly InsightsShareResult[];
  /** The customers added per channel they came through. */
  readonly customersByChannel: readonly InsightsShareResult[];
}

// ============================================================================
// Features
// ============================================================================

/**
 * A feature an agent can use: a subscription {@link Module}, a subscription {@link Feature} or an
 * {@link InsightsFeature}, as `kind` says.
 *
 * Bir acentenin kullanabileceği bir özellik: `kind` alanının belirttiği gibi bir abonelik {@link Module}'ü, bir
 * abonelik {@link Feature}'ı veya bir {@link InsightsFeature}.
 */
export interface InsightsFeatureColumnResult {
  /** What it is, and so which of `module`, `feature` and `integration` is set. */
  readonly kind: InsightsFeatureKind;
  /** The subscription module, for a {@link InsightsFeatureKind.Module}. */
  readonly module: Module | null;
  /** The subscription feature, for a {@link InsightsFeatureKind.Feature}. */
  readonly feature: Feature | null;
  /** The integration, for an {@link InsightsFeatureKind.Integration}. */
  readonly integration: InsightsFeature | null;
  /** Whether its use can be measured. */
  readonly measurable: boolean;
}

/**
 * How one agent uses one feature.
 *
 * Bir acentenin tek bir özelliği nasıl kullandığı.
 */
export interface InsightsFeatureCellResult {
  /** Whether its subscription includes the feature; null for one no subscription gates. */
  readonly entitled: boolean | null;
  /** How many of the feature's things it set up, or 1 for a setting that is on. */
  readonly configured: number | null;
  /** How many times it used the feature over the range; null when that can't be measured. */
  readonly used: number | null;
  /** When it last used the feature within the range (ISO-8601). */
  readonly lastUsedAt: string | null;
}

/**
 * One agent's use of every feature.
 *
 * Bir acentenin tüm özellikleri kullanımı.
 */
export interface InsightsFeatureRowResult {
  /** The agent. */
  readonly agentId: string;
  /** Its name. */
  readonly name: string;
  /** Whether it is marked as a test agent. */
  readonly isTest: boolean;
  /** Whether it is disabled. */
  readonly disabled: boolean;
  /** One cell per feature, in {@link GetInsightsFeaturesResult.features}' order. */
  readonly cells: readonly InsightsFeatureCellResult[];
}

/**
 * Every agent's use of every feature over a range.
 *
 * Tüm acentelerin bir aralıkta tüm özellikleri kullanımı.
 */
export interface GetInsightsFeaturesResult {
  /** The features, in the order each row's cells are. */
  readonly features: readonly InsightsFeatureColumnResult[];
  /** One row per agent. */
  readonly agents: readonly InsightsFeatureRowResult[];
  /** The agent panel screens opened over the range, most views first. */
  readonly screens: readonly InsightsScreenUsageResult[];
}

// ============================================================================
// Sales
// ============================================================================

/**
 * How one insurance company quoted, reached one way.
 *
 * Bir sigorta şirketinin, tek bir yolla erişildiğinde nasıl fiyat verdiği.
 */
export interface InsightsInsuranceCompanyResult {
  /** The insurance company. */
  readonly insuranceCompanyId: number;
  /** Its name. */
  readonly name: string;
  /** How it is reached: its web service or a robot. */
  readonly productType: InsuranceProductType;
  /** The products asked of it. */
  readonly products: number;
  /** The products it quoted. */
  readonly priced: number;
  /** The products it failed to quote. */
  readonly failed: number;
  /** The products still waiting for its answer. */
  readonly waiting: number;
  /** The products bought. */
  readonly purchased: number;
  /** Why it failed, the most frequent first. */
  readonly errors: readonly InsightsShareResult[];
}

/**
 * The renewals ahead and made.
 *
 * Yaklaşan ve yapılan yenilemeler.
 */
export interface InsightsRenewalsResult {
  /** The policies ending in the next 30 days. */
  readonly next30Days: number;
  /** The policies ending in the next 60 days. */
  readonly next60Days: number;
  /** The policies ending in the next 90 days. */
  readonly next90Days: number;
  /** The policies ending in the next 90 days, per day from today. */
  readonly next90DaysSeries: readonly number[];
  /** The policies ending in the next 90 days per product branch. */
  readonly byProductBranch: readonly InsightsShareResult[];
  /** The policies ending in the next 90 days per insurance company; the key is the insurance company's name. */
  readonly byInsuranceCompany: readonly InsightsShareResult[];
  /** The policies that ended in the range. */
  readonly endedInRange: number;
  /** The renewal policies produced in the range. */
  readonly renewedInRange: number;
}

/**
 * The sales over a range.
 *
 * Bir aralıktaki satışlar.
 */
export interface GetInsightsSalesResult {
  /** How each insurance company quoted, per way of reaching it. */
  readonly insuranceCompanies: readonly InsightsInsuranceCompanyResult[];
  /** The policies produced per insurance company, with their gross premium; the key is the insurance company's name. */
  readonly premiumByInsuranceCompany: readonly InsightsShareResult[];
  /** The policies produced per product branch, with their gross premium. */
  readonly premiumByProductBranch: readonly InsightsShareResult[];
  /** The renewals ahead and made. */
  readonly renewals: InsightsRenewalsResult;
  /** The policies created in the range per kind of their last version. */
  readonly policiesByVersionType: readonly InsightsShareResult[];
  /** The policies created in the range that are cancelled by now. */
  readonly cancelledPolicies: number;
}

// ============================================================================
// Channels
// ============================================================================

/**
 * The proposals and cases opened per hour of the week, Istanbul time.
 *
 * Haftanın her saatinde (İstanbul saati) açılan teklifler ve talepler.
 */
export interface InsightsHeatmapResult {
  /** Where the weeks counted start (ISO-8601). */
  readonly from: string;
  /** Where they end (ISO-8601). */
  readonly to: string;
  /** The proposals per day of the week (Monday first) and hour. */
  readonly proposals: readonly (readonly number[])[];
  /** The cases per day of the week (Monday first) and hour. */
  readonly cases: readonly (readonly number[])[];
}

/**
 * Where the business came from over a range.
 *
 * Bir aralıkta işin nereden geldiği.
 */
export interface GetInsightsChannelsResult {
  /** The buckets every series is counted in. */
  readonly buckets: InsightsBucketsResult;
  /** The proposals opened per channel. */
  readonly proposalsByChannel: readonly InsightsShareResult[];
  /** The policies produced per channel, with their gross premium. */
  readonly policiesByChannel: readonly InsightsShareResult[];
  /** The customers added per channel. */
  readonly customersByChannel: readonly InsightsShareResult[];
  /** The policies bought online. */
  readonly onlinePurchases: InsightsMetricResult;
  /** The online purchases per outcome. */
  readonly onlinePurchasesByOutcome: readonly InsightsShareResult[];
  /** The online purchases per 3-D Secure provider. */
  readonly onlinePurchasesByThreeDSecure: readonly InsightsShareResult[];
  /** The customers ever sent a website sign-in code. */
  readonly selfServiceCustomers: number;
  /** The customers sent a sign-in code in the range. */
  readonly selfServiceActive: number;
  /** The call-center calls logged as contacts. */
  readonly callCenterCalls: number;
  /** The cases sent to the call center. */
  readonly callCenterFlows: number;
  /** The customers added per type. */
  readonly customersByType: readonly InsightsShareResult[];
  /** The vehicles added. */
  readonly vehicles: number;
  /** The properties added. */
  readonly properties: number;
  /** The pets added. */
  readonly pets: number;
  /** The consent verifications requested, per provider. */
  readonly consentVerifications: readonly InsightsShareResult[];
  /** The contacts planned or logged. */
  readonly contacts: number;
  /** When in the week the proposals and cases were opened. */
  readonly heatmap: InsightsHeatmapResult;
}

// ============================================================================
// Operations
// ============================================================================

/**
 * How the cases were worked over a range.
 *
 * Bir aralıkta taleplerin nasıl işlendiği.
 */
export interface GetInsightsOperationsResult {
  /** The buckets the series are counted in. */
  readonly buckets: InsightsBucketsResult;
  /** The cases open now. */
  readonly open: number;
  /** The open cases per type. */
  readonly openByType: readonly InsightsShareResult[];
  /** The open cases per sub-state. */
  readonly openBySubState: readonly InsightsShareResult[];
  /** The open cases no representative is assigned to. */
  readonly openUnassigned: number;
  /** The cases closed in the range. */
  readonly closed: InsightsMetricResult;
  /** The cases closed as won. */
  readonly won: number;
  /** The cases closed as lost. */
  readonly lost: number;
  /** The median time from opening to closing, in hours. */
  readonly medianHoursToClose: number | null;
  /** The average time from opening to closing, in hours. */
  readonly averageHoursToClose: number | null;
  /** Why the lost cases were lost. */
  readonly lostReasons: readonly InsightsShareResult[];
  /** The cases opened in the range per state they are in now. */
  readonly openedByState: readonly InsightsShareResult[];
  /** The cases opened in the range per channel. */
  readonly openedByChannel: readonly InsightsShareResult[];
}

// ============================================================================
// Assistant
// ============================================================================

/**
 * How one model was used.
 *
 * Tek bir modelin nasıl kullanıldığı.
 */
export interface InsightsAssistantModelResult {
  /** The model. */
  readonly model: string;
  /** The responses it wrote. */
  readonly responses: number;
  /** The tokens it read and wrote. */
  readonly tokens: InsightsTokensResult;
}

/**
 * The changes the assistant proposed through one tool.
 *
 * Asistanın tek bir araç üzerinden önerdiği değişiklikler.
 */
export interface InsightsAssistantActionResult {
  /** The tool. */
  readonly toolName: string;
  /** The changes it proposed. */
  readonly proposed: number;
  /** The ones approved that succeeded. */
  readonly executed: number;
  /** The ones that failed. */
  readonly failed: number;
  /** The ones rejected. */
  readonly rejected: number;
}

/**
 * How one agent used the assistant.
 *
 * Tek bir acentenin asistanı nasıl kullandığı.
 */
export interface InsightsAssistantAgentResult {
  /** The agent. */
  readonly agentId: string;
  /** Its name. */
  readonly name: string;
  /** Whether it has the assistant on. */
  readonly enabled: boolean;
  /** The conversations its users started. */
  readonly conversations: number;
  /** The prompts its users wrote. */
  readonly prompts: number;
  /** Its users who wrote a prompt. */
  readonly users: number;
  /** The tokens its use took. */
  readonly tokens: InsightsTokensResult;
  /** When it last used the assistant (ISO-8601). */
  readonly lastUsedAt: string | null;
}

/**
 * How the assistant was used over a range.
 *
 * Bir aralıkta asistanın nasıl kullanıldığı.
 */
export interface GetInsightsAssistantResult {
  /** The buckets every series is counted in. */
  readonly buckets: InsightsBucketsResult;
  /** The conversations started. */
  readonly conversations: InsightsMetricResult;
  /** The prompts written. */
  readonly prompts: InsightsMetricResult;
  /** The conversations with a message in the range. */
  readonly activeConversations: number;
  /** The users who wrote a prompt. */
  readonly users: number;
  /** The tokens the models read and wrote. */
  readonly tokens: InsightsTokensResult;
  /** Use per model. */
  readonly models: readonly InsightsAssistantModelResult[];
  /** The changes it proposed per tool, and what became of them. */
  readonly actions: readonly InsightsAssistantActionResult[];
  /** The answers rated helpful. */
  readonly feedbackUp: number;
  /** The answers rated unhelpful. */
  readonly feedbackDown: number;
  /** Use per agent. */
  readonly agents: readonly InsightsAssistantAgentResult[];
}
