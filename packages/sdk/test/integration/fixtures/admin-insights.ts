import {
  AgentUserState,
  Feature,
  InsightsAgentRisk,
  InsightsBucketSize,
  InsightsFeature,
  InsightsFeatureKind,
  InsuranceProductType,
  Module,
  SubscriptionStatus,
  type GetInsightsAgentResult,
  type GetInsightsAgentsResult,
  type GetInsightsAssistantResult,
  type GetInsightsChannelsResult,
  type GetInsightsFeaturesResult,
  type GetInsightsOperationsResult,
  type GetInsightsOverviewResult,
  type GetInsightsSalesResult,
  type InsightsAgentRowResult,
  type InsightsBucketsResult,
  type InsightsMetricResult,
  type InsightsRangeRequest,
  type InsightsScreenUsageResult,
  type InsightsTokensResult,
} from '@insurup/contracts';

export const sampleInsightsRange: InsightsRangeRequest = {
  from: '2026-10-01T00:00:00+03:00',
  to: '2026-10-03T00:00:00+03:00',
};

const sampleBuckets: InsightsBucketsResult = {
  size: InsightsBucketSize.Day,
  starts: ['2026-10-01T00:00:00+03:00', '2026-10-02T00:00:00+03:00'],
};

const sampleMetric: InsightsMetricResult = { total: 12, previous: 9, series: [5, 7] };

const sampleTokens: InsightsTokensResult = { input: 1200, output: 340, cachedInput: 800 };

const sampleScreen: InsightsScreenUsageResult = {
  path: '/proposals/{id}',
  views: 40,
  users: 6,
  agents: 2,
};

export const sampleInsightsAgentRow: InsightsAgentRowResult = {
  agentId: 'AGENT-1',
  name: 'Acme Sigorta',
  isTest: false,
  disabled: false,
  createdAt: '2025-01-15T09:00:00+03:00',
  subscription: {
    planId: 3,
    planName: 'Pro',
    status: SubscriptionStatus.PastDue,
    monthlyPrice: 4500.5,
    inDunning: true,
    insuranceCompanyLimit: null,
    proposalLimit: 1000,
  },
  proposals: 12,
  proposalsPrevious: 30,
  proposalSeries: [5, 7],
  pricedProposals: 10,
  purchasedProposals: 3,
  policies: 3,
  policiesPrevious: 4,
  transferredPolicies: 1,
  grossPremiumTL: 15250.75,
  grossPremiumTLPrevious: 20000,
  cases: 2,
  customers: 5,
  users: 4,
  userLimit: null,
  activeUsers: 2,
  activeUsersPrevious: 4,
  lastActiveAt: '2026-10-02T16:30:00+03:00',
  assistantPrompts: null,
  firstProposalAt: '2025-01-16T10:00:00+03:00',
  firstPolicyAt: null,
  insuranceCompanies: 6,
  health: {
    activityPercent: -60,
    atRisk: true,
    reasons: [InsightsAgentRisk.ActivityDropped, InsightsAgentRisk.PastDue],
  },
};

export const sampleInsightsOverview: GetInsightsOverviewResult = {
  buckets: sampleBuckets,
  proposals: sampleMetric,
  pricedProposals: sampleMetric,
  purchasedProposals: sampleMetric,
  manualProposals: 1,
  policies: sampleMetric,
  transferredPolicies: sampleMetric,
  grossPremiumTL: { total: 15250.75, previous: 20000, series: [10000, 5250.75] },
  commissionTL: { total: 1525.08, previous: 2000, series: [1000, 525.08] },
  cases: sampleMetric,
  customers: sampleMetric,
  activeUsers: null,
  activeAgents: sampleMetric,
  assistantPrompts: null,
  proposalsByChannel: [{ key: 'AgentPanel', count: 10, amountTL: null }],
  proposalsByProductBranch: [{ key: 'Kasko', count: 8, amountTL: null }],
  proposalsByState: [],
  policiesByProductBranch: [{ key: 'Kasko', count: 2, amountTL: 12000 }],
  policiesByChannel: [],
  casesByType: [],
  casesByState: [],
  casesByChannel: [],
  customersByType: [],
  customersByChannel: [],
};

export const sampleInsightsAgents: GetInsightsAgentsResult = {
  buckets: sampleBuckets,
  activityAvailable: true,
  agents: [sampleInsightsAgentRow],
};

export const sampleInsightsAgent: GetInsightsAgentResult = {
  agent: sampleInsightsAgentRow,
  activityAvailable: true,
  users: [
    {
      userId: 'AU-1',
      name: 'Ayşe Yılmaz',
      email: 'ayse@acme.com',
      state: AgentUserState.Active,
      isServiceAccount: false,
      proposals: 9,
      purchasedProposals: 2,
      policies: 2,
      grossPremiumTL: 12000,
      cases: 1,
      activeDays: 2,
      requests: 410,
      lastActiveAt: '2026-10-02T16:30:00+03:00',
    },
  ],
  screens: [sampleScreen],
};

export const sampleInsightsFeatures: GetInsightsFeaturesResult = {
  features: [
    {
      kind: InsightsFeatureKind.Module,
      module: Module.Case,
      feature: null,
      integration: null,
      measurable: true,
    },
    {
      kind: InsightsFeatureKind.Feature,
      module: null,
      feature: Feature.B2C,
      integration: null,
      measurable: false,
    },
    {
      kind: InsightsFeatureKind.Integration,
      module: null,
      feature: null,
      integration: InsightsFeature.Webhooks,
      measurable: true,
    },
  ],
  agents: [
    {
      agentId: 'AGENT-1',
      name: 'Acme Sigorta',
      isTest: false,
      disabled: false,
      cells: [
        { entitled: true, configured: null, used: 4, lastUsedAt: '2026-10-02T11:00:00+03:00' },
        { entitled: false, configured: null, used: null, lastUsedAt: null },
        { entitled: null, configured: 2, used: 120, lastUsedAt: '2026-10-02T12:00:00+03:00' },
      ],
    },
  ],
  screens: [sampleScreen],
};

export const sampleInsightsSales: GetInsightsSalesResult = {
  insuranceCompanies: [
    {
      insuranceCompanyId: 7,
      name: 'Anadolu Sigorta',
      productType: InsuranceProductType.WebService,
      products: 40,
      priced: 35,
      failed: 4,
      waiting: 1,
      purchased: 3,
      errors: [{ key: 'Timeout', count: 3, amountTL: null }],
    },
  ],
  premiumByInsuranceCompany: [{ key: 'Anadolu Sigorta', count: 3, amountTL: 15250.75 }],
  premiumByProductBranch: [{ key: 'Kasko', count: 3, amountTL: 15250.75 }],
  renewals: {
    next30Days: 4,
    next60Days: 9,
    next90Days: 15,
    next90DaysSeries: [0, 1, 0],
    byProductBranch: [{ key: 'Trafik', count: 15, amountTL: null }],
    byInsuranceCompany: [{ key: 'Anadolu Sigorta', count: 15, amountTL: null }],
    endedInRange: 2,
    renewedInRange: 1,
  },
  policiesByVersionType: [{ key: 'Endorsement', count: 1, amountTL: null }],
  cancelledPolicies: 0,
};

export const sampleInsightsChannels: GetInsightsChannelsResult = {
  buckets: sampleBuckets,
  proposalsByChannel: [{ key: 'Website', count: 4, amountTL: null }],
  policiesByChannel: [],
  customersByChannel: [],
  onlinePurchases: sampleMetric,
  onlinePurchasesByOutcome: [],
  onlinePurchasesByThreeDSecure: [],
  selfServiceCustomers: 120,
  selfServiceActive: 8,
  callCenterCalls: 30,
  callCenterFlows: 5,
  customersByType: [],
  vehicles: 6,
  properties: 2,
  pets: 1,
  consentVerifications: [{ key: 'Iys', count: 3, amountTL: null }],
  contacts: 11,
  heatmap: {
    from: '2026-09-28T00:00:00+03:00',
    to: '2026-10-05T00:00:00+03:00',
    proposals: [
      [0, 1],
      [2, 0],
    ],
    cases: [
      [1, 0],
      [0, 0],
    ],
  },
};

export const sampleInsightsOperations: GetInsightsOperationsResult = {
  buckets: sampleBuckets,
  open: 14,
  openByType: [{ key: 'Request', count: 10, amountTL: null }],
  openBySubState: [],
  openUnassigned: 3,
  closed: sampleMetric,
  won: 7,
  lost: 5,
  medianHoursToClose: 18.5,
  averageHoursToClose: null,
  lostReasons: [],
  openedByState: [],
  openedByChannel: [],
};

export const sampleInsightsAssistant: GetInsightsAssistantResult = {
  buckets: sampleBuckets,
  conversations: sampleMetric,
  prompts: sampleMetric,
  activeConversations: 6,
  users: 3,
  tokens: sampleTokens,
  models: [{ model: 'claude-sonnet', responses: 20, tokens: sampleTokens }],
  actions: [{ toolName: 'update_customer', proposed: 4, executed: 2, failed: 1, rejected: 1 }],
  feedbackUp: 5,
  feedbackDown: 1,
  agents: [
    {
      agentId: 'AGENT-1',
      name: 'Acme Sigorta',
      enabled: true,
      conversations: 6,
      prompts: 12,
      users: 3,
      tokens: sampleTokens,
      lastUsedAt: null,
    },
  ],
};
