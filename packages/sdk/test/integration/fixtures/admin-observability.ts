import { IgwPayloadKind, LogCategory, LogSeverity, SpanKind, SpanStatus } from '@insurup/contracts';
import type {
  CountLogsResult,
  GetDatabaseCollectionResult,
  GetDatabaseCollectionsResult,
  GetIgwCallResult,
  GetIgwIndexStatusResult,
  GetLogFieldValuesResult,
  GetLogHistogramResult,
  GetSlowQueriesResult,
  GetSlowQueryResult,
  GetSlowQuerySampleResult,
  GetTraceOperationsResult,
  GetTraceResult,
  GetTraceSpanResult,
  GroupLogsResult,
  LogEntryResult,
  LogFilterRequest,
  ObservabilityCapabilitiesResult,
  QueryMetricsResult,
  ResolveLogCorrelationResult,
  SearchLogsResult,
  SearchTracesResult,
  TraceSpanResult,
} from '@insurup/contracts';

export const sampleTraceId = '4bf92f3577b34da6a3ce929d0e0e4736';
export const sampleSpanId = '00f067aa0ba902b7';

export const sampleCapabilities: ObservabilityCapabilitiesResult = {
  logs: true,
  logServices: ['core', 'auth-server'],
  metrics: true,
  metricServices: ['core'],
  traces: true,
  traceServices: ['core'],
  igwCalls: true,
  alerting: true,
  slowQueries: false,
  databaseStats: true,
  health: true,
};

export const sampleLogFilter: LogFilterRequest = {
  from: '2026-10-23T08:00:00+03:00',
  to: '2026-10-23T09:00:00+03:00',
  services: ['core'],
  severities: [LogSeverity.Error, LogSeverity.Fatal],
};

export const sampleLogEntry: LogEntryResult = {
  time: '2026-10-23T08:30:00+03:00',
  message: 'Proposal created',
  severity: 'Information',
  service: 'core',
  traceId: sampleTraceId,
  spanId: sampleSpanId,
  component: null,
  module: 'Proposals',
  fields: { 'agent.name': 'Acme' },
};

export const sampleSearchLogsResult: SearchLogsResult = {
  entries: [sampleLogEntry],
  nextCursor: 'cursor-2',
};

export const sampleCountLogsResult: CountLogsResult = {
  total: 42,
  categories: [
    { category: LogCategory.HttpServer, count: 30 },
    { category: LogCategory.Database, count: 12 },
  ],
};

export const sampleLogHistogramResult: GetLogHistogramResult = {
  bucketSeconds: 60,
  buckets: [{ time: '2026-10-23T08:00:00+03:00', count: 5, errors: 1 }],
};

export const sampleLogFieldValuesResult: GetLogFieldValuesResult = {
  values: [{ value: 'Acme', hits: 17 }],
};

export const sampleLogCorrelationResult: ResolveLogCorrelationResult = {
  found: true,
  proposalIds: ['6718d1f2a3b4c5d6e7f80910'],
  policyIds: [],
  insuranceCompanyPolicyNumbers: [],
  insurGatewayProposalIds: [123456],
  insurGatewayReferenceNos: ['REF-1'],
  insurGatewayPolicyRequestIds: [],
  insurGatewayPolicyReferenceNos: [],
  traceCount: 2,
  searchFrom: '2026-10-23T07:55:00+03:00',
  searchTo: null,
};

export const sampleGroupLogsResult: GroupLogsResult = {
  groups: [{ values: { dbOperation: 'Insert' }, count: 8, averageDuration: 12.5 }],
};

export const sampleQueryMetricsResult: QueryMetricsResult = {
  windowSeconds: 3600,
  stepSeconds: 60,
  results: [
    {
      id: 'requests',
      truncated: false,
      series: [
        {
          labels: { route: 'proposals' },
          value: null,
          points: [{ time: '2026-10-23T08:00:00+03:00', value: 1.5 }],
        },
      ],
    },
  ],
};

export const sampleTraceSpan: TraceSpanResult = {
  spanId: sampleSpanId,
  parentSpanId: null,
  service: 'core',
  instance: null,
  version: '1.0.0',
  name: 'POST proposals',
  kind: SpanKind.Server,
  start: '2026-10-23T08:30:00+03:00',
  offsetMs: 0,
  durationMs: 120.4,
  status: SpanStatus.Ok,
  statusMessage: null,
  attributes: [{ key: 'http.route', value: 'proposals', truncated: false }],
  events: [],
  logs: 3,
  errorLogs: 0,
};

export const sampleTrace: GetTraceResult = {
  traceId: sampleTraceId,
  start: '2026-10-23T08:30:00+03:00',
  durationMs: 120.4,
  services: ['core'],
  spans: [sampleTraceSpan],
  omittedSpans: 0,
  logsWithoutSpan: null,
};

export const sampleTraceSpanResult: GetTraceSpanResult = {
  span: sampleTraceSpan,
  logs: [sampleLogEntry],
  moreLogs: false,
};

export const sampleSearchTracesResult: SearchTracesResult = {
  traces: [
    {
      traceId: sampleTraceId,
      start: '2026-10-23T08:30:00+03:00',
      durationMs: 120.4,
      rootService: 'core',
      rootName: 'POST proposals',
      spanCount: 4,
      errorCount: 0,
      services: ['core'],
    },
  ],
};

export const sampleTraceOperations: GetTraceOperationsResult = {
  operations: ['GET proposals', 'POST proposals'],
};

export const sampleIgwIndexStatus: GetIgwIndexStatusResult = {
  indexingEnabled: true,
  indexedUpTo: '2026-10-23T08:59:00+03:00',
};

export const sampleIgwCall: GetIgwCallResult = {
  logId: 987654,
  time: '2026-10-23T08:30:00+03:00',
  request: {
    kind: IgwPayloadKind.Xml,
    body: '<Request><Password>***</Password></Request>',
    size: 512,
    truncated: false,
    operation: 'GetQuote',
    failed: false,
    failure: null,
  },
  response: null,
};

export const sampleSlowQueriesResult: GetSlowQueriesResult = {
  groups: [
    {
      database: 'core',
      collection: 'Proposals',
      shapeHash: 'ABC123',
      plan: 'COLLSCAN',
      count: 3,
      totalMilliseconds: 900,
      averageMilliseconds: 300,
      p95Milliseconds: 450,
      maxMilliseconds: 500,
      documentsExamined: 30000,
      keysExamined: 0,
      returned: 3,
      inMemorySorts: 1,
      lastSeen: '2026-10-23T08:45:00+03:00',
      applications: ['core'],
    },
  ],
  truncated: false,
  total: 3,
  collectionScans: 3,
};

export const sampleSlowQueryResult: GetSlowQueryResult = {
  stepSeconds: 300,
  points: [{ time: '2026-10-23T08:45:00+03:00', count: 3, p95Milliseconds: 450 }],
  runs: [
    {
      time: '2026-10-23T08:45:00+03:00',
      logTime: '2026-10-23T05:45:00.123456789Z',
      logStream: 'stream-1',
      node: 'shard-1',
      application: 'core',
      durationMilliseconds: 500,
      documentsExamined: 10000,
      keysExamined: null,
      returned: 1,
      plan: 'COLLSCAN',
      inMemorySort: false,
    },
  ],
  shape: '{\n  "find": "?"\n}',
  shapeTruncated: false,
};

export const sampleSlowQuerySample: GetSlowQuerySampleResult = {
  time: '2026-10-23T08:45:00+03:00',
  database: 'core',
  collection: 'Proposals',
  command: '{\n  "find": "Proposals"\n}',
  truncated: false,
};

export const sampleDatabaseCollections: GetDatabaseCollectionsResult = {
  readAt: '2026-10-23T09:00:00+03:00',
  collections: [
    {
      database: 'core',
      collection: 'Proposals',
      documents: 1000,
      dataBytes: 2048000,
      storageBytes: 1024000,
      indexBytes: 512000,
      indexes: 4,
      averageDocumentBytes: 2048,
      reads: { operations: 500, averageMilliseconds: 1.2 },
      writes: { operations: 100, averageMilliseconds: 2.5 },
      commands: { operations: 0, averageMilliseconds: null },
    },
  ],
  unreadable: [],
};

export const sampleDatabaseCollection: GetDatabaseCollectionResult = {
  database: 'core',
  collection: 'Proposals',
  readAt: '2026-10-23T09:00:00+03:00',
  usageAvailable: true,
  indexes: [
    {
      name: '_id_',
      keys: '{ "_id": 1 }',
      unique: true,
      sparse: false,
      partial: false,
      expireAfterSeconds: null,
      sizeBytes: 40960,
      uses: 1200,
      usedSince: '2026-10-01T00:00:00+03:00',
    },
  ],
};
