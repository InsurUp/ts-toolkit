import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  LogCategory,
  LogCorrelationType,
  LogGroupField,
  MetricDimension,
  MetricMeasure,
  MetricSignal,
} from '@insurup/contracts';
import type {
  CountLogsRequest,
  GetLogFieldValuesRequest,
  GetLogHistogramRequest,
  GetSlowQueriesRequest,
  GetSlowQueryRequest,
  GetSlowQuerySampleRequest,
  GroupLogsRequest,
  QueryMetricsRequest,
  ResolveLogCorrelationRequest,
  SearchLogsRequest,
  SearchTracesRequest,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, problemResponse, setupIntegrationTest } from './setup';
import {
  sampleCapabilities,
  sampleCountLogsResult,
  sampleDatabaseCollection,
  sampleDatabaseCollections,
  sampleGroupLogsResult,
  sampleIgwCall,
  sampleIgwIndexStatus,
  sampleLogCorrelationResult,
  sampleLogFieldValuesResult,
  sampleLogFilter,
  sampleLogHistogramResult,
  sampleQueryMetricsResult,
  sampleSearchLogsResult,
  sampleSearchTracesResult,
  sampleSlowQueriesResult,
  sampleSlowQueryResult,
  sampleSlowQuerySample,
  sampleSpanId,
  sampleTrace,
  sampleTraceId,
  sampleTraceOperations,
  sampleTraceSpanResult,
} from './fixtures/admin-observability';

const t = setupIntegrationTest();
const OBSERVABILITY = `${BASE_URL}/observability`;

describe('AdminObservabilityClient', () => {
  describe('capabilities', () => {
    it('getCapabilities GETs /observability/capabilities and returns the capabilities', async () => {
      let methodSeen: string | undefined;
      server.use(
        http.get(`${OBSERVABILITY}/capabilities`, ({ request }) => {
          methodSeen = request.method;
          return HttpResponse.json(sampleCapabilities);
        })
      );

      const result = await t.client.admin.observability.getCapabilities();

      expect(methodSeen).toBe('GET');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual(sampleCapabilities);
        expect(result.data.slowQueries).toBe(false);
      }
    });
  });

  describe('logs', () => {
    it('searchLogs POSTs the request to /observability/logs/search and returns the page', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/search`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSearchLogsResult);
        })
      );
      const request: SearchLogsRequest = {
        filter: sampleLogFilter,
        category: LogCategory.HttpServer,
        cursor: 'cursor-1',
        limit: 50,
      };

      const result = await t.client.admin.observability.searchLogs(request);

      expect(receivedBody).toEqual({
        filter: {
          from: '2026-10-23T08:00:00+03:00',
          to: '2026-10-23T09:00:00+03:00',
          services: ['core'],
          severities: ['ERROR', 'FATAL'],
        },
        category: 'HTTP_SERVER',
        cursor: 'cursor-1',
        limit: 50,
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.entries[0]?.fields['agent.name']).toBe('Acme');
        expect(result.data.nextCursor).toBe('cursor-2');
      }
    });

    it('searchLogs maps 501 to FeatureNotSupported when no log backend is configured', async () => {
      server.use(
        http.post(`${OBSERVABILITY}/logs/search`, () =>
          problemResponse({
            status: 501,
            type: 'https://api.insurup.com/problems/feature-not-supported',
            title: 'Feature Not Supported',
          })
        )
      );

      const result = await t.client.admin.observability.searchLogs({ filter: sampleLogFilter });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(501);
        expect(result.type).toBe(InsurUpServerErrorType.FeatureNotSupported);
      }
    });

    it('countLogs POSTs the filter wrapped in { filter } to /observability/logs/counts', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/counts`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleCountLogsResult);
        })
      );
      const request: CountLogsRequest = { filter: sampleLogFilter };

      const result = await t.client.admin.observability.countLogs(request);

      expect(receivedBody).toEqual({ filter: sampleLogFilter });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.total).toBe(42);
        expect(result.data.categories[0]?.category).toBe(LogCategory.HttpServer);
      }
    });

    it('getLogHistogram POSTs the request to /observability/logs/histogram', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/histogram`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleLogHistogramResult);
        })
      );
      const request: GetLogHistogramRequest = {
        filter: sampleLogFilter,
        category: LogCategory.All,
        bucketSeconds: null,
      };

      const result = await t.client.admin.observability.getLogHistogram(request);

      expect(receivedBody).toEqual({
        filter: sampleLogFilter,
        category: 'ALL',
        bucketSeconds: null,
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.bucketSeconds).toBe(60);
        expect(result.data.buckets[0]?.errors).toBe(1);
      }
    });

    it('getLogFieldValues POSTs the request to /observability/logs/field-values', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/field-values`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleLogFieldValuesResult);
        })
      );
      const request: GetLogFieldValuesRequest = {
        filter: sampleLogFilter,
        field: 'agent.name',
        limit: 10,
      };

      const result = await t.client.admin.observability.getLogFieldValues(request);

      expect(receivedBody).toEqual({ filter: sampleLogFilter, field: 'agent.name', limit: 10 });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.values[0]).toEqual({ value: 'Acme', hits: 17 });
      }
    });

    it('resolveLogCorrelation POSTs { correlation } to /observability/logs/correlation', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/correlation`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleLogCorrelationResult);
        })
      );
      const request: ResolveLogCorrelationRequest = {
        correlation: { type: LogCorrelationType.Proposal, value: '6718d1f2a3b4c5d6e7f80910' },
      };

      const result = await t.client.admin.observability.resolveLogCorrelation(request);

      expect(receivedBody).toEqual({
        correlation: { type: 'PROPOSAL', value: '6718d1f2a3b4c5d6e7f80910' },
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.found).toBe(true);
        expect(result.data.insurGatewayProposalIds).toEqual([123456]);
        expect(result.data.searchTo).toBeNull();
      }
    });

    it('groupLogs POSTs the request to /observability/logs/groups', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/logs/groups`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleGroupLogsResult);
        })
      );
      const request: GroupLogsRequest = {
        filter: sampleLogFilter,
        category: LogCategory.Database,
        by: [LogGroupField.DbOperation],
        averageDuration: true,
        limit: 5,
      };

      const result = await t.client.admin.observability.groupLogs(request);

      expect(receivedBody).toEqual({
        filter: sampleLogFilter,
        category: 'DATABASE',
        by: ['DB_OPERATION'],
        averageDuration: true,
        limit: 5,
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.groups[0]?.values['dbOperation']).toBe('Insert');
        expect(result.data.groups[0]?.averageDuration).toBe(12.5);
      }
    });
  });

  describe('metrics', () => {
    it('queryMetrics POSTs the request to /observability/metrics/query', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/metrics/query`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleQueryMetricsResult);
        })
      );
      const request: QueryMetricsRequest = {
        service: 'core',
        from: '2026-10-23T08:00:00+03:00',
        to: '2026-10-23T09:00:00+03:00',
        queries: [
          {
            id: 'requests',
            signal: MetricSignal.HttpServer,
            measure: MetricMeasure.Requests,
            groupBy: [MetricDimension.Route],
            filters: [{ dimension: MetricDimension.Method, value: 'POST' }],
            range: true,
          },
        ],
      };

      const result = await t.client.admin.observability.queryMetrics(request);

      expect(receivedBody).toEqual({
        service: 'core',
        from: '2026-10-23T08:00:00+03:00',
        to: '2026-10-23T09:00:00+03:00',
        queries: [
          {
            id: 'requests',
            signal: 'HTTP_SERVER',
            measure: 'REQUESTS',
            groupBy: ['ROUTE'],
            filters: [{ dimension: 'METHOD', value: 'POST' }],
            range: true,
          },
        ],
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.results[0]?.id).toBe('requests');
        expect(result.data.results[0]?.series[0]?.points[0]?.value).toBe(1.5);
      }
    });
  });

  describe('traces', () => {
    it('searchTraces POSTs the request to /observability/traces/search', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/traces/search`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSearchTracesResult);
        })
      );
      const request: SearchTracesRequest = {
        service: 'core',
        operation: 'POST proposals',
        from: '2026-10-23T08:00:00+03:00',
        to: '2026-10-23T09:00:00+03:00',
        minDurationMs: 100,
        errorsOnly: true,
        attributes: { 'http.route': 'proposals' },
      };

      const result = await t.client.admin.observability.searchTraces(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.traces[0]?.traceId).toBe(sampleTraceId);
      }
    });

    it('getTraceOperations GETs /observability/traces/operations with the service in the query', async () => {
      let serviceSeen: string | null | undefined;
      server.use(
        http.get(`${OBSERVABILITY}/traces/operations`, ({ request }) => {
          serviceSeen = new URL(request.url).searchParams.get('service');
          return HttpResponse.json(sampleTraceOperations);
        })
      );

      const result = await t.client.admin.observability.getTraceOperations('auth-server');

      expect(serviceSeen).toBe('auth-server');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.operations).toEqual(['GET proposals', 'POST proposals']);
      }
    });

    it('getTrace embeds the trace ID in the path and returns the trace', async () => {
      let traceIdSeen: unknown;
      server.use(
        http.get(`${OBSERVABILITY}/traces/:traceId`, ({ params }) => {
          traceIdSeen = params.traceId;
          return HttpResponse.json(sampleTrace);
        })
      );

      const result = await t.client.admin.observability.getTrace(sampleTraceId);

      expect(traceIdSeen).toBe(sampleTraceId);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.spans[0]?.kind).toBe('SERVER');
        expect(result.data.logsWithoutSpan).toBeNull();
      }
    });

    it('getTrace maps 404 to ResourceNotFound for a trace the backend does not hold yet', async () => {
      server.use(http.get(`${OBSERVABILITY}/traces/:traceId`, () => notFound('Trace not found')));

      const result = await t.client.admin.observability.getTrace(sampleTraceId);

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
        expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
      }
    });

    it('getTraceSpan embeds both IDs in the path and returns the span with its logs', async () => {
      let paramsSeen: Record<string, unknown> | undefined;
      server.use(
        http.get(`${OBSERVABILITY}/traces/:traceId/spans/:spanId`, ({ params }) => {
          paramsSeen = { ...params };
          return HttpResponse.json(sampleTraceSpanResult);
        })
      );

      const result = await t.client.admin.observability.getTraceSpan(sampleTraceId, sampleSpanId);

      expect(paramsSeen).toEqual({ traceId: sampleTraceId, spanId: sampleSpanId });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.span.spanId).toBe(sampleSpanId);
        expect(result.data.logs).toHaveLength(1);
        expect(result.data.moreLogs).toBe(false);
      }
    });
  });

  describe('InsurGateway calls', () => {
    it('getIgwIndexStatus GETs /observability/igw-calls/index-status', async () => {
      server.use(
        http.get(`${OBSERVABILITY}/igw-calls/index-status`, () =>
          HttpResponse.json(sampleIgwIndexStatus)
        )
      );

      const result = await t.client.admin.observability.getIgwIndexStatus();

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual(sampleIgwIndexStatus);
      }
    });

    it('getIgwCall embeds the numeric log ID in the path and returns both sides', async () => {
      let logIdSeen: unknown;
      server.use(
        http.get(`${OBSERVABILITY}/igw-calls/:logId`, ({ params }) => {
          logIdSeen = params.logId;
          return HttpResponse.json(sampleIgwCall);
        })
      );

      const result = await t.client.admin.observability.getIgwCall(987654);

      expect(logIdSeen).toBe('987654');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.logId).toBe(987654);
        expect(result.data.request?.kind).toBe('XML');
        expect(result.data.response).toBeNull();
      }
    });
  });

  describe('database', () => {
    it('getSlowQueries POSTs the request to /observability/database/slow-queries', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/database/slow-queries`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSlowQueriesResult);
        })
      );
      const request: GetSlowQueriesRequest = {
        from: '2026-10-23T08:00:00+03:00',
        to: '2026-10-23T09:00:00+03:00',
        database: 'core',
        collectionScansOnly: true,
      };

      const result = await t.client.admin.observability.getSlowQueries(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.groups[0]?.plan).toBe('COLLSCAN');
        expect(result.data.collectionScans).toBe(3);
      }
    });

    it('getSlowQuery POSTs the group to /observability/database/slow-queries/detail', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/database/slow-queries/detail`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSlowQueryResult);
        })
      );
      const request: GetSlowQueryRequest = {
        from: '2026-10-23T08:00:00+03:00',
        to: '2026-10-23T09:00:00+03:00',
        database: 'core',
        collection: 'Proposals',
        shapeHash: 'ABC123',
        plan: 'COLLSCAN',
      };

      const result = await t.client.admin.observability.getSlowQuery(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.runs[0]?.logStream).toBe('stream-1');
        expect(result.data.runs[0]?.keysExamined).toBeNull();
      }
    });

    it('getSlowQuerySample POSTs the run to /observability/database/slow-queries/sample', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${OBSERVABILITY}/database/slow-queries/sample`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSlowQuerySample);
        })
      );
      const request: GetSlowQuerySampleRequest = {
        logStream: 'stream-1',
        logTime: '2026-10-23T05:45:00.123456789Z',
      };

      const result = await t.client.admin.observability.getSlowQuerySample(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.collection).toBe('Proposals');
      }
    });

    it('getDatabaseCollections GETs /observability/database/collections', async () => {
      server.use(
        http.get(`${OBSERVABILITY}/database/collections`, () =>
          HttpResponse.json(sampleDatabaseCollections)
        )
      );

      const result = await t.client.admin.observability.getDatabaseCollections();

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.collections[0]?.reads.operations).toBe(500);
        expect(result.data.collections[0]?.commands.averageMilliseconds).toBeNull();
      }
    });

    it('getDatabaseCollection embeds database and collection in the path', async () => {
      let paramsSeen: Record<string, unknown> | undefined;
      server.use(
        http.get(`${OBSERVABILITY}/database/collections/:database/:collection`, ({ params }) => {
          paramsSeen = { ...params };
          return HttpResponse.json(sampleDatabaseCollection);
        })
      );

      const result = await t.client.admin.observability.getDatabaseCollection('core', 'Proposals');

      expect(paramsSeen).toEqual({ database: 'core', collection: 'Proposals' });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.indexes[0]?.name).toBe('_id_');
        expect(result.data.usageAvailable).toBe(true);
      }
    });

    it('getDatabaseCollection maps 404 to ResourceNotFound for an unknown collection', async () => {
      server.use(
        http.get(`${OBSERVABILITY}/database/collections/:database/:collection`, () => notFound())
      );

      const result = await t.client.admin.observability.getDatabaseCollection('core', 'Missing');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
      }
    });
  });
});
