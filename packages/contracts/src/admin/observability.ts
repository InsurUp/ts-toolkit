/**
 * @fileoverview Admin Observability Contracts - Logs, metrics, traces, InsurGateway calls and database statistics
 * @description TypeScript contracts for the admin panel's `observability/*` endpoints: what the environment can
 * show, the log search and its counts, metric queries, traces, InsurGateway's call log, the database's slow
 * queries and its collection statistics. The enums and filters here are shared with the alert contracts.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * How serious a log entry is.
 *
 * Bir log kaydının önem derecesi.
 */
export enum LogSeverity {
  /** The most detailed tracing output. */
  Trace = 'TRACE',
  /** Diagnostic detail. */
  Debug = 'DEBUG',
  /** The normal flow. */
  Information = 'INFORMATION',
  /** Something unexpected that did not stop the work. */
  Warning = 'WARNING',
  /** A failure of the current operation. */
  Error = 'ERROR',
  /** A failure the application can't recover from. */
  Fatal = 'FATAL',
}

/**
 * A kind of log entry the admin panel shows on a tab of its own.
 *
 * Admin panelinin kendi sekmesinde gösterdiği log kaydı türü.
 */
export enum LogCategory {
  /** Every entry. */
  All = 'ALL',
  /** Outbound HTTP calls, successful and failed. */
  HttpClient = 'HTTP_CLIENT',
  /** Inbound HTTP requests. */
  HttpServer = 'HTTP_SERVER',
  /** Messages sent, published and consumed on the bus. */
  MessageBus = 'MESSAGE_BUS',
  /** MediatR requests. */
  MediatR = 'MEDIATR',
  /** Database writes and reads. */
  Database = 'DATABASE',
  /** Entries about an InsurGateway proposal or product. */
  InsurGateway = 'INSURGATEWAY',
  /**
   * The calls InsurGateway made to insurance companies, one entry a call, from core's index of its call log, which
   * no other category includes. A filter's services, agencies and trace don't apply to them; a raw filter or a
   * phrase is read as a value a call carries.
   */
  IgwCalls = 'IGW_CALLS',
  /** The queries the database logged as slow, from its own log. Only alert rules count them. */
  DatabaseSlowQueries = 'DATABASE_SLOW_QUERIES',
  /** The slow queries that read a whole collection with no index; counted by alert rules only. */
  DatabaseCollectionScans = 'DATABASE_COLLECTION_SCANS',
}

/**
 * A log field matching entries can be grouped by.
 *
 * Eşleşen log kayıtlarının gruplanabildiği log alanı.
 */
export enum LogGroupField {
  /** The severity; value key `severity`. */
  Severity = 'SEVERITY',
  /** The infrastructure component; value key `component`. */
  Component = 'COMPONENT',
  /** The module; value key `module`. */
  Module = 'MODULE',
  /** A database write's operation; value key `dbOperation`. */
  DbOperation = 'DB_OPERATION',
  /** The entity a database write changed; value key `dbEntity`. */
  DbEntity = 'DB_ENTITY',
  /** A bus message's operation; value key `messageOperation`. */
  MessageOperation = 'MESSAGE_OPERATION',
  /** A bus message's type; value key `messageType`. */
  MessageType = 'MESSAGE_TYPE',
  /** The queue a bus message went through; value key `messageQueue`. */
  MessageQueue = 'MESSAGE_QUEUE',
  /** The logged text; value key `message`. */
  Message = 'MESSAGE',
  /** The agency; value key `agent`. */
  Agent = 'AGENT',
  /** The database and collection a slow query ran on; value key `dbNamespace`. Slow-query alert rules only. */
  DbNamespace = 'DB_NAMESPACE',
  /**
   * What went wrong, with the values taken out: the exception's type and message, or the logging class and the message
   * of an entry without one, its ids, numbers and quoted values replaced, so one failure about many records is one
   * kind; value key `errorKind`.
   */
  ErrorKind = 'ERROR_KIND',
}

/**
 * A kind of identifier a log search can follow through the platform.
 *
 * Bir log aramasının platform genelinde izleyebildiği tanımlayıcı türü.
 */
export enum LogCorrelationType {
  /** A proposal's id. */
  Proposal = 'PROPOSAL',
  /** A policy's id. */
  Policy = 'POLICY',
  /** InsurGateway's id for a proposal. */
  InsurGatewayProposalId = 'INSURGATEWAY_PROPOSAL_ID',
  /** InsurGateway's reference number for a proposal. */
  InsurGatewayReferenceNo = 'INSURGATEWAY_REFERENCE_NO',
  /** InsurGateway's id for a policy request: the purchase of a premium. */
  InsurGatewayPolicyRequestId = 'INSURGATEWAY_POLICY_REQUEST_ID',
  /** An insurance company's policy number. */
  InsuranceCompanyPolicyNumber = 'INSURANCE_COMPANY_POLICY_NUMBER',
}

/**
 * What a metric is about: the instruments of one part of the platform.
 *
 * Bir metriğin konusu: platformun bir bölümünün ölçüm araçları.
 */
export enum MetricSignal {
  /** Requests a service answered, by route. */
  HttpServer = 'HTTP_SERVER',
  /** Requests a service sent, by host and URL template. */
  HttpClient = 'HTTP_CLIENT',
  /** Messages a service consumed from the bus. */
  MessageBus = 'MESSAGE_BUS',
  /** The .NET runtime of a service. */
  Runtime = 'RUNTIME',
  /** A service's Kestrel connections. */
  Kestrel = 'KESTREL',
  /** A service's SignalR connections. */
  SignalR = 'SIGNALR',
  /** The RabbitMQ broker. */
  RabbitMq = 'RABBITMQ',
  /** The Redis server. */
  Redis = 'REDIS',
  /** The database commands a service ran, by database, collection and operation. */
  Database = 'DATABASE',
  /** A service's database connection pools. */
  DatabasePool = 'DATABASE_POOL',
  /** A service's MongoFlow saves, by vault. */
  DatabaseSaves = 'DATABASE_SAVES',
  /** The integration events a service's outbox holds until they are published to the bus. */
  Outbox = 'OUTBOX',
  /** The proposals a service asked InsurGateway to create, by outcome. */
  ProposalCreations = 'PROPOSAL_CREATIONS',
  /** What each insurance company product of a proposal answered: a premium, a failure, or nothing in time. */
  ProposalPremiums = 'PROPOSAL_PREMIUMS',
  /** The purchases of proposal products, by outcome. */
  ProposalPurchases = 'PROPOSAL_PURCHASES',
  /** The RabbitMQ broker's queues, one by one. */
  RabbitMqQueues = 'RABBITMQ_QUEUES',
  /** The servers, as their node exporter reports them: CPU, memory, disks, filesystems and network. */
  Hosts = 'HOSTS',
  /** The swarm's containers, as cAdvisor reports them: memory against their limit, and OOM kills. */
  Containers = 'CONTAINERS',
  /** The blackbox exporter's probes of the public endpoints: up, how fast, and their certificates. */
  Probes = 'PROBES',
  /** The monitoring itself: the scrape targets Prometheus can't reach, and the samples it can't forward. */
  Monitoring = 'MONITORING',
  /** The MinIO cluster: its drives and capacity. */
  Minio = 'MINIO',
  /** A service's health checks, by check: each one's status and how long it ran. */
  Health = 'HEALTH',
  /** The scheduled jobs, by job: how long ago each last succeeded. */
  Jobs = 'JOBS',
  /** The nightly policy transfer windows, by agent: the failed ones nothing will run again, and the stuck runs. */
  PolicyTransfers = 'POLICY_TRANSFERS',
  /** The agents' webhook deliveries, by agent and outcome. */
  Webhooks = 'WEBHOOKS',
}

/**
 * What is measured; over a time range counts are per second, at one instant the total over the range.
 *
 * Ölçülen değer; bir zaman aralığında sayımlar saniye başınadır, tek bir anda aralığın toplamıdır.
 */
export enum MetricMeasure {
  /** Requests, consumed messages, or proposal creations, premiums and purchases whatever their outcome. */
  Requests = 'REQUESTS',
  /** 5xx responses, messages whose consumer threw, or proposal steps that failed or got no answer in time. */
  Errors = 'ERRORS',
  /** Outgoing requests that got no response. */
  Failures = 'FAILURES',
  /** Message consumptions retried. */
  Retries = 'RETRIES',
  /** Mean duration, ms: of a request, a consumption, or a probe's check. */
  LatencyAverage = 'LATENCY_AVERAGE',
  /** Median duration, ms. */
  LatencyP50 = 'LATENCY_P50',
  /** 95th-percentile duration, ms. */
  LatencyP95 = 'LATENCY_P95',
  /** 99th-percentile duration, ms. */
  LatencyP99 = 'LATENCY_P99',
  /** Mean time between a message's send and its consumption, ms. */
  DeliveryLatencyAverage = 'DELIVERY_LATENCY_AVERAGE',
  /** 95th-percentile time between a message's send and its consumption, ms. */
  DeliveryLatencyP95 = 'DELIVERY_LATENCY_P95',
  /** Requests or consumptions in progress. */
  Active = 'ACTIVE',
  /** Open outgoing connections. */
  OpenConnections = 'OPEN_CONNECTIONS',
  /** Mean wait for an outgoing connection, ms. */
  QueueTimeAverage = 'QUEUE_TIME_AVERAGE',
  /** CPU use: a service's, percent of one core; a server's, percent of all its cores. */
  CpuPercent = 'CPU_PERCENT',
  /** Managed heap after the last collection, bytes. */
  HeapBytes = 'HEAP_BYTES',
  /** Working set, bytes. */
  WorkingSetBytes = 'WORKING_SET_BYTES',
  /** Thread-pool threads. */
  ThreadCount = 'THREAD_COUNT',
  /** Work items waiting for a thread-pool thread. */
  ThreadQueueLength = 'THREAD_QUEUE_LENGTH',
  /** Garbage collections. */
  GcCollections = 'GC_COLLECTIONS',
  /** Time paused for garbage collection, seconds. */
  GcPauseSeconds = 'GC_PAUSE_SECONDS',
  /** Exceptions thrown. */
  Exceptions = 'EXCEPTIONS',
  /** Open inbound connections. */
  ActiveConnections = 'ACTIVE_CONNECTIONS',
  /** Inbound connections waiting to be accepted. */
  QueuedConnections = 'QUEUED_CONNECTIONS',
  /** TLS handshakes in progress. */
  ActiveTlsHandshakes = 'ACTIVE_TLS_HANDSHAKES',
  /** Mean length of a closed connection, seconds. */
  ConnectionDurationAverage = 'CONNECTION_DURATION_AVERAGE',
  /** Messages waiting in queues to be delivered, or events waiting in the outbox to be published. */
  QueueMessages = 'QUEUE_MESSAGES',
  /** Client connections. */
  Connections = 'CONNECTIONS',
  /** Queue consumers. */
  Consumers = 'CONSUMERS',
  /** Channels. */
  Channels = 'CHANNELS',
  /** Messages published. */
  Published = 'PUBLISHED',
  /** Messages delivered. */
  Delivered = 'DELIVERED',
  /** Memory used, bytes. */
  MemoryBytes = 'MEMORY_BYTES',
  /** Key lookups that found the key. */
  KeyspaceHits = 'KEYSPACE_HITS',
  /** Key lookups that didn't. */
  KeyspaceMisses = 'KEYSPACE_MISSES',
  /** Commands processed. */
  Commands = 'COMMANDS',
  /** Keys stored. */
  Keys = 'KEYS',
  /**
   * The share of requests answered with a 5xx status, of consumed messages whose consumer threw, or of proposal
   * steps that failed or got no answer in time, in percent.
   */
  ErrorPercent = 'ERROR_PERCENT',
  /** 95th-percentile wait of a database checkout for a connection, ms. */
  QueueTimeP95 = 'QUEUE_TIME_P95',
  /** Database checkouts that gave up waiting for a connection, or proposal steps that got no answer in time. */
  Timeouts = 'TIMEOUTS',
  /** Database connections lent out. */
  PoolUsed = 'POOL_USED',
  /** Database connections open and not lent out. */
  PoolIdle = 'POOL_IDLE',
  /** The most database connections a pool may hold. */
  PoolMax = 'POOL_MAX',
  /** Database checkouts waiting for a connection. */
  PoolPending = 'POOL_PENDING',
  /** Documents a save inserted, replaced, updated or deleted. */
  Writes = 'WRITES',
  /** How long the oldest event in the outbox has waited to be published, seconds; 0 when it is empty. */
  OldestAgeSeconds = 'OLDEST_AGE_SECONDS',
  /** Messages delivered to a consumer and not yet acknowledged. */
  UnackedMessages = 'UNACKED_MESSAGES',
  /**
   * Messages MassTransit moved to an `_error` queue after every retry failed, or to a `_skipped` queue for having
   * no consumer: nothing consumes them again until someone moves them back.
   */
  ParkedMessages = 'PARKED_MESSAGES',
  /** Memory in use, percent: of a server's, of a container's limit, or of Redis's maxmemory. */
  MemoryUsedPercent = 'MEMORY_USED_PERCENT',
  /** Space in use, percent: of a filesystem, or of the MinIO cluster's usable capacity. */
  DiskUsedPercent = 'DISK_USED_PERCENT',
  /** The share of time a disk was busy with I/O, percent. */
  DiskBusyPercent = 'DISK_BUSY_PERCENT',
  /** Filesystems mounted read-only. */
  ReadOnlyFilesystems = 'READ_ONLY_FILESYSTEMS',
  /** Network packets received or sent with an error. */
  NetworkErrors = 'NETWORK_ERRORS',
  /** Containers the kernel killed for running out of memory. */
  OomKills = 'OOM_KILLS',
  /** Probes whose last check failed. */
  FailingProbes = 'FAILING_PROBES',
  /** Days until the earliest certificate a probe was served expires; negative once it has. */
  CertificateDaysLeft = 'CERTIFICATE_DAYS_LEFT',
  /** Scrape targets Prometheus couldn't reach at its last attempt. */
  TargetsDown = 'TARGETS_DOWN',
  /** Samples Prometheus failed to forward to its remote-write targets. */
  RemoteWriteFailures = 'REMOTE_WRITE_FAILURES',
  /** Drives the MinIO cluster reports offline. */
  OfflineDrives = 'OFFLINE_DRIVES',
  /** Redis's connected clients, percent of its maxclients. */
  ConnectionsPercent = 'CONNECTIONS_PERCENT',
  /** RabbitMQ's resource alarms raised: memory high watermark, free disk low, file descriptors exhausted. */
  ResourceAlarms = 'RESOURCE_ALARMS',
  /** The worst status of a health check across what a series groups: 0 Unhealthy, 1 Degraded, 2 Healthy. */
  Status = 'STATUS',
  /** How long a health check ran: its average over the window, the longest of the instances a series groups, ms. */
  CheckDuration = 'CHECK_DURATION',
  /**
   * The containers a swarm service's busiest replica slot started within the window, stopped ones included. A deploy
   * starts each slot once, so a slot that started more is restarting.
   */
  Restarts = 'RESTARTS',
  /** The log entries VictoriaLogs took in over the window; with none, every log rule is blind. */
  LogsIngested = 'LOGS_INGESTED',
  /** How long ago a scheduled job last succeeded, s: it keeps growing while the job fails, hangs or isn't run. */
  LastSuccessAgeSeconds = 'LAST_SUCCESS_AGE_SECONDS',
  /** The policy transfer windows whose last run failed in the last day and won't run again. */
  FailedWindows = 'FAILED_WINDOWS',
  /** The policy transfer runs left Started for hours. */
  StuckTriggers = 'STUCK_TRIGGERS',
}

/**
 * A label a measure can be broken down or filtered by.
 *
 * Bir ölçümün kırılabildiği veya filtrelenebildiği etiket.
 */
export enum MetricDimension {
  /** Route template of an answered request; label key `route`. */
  Route = 'ROUTE',
  /** HTTP method; label key `method`. */
  Method = 'METHOD',
  /** HTTP status code; label key `statusCode`. */
  StatusCode = 'STATUS_CODE',
  /** Host of an outgoing request; label key `host`. */
  Host = 'HOST',
  /** Path of an outgoing request with its ids replaced by `{id}`; label key `urlTemplate`. */
  UrlTemplate = 'URL_TEMPLATE',
  /** Why an outgoing request failed; label key `errorType`. */
  ErrorType = 'ERROR_TYPE',
  /** The consumer that handled a message; label key `consumer`. */
  Consumer = 'CONSUMER',
  /** The type of a consumed message; label key `messageType`. */
  MessageType = 'MESSAGE_TYPE',
  /** The queue a message was consumed from; label key `destination`. */
  Destination = 'DESTINATION',
  /** The exception a consumer threw; label key `exceptionType`. */
  ExceptionType = 'EXCEPTION_TYPE',
  /** One replica of the service, a server, or the URL a probe checks; label key `instance`. */
  Instance = 'INSTANCE',
  /** The database a command ran on; label key `database`. */
  Database = 'DATABASE',
  /** The collection a command ran on; label key `collection`. */
  Collection = 'COLLECTION',
  /** The database command; label key `operation`. */
  Operation = 'OPERATION',
  /** A database connection pool; label key `pool`. */
  Pool = 'POOL',
  /** The MongoFlow vault a save went through; label key `vault`. */
  Vault = 'VAULT',
  /** What a save's write did to a document; label key `writeKind`. */
  WriteKind = 'WRITE_KIND',
  /** A proposal's product branch, such as `Kasko`; label key `productBranch`. */
  ProductBranch = 'PRODUCT_BRANCH',
  /** The insurance company a premium or purchase was with, by name; label key `insuranceCompany`. */
  InsuranceCompany = 'INSURANCE_COMPANY',
  /** How a proposal step ended: `succeeded`, `failed`, or `timed_out`; label key `outcome`. */
  Outcome = 'OUTCOME',
  /** Whether a purchase was answered on the spot or after a 3-D Secure payment; label key `purchaseMode`. */
  PurchaseMode = 'PURCHASE_MODE',
  /** A RabbitMQ queue; label key `queue`. */
  Queue = 'QUEUE',
  /** Where a filesystem is mounted; label key `mountpoint`. */
  Mountpoint = 'MOUNTPOINT',
  /** A disk or network device; label key `device`. */
  Device = 'DEVICE',
  /** The swarm service a container belongs to; label key `swarmService`. */
  SwarmService = 'SWARM_SERVICE',
  /** The scrape job a target belongs to; label key `job`. */
  Job = 'JOB',
  /** A health check, such as `mongo` or `auth-server`; label key `healthCheck`. */
  HealthCheck = 'HEALTH_CHECK',
  /** A scheduled job, by its type's full name; label key `jobName`. */
  JobName = 'JOB_NAME',
  /** An agent, by its ID; label key `agent`. */
  Agent = 'AGENT',
}

/**
 * The form a payload of an InsurGateway call to an insurance company takes.
 *
 * InsurGateway'in bir sigorta şirketine yaptığı çağrıdaki içeriğin biçimi.
 */
export enum IgwPayloadKind {
  /** Nothing, or nothing readable. */
  Empty = 'EMPTY',
  /** XML, SOAP included. */
  Xml = 'XML',
  /** JSON. */
  Json = 'JSON',
  /** Plain text: a query string, or a message. */
  Text = 'TEXT',
}

/**
 * The role a span plays in its trace, as OpenTelemetry names it.
 *
 * Bir span'in trace içindeki rolü (OpenTelemetry adlandırmasıyla).
 */
export enum SpanKind {
  /** The span didn't say. */
  Unspecified = 'UNSPECIFIED',
  /** Work inside the service. */
  Internal = 'INTERNAL',
  /** A request the service answered. */
  Server = 'SERVER',
  /** A request the service sent, such as an HTTP call or a database command. */
  Client = 'CLIENT',
  /** A message the service sent or published. */
  Producer = 'PRODUCER',
  /** A message the service received. */
  Consumer = 'CONSUMER',
}

/**
 * How a span ended.
 *
 * Bir span'in nasıl sonlandığı.
 */
export enum SpanStatus {
  /** The span set no status: it neither succeeded nor failed explicitly. */
  Unset = 'UNSET',
  /** The span succeeded. */
  Ok = 'OK',
  /** The span failed. */
  Error = 'ERROR',
}

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

/**
 * What the admin panel can show in this environment.
 *
 * Admin panelinin bu ortamda gösterebildikleri.
 */
export interface ObservabilityCapabilitiesResult {
  /** Whether a log backend is configured, so the log endpoints answer instead of refusing. */
  readonly logs: boolean;
  /** The services whose logs can be searched, by their `service.name`. */
  readonly logServices: readonly string[];
  /** Whether a metrics backend is configured, so the metric endpoints answer instead of refusing. */
  readonly metrics: boolean;
  /** The services whose metrics can be queried, by their `job`. */
  readonly metricServices: readonly string[];
  /** Whether a trace backend is configured, so the trace endpoints answer instead of refusing. */
  readonly traces: boolean;
  /** The services whose traces can be searched, by their `service.name`. */
  readonly traceServices: readonly string[];
  /** Whether InsurGateway's call log is configured, so its calls can be listed and read one by one. */
  readonly igwCalls: boolean;
  /** Whether this environment evaluates alert rules, so the alert endpoints answer instead of refusing. */
  readonly alerting: boolean;
  /** Whether the database's slow-query log is readable, so the slow-query endpoints answer. */
  readonly slowQueries: boolean;
  /** Whether the database's collection and index statistics are read here. */
  readonly databaseStats: boolean;
  /** Whether the apps' health checks can be read, through the metrics endpoint's `HEALTH` signal. */
  readonly health: boolean;
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

/**
 * An identifier a log search follows through the platform.
 *
 * Bir log aramasının platform genelinde izlediği tanımlayıcı.
 */
export interface LogCorrelationRequest {
  /** What the identifier is. */
  readonly type: LogCorrelationType;
  /**
   * The identifier: 24 hexadecimal digits for a proposal or policy, a positive number for an InsurGateway
   * proposal or policy request id.
   */
  readonly value: string;
}

/**
 * Which log entries a log operation looks at. Every condition that is set must hold.
 *
 * Bir log işleminin hangi kayıtlara baktığı. Belirtilen her koşul sağlanmalıdır.
 */
export interface LogFilterRequest {
  /** The start of the time range, inclusive (ISO-8601). */
  readonly from: string;
  /** The end of the time range, exclusive (ISO-8601); at most the configured number of days after `from`. */
  readonly to: string;
  /** The services to search, by `service.name`; empty searches every searchable service. */
  readonly services?: readonly string[];
  /** The severities to keep; empty keeps all of them. */
  readonly severities?: readonly LogSeverity[];
  /** The agencies to keep, by their logged name; empty keeps every agency and the entries without one. */
  readonly agents?: readonly string[];
  /** A phrase the message must contain. Masked in the API's own request log. */
  readonly text?: string | null;
  /** The trace whose entries to keep: 16 or 32 hexadecimal digits. */
  readonly traceId?: string | null;
  /**
   * An identifier whose whole story to keep: the entries of every trace that created or changed the proposals,
   * policies and InsurGateway records it leads to.
   */
  readonly correlation?: LogCorrelationRequest | null;
  /**
   * An extra LogsQL filter expression, without pipes outside parentheses. Needs the `observability:raw-query`
   * permission. Masked in the API's own request log.
   */
  readonly rawFilter?: string | null;
}

/**
 * Reads one page of log entries, newest first.
 *
 * Log kayıtlarının bir sayfasını en yeniden başlayarak okur.
 */
export interface SearchLogsRequest {
  /** Which entries to look at. */
  readonly filter: LogFilterRequest;
  /** The kind of entry to keep; `ALL` when left out. */
  readonly category?: LogCategory;
  /** The previous page's `nextCursor`; null for the first page. */
  readonly cursor?: string | null;
  /** How many entries to return at most; 200 when left out. */
  readonly limit?: number;
}

/**
 * One log entry.
 *
 * Tek bir log kaydı.
 */
export interface LogEntryResult {
  /** When it was logged (ISO-8601). */
  readonly time: string;
  /** The rendered message. */
  readonly message: string;
  /** The severity as logged, such as `Error`. */
  readonly severity: string | null;
  /** The service that logged it. */
  readonly service: string | null;
  /** The trace it belongs to. */
  readonly traceId: string | null;
  /** The span it was logged in. */
  readonly spanId: string | null;
  /** The infrastructure component that logged it, such as `http_server`. */
  readonly component: string | null;
  /** The module that logged it. */
  readonly module: string | null;
  /** Every structured field of the entry, by name, the ones above included. */
  readonly fields: Readonly<Record<string, string>>;
}

/**
 * One page of log entries.
 *
 * Log kayıtlarının bir sayfası.
 */
export interface SearchLogsResult {
  /** The entries, newest first. */
  readonly entries: readonly LogEntryResult[];
  /** The cursor of the next page; null when this page is the last. */
  readonly nextCursor: string | null;
}

/**
 * Counts every log entry the filter matches, in total and per category.
 *
 * Filtreyle eşleşen tüm log kayıtlarını toplamda ve kategori bazında sayar.
 */
export interface CountLogsRequest {
  /** Which entries to count. */
  readonly filter: LogFilterRequest;
}

/**
 * How many matching entries one category has.
 *
 * Bir kategorideki eşleşen kayıt sayısı.
 */
export interface LogCategoryCountResult {
  /** The category; never `ALL`. */
  readonly category: LogCategory;
  /** Its matching entries. */
  readonly count: number;
}

/**
 * The exact number of matching log entries.
 *
 * Eşleşen log kayıtlarının kesin sayısı.
 */
export interface CountLogsResult {
  /** Every matching entry. */
  readonly total: number;
  /** The matching entries of each category other than `ALL`. */
  readonly categories: readonly LogCategoryCountResult[];
}

/**
 * Counts the matching log entries per time bucket, with the errors among them.
 *
 * Eşleşen log kayıtlarını zaman dilimi başına, aralarındaki hatalarla birlikte sayar.
 */
export interface GetLogHistogramRequest {
  /** Which entries to count. */
  readonly filter: LogFilterRequest;
  /** The kind of entry to count; `ALL` when left out. */
  readonly category?: LogCategory;
  /** The width of a bucket in seconds; null picks one that gives about a hundred buckets. */
  readonly bucketSeconds?: number | null;
}

/**
 * The matching log entries of one time bucket.
 *
 * Bir zaman dilimindeki eşleşen log kayıtları.
 */
export interface LogHistogramBucketResult {
  /** The start of the bucket (ISO-8601). */
  readonly time: string;
  /** Every matching entry in the bucket. */
  readonly count: number;
  /** The entries among them whose severity is `ERROR` or worse. */
  readonly errors: number;
}

/**
 * The matching log entries over time.
 *
 * Eşleşen log kayıtlarının zaman içindeki dağılımı.
 */
export interface GetLogHistogramResult {
  /** The width of each bucket in seconds. */
  readonly bucketSeconds: number;
  /** The buckets in time order, empty ones included. */
  readonly buckets: readonly LogHistogramBucketResult[];
}

/**
 * Lists the distinct values one log field takes among the matching entries, most frequent first.
 *
 * Bir log alanının eşleşen kayıtlarda aldığı farklı değerleri en sık olandan başlayarak listeler.
 */
export interface GetLogFieldValuesRequest {
  /** Which entries to look at. */
  readonly filter: LogFilterRequest;
  /** The field, such as `agent.name`. */
  readonly field: string;
  /** How many values to return at most; 100 when left out. */
  readonly limit?: number;
}

/**
 * One value of a log field.
 *
 * Bir log alanının tek bir değeri.
 */
export interface LogFieldValueResult {
  /** The value. */
  readonly value: string;
  /** How many matching entries carry it. */
  readonly hits: number;
}

/**
 * The values a log field takes.
 *
 * Bir log alanının aldığı değerler.
 */
export interface GetLogFieldValuesResult {
  /** The values, most frequent first. */
  readonly values: readonly LogFieldValueResult[];
}

/**
 * Finds the records an identifier leads to, and when a log search for it should look.
 *
 * Bir tanımlayıcının ulaştığı kayıtları ve onun için yapılacak log aramasının hangi zaman aralığına bakması
 * gerektiğini bulur.
 */
export interface ResolveLogCorrelationRequest {
  /** The identifier. */
  readonly correlation: LogCorrelationRequest;
}

/**
 * The records an identifier leads to: the proposal, its policies and the InsurGateway requests behind them. A
 * search with the identifier keeps the entries of every trace that created or changed one of them.
 *
 * Bir tanımlayıcının ulaştığı kayıtlar: teklif, poliçeleri ve arkalarındaki InsurGateway istekleri. Tanımlayıcıyla
 * yapılan bir arama, bunlardan birini oluşturan veya değiştiren her trace'in kayıtlarını tutar.
 */
export interface ResolveLogCorrelationResult {
  /** Whether any record was found. A search still finds the entries that name the identifier itself. */
  readonly found: boolean;
  /** The proposals. */
  readonly proposalIds: readonly string[];
  /** The policies. */
  readonly policyIds: readonly string[];
  /** The insurance companies' numbers of the policies. */
  readonly insuranceCompanyPolicyNumbers: readonly string[];
  /** InsurGateway's ids for the proposals sent for them. */
  readonly insurGatewayProposalIds: readonly number[];
  /** InsurGateway's reference numbers for the proposals sent for them. */
  readonly insurGatewayReferenceNos: readonly string[];
  /** InsurGateway's ids for the policy requests that bought their premiums. */
  readonly insurGatewayPolicyRequestIds: readonly number[];
  /** InsurGateway's reference numbers for those policy requests. */
  readonly insurGatewayPolicyReferenceNos: readonly string[];
  /** How many traces the records name themselves, besides the ones their database writes were logged in. */
  readonly traceCount: number;
  /** Where a search should start (ISO-8601): shortly before the earliest record was created; null when nothing was found. */
  readonly searchFrom: string | null;
  /** Where that search should end (ISO-8601): now, or as far after its start as a search may reach. */
  readonly searchTo: string | null;
}

/**
 * Lists how many matching log entries each combination of some fields' values has, most first.
 *
 * Bazı alanların her değer kombinasyonu için eşleşen log kaydı sayısını en çoktan başlayarak listeler.
 */
export interface GroupLogsRequest {
  /** Which entries to look at. */
  readonly filter: LogFilterRequest;
  /** The kind of entry to keep; `ALL` when left out. */
  readonly category?: LogCategory;
  /** The fields to group by, one to three. */
  readonly by: readonly LogGroupField[];
  /** Whether the entries lacking one of the fields count, as a group with an empty value. */
  readonly includeMissing?: boolean;
  /** Whether to average the entries' logged `duration` in each group. */
  readonly averageDuration?: boolean;
  /** Whether only the entries that logged a `duration` count: one per finished operation. */
  readonly timedOnly?: boolean;
  /** How many groups to return at most; 20 when left out. */
  readonly limit?: number;
}

/**
 * The entries sharing one combination of values.
 *
 * Aynı değer kombinasyonunu paylaşan kayıtlar.
 */
export interface LogGroupResult {
  /** The grouped fields' values, keyed as the `LogGroupField` members document (e.g. `dbOperation`). */
  readonly values: Readonly<Record<string, string>>;
  /** How many entries. */
  readonly count: number;
  /** Their mean logged duration, when asked for and any of them logged one. */
  readonly averageDuration: number | null;
}

/**
 * The groups of a log grouping, largest first.
 *
 * Bir log gruplamasının grupları, en büyükten başlayarak.
 */
export interface GroupLogsResult {
  /** The groups. */
  readonly groups: readonly LogGroupResult[];
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * A label value a measure is narrowed to.
 *
 * Bir ölçümün daraltıldığı etiket değeri.
 */
export interface MetricFilterRequest {
  /** The label. */
  readonly dimension: MetricDimension;
  /** The value, matched exactly. */
  readonly value: string;
}

/**
 * One thing to measure.
 *
 * Ölçülecek tek bir şey.
 */
export interface MetricQueryRequest {
  /** The caller's name for the query, returned with its result: 1 to 50 letters, digits, - or _. */
  readonly id: string;
  /** What the metric is about. */
  readonly signal: MetricSignal;
  /** What is measured. */
  readonly measure: MetricMeasure;
  /** The labels to break the measure down by, at most three. */
  readonly groupBy?: readonly MetricDimension[];
  /** Label values every counted sample must have, at most five. */
  readonly filters?: readonly MetricFilterRequest[];
  /** A series over the time range when true; one value for the whole range otherwise. */
  readonly range?: boolean;
}

/**
 * Runs metric queries over one service and time range. Each query names what to measure; the backend builds the
 * PromQL itself.
 *
 * Tek bir servis ve zaman aralığı üzerinde metrik sorguları çalıştırır. Her sorgu neyin ölçüleceğini belirtir;
 * PromQL'i backend kendisi oluşturur.
 */
export interface QueryMetricsRequest {
  /** The service, by its `job`; one of the capabilities' `metricServices`. `core` when left out. */
  readonly service?: string;
  /** The start of the time range (ISO-8601). */
  readonly from: string;
  /** The end of the time range (ISO-8601): where instant queries are evaluated. */
  readonly to: string;
  /** The queries, at most twenty; results come back in the same order. */
  readonly queries: readonly MetricQueryRequest[];
}

/**
 * One point of a range series.
 *
 * Bir aralık serisinin tek bir noktası.
 */
export interface MetricPointResult {
  /** When (ISO-8601). */
  readonly time: string;
  /** The value; null when there was nothing to compute it from. */
  readonly value: number | null;
}

/**
 * One series of a metric query.
 *
 * Bir metrik sorgusunun tek bir serisi.
 */
export interface MetricSeriesResult {
  /** The grouped labels' values, keyed as the `MetricDimension` members document (e.g. `route`, `urlTemplate`). */
  readonly labels: Readonly<Record<string, string>>;
  /** The value of an instant query; null when there was nothing to compute it from. */
  readonly value: number | null;
  /** The points of a range query. */
  readonly points: readonly MetricPointResult[];
}

/**
 * What one metric query found.
 *
 * Tek bir metrik sorgusunun bulduğu sonuç.
 */
export interface MetricQueryResult {
  /** The query's id. */
  readonly id: string;
  /** One series per combination of the grouped labels, largest first. */
  readonly series: readonly MetricSeriesResult[];
  /** Whether more series matched than are returned. */
  readonly truncated: boolean;
}

/**
 * The results of a metric request.
 *
 * Bir metrik isteğinin sonuçları.
 */
export interface QueryMetricsResult {
  /** The length of the time range in seconds: the window instant counts cover. */
  readonly windowSeconds: number;
  /** The distance between two points of a range series, in seconds. */
  readonly stepSeconds: number;
  /** One result per query, in the order asked. */
  readonly results: readonly MetricQueryResult[];
}

// ---------------------------------------------------------------------------
// Traces
// ---------------------------------------------------------------------------

/**
 * Finds the traces of one service that match some conditions in a time range, newest first.
 *
 * Bir servisin, zaman aralığında koşullara uyan trace'lerini en yeniden başlayarak bulur.
 */
export interface SearchTracesRequest {
  /** The service a matching span must belong to. */
  readonly service: string;
  /** The name a matching span must have, such as `POST proposals`; any when null. */
  readonly operation?: string | null;
  /** The start of the time range (ISO-8601). */
  readonly from: string;
  /** The end of the time range (ISO-8601). */
  readonly to: string;
  /** The shortest a matching span may take, in milliseconds. */
  readonly minDurationMs?: number | null;
  /** The longest a matching span may take, in milliseconds. */
  readonly maxDurationMs?: number | null;
  /** Whether only a span that failed matches. */
  readonly errorsOnly?: boolean;
  /** Attribute values a matching span must have, such as `http.route` = `proposals`; at most five. */
  readonly attributes?: Readonly<Record<string, string>>;
  /** How many traces to return at most, up to 50; 20 when left out. */
  readonly limit?: number;
}

/**
 * What a trace is at a glance.
 *
 * Bir trace'in özet görünümü.
 */
export interface TraceSummaryResult {
  /** The trace ID, in lower case. */
  readonly traceId: string;
  /** When its earliest span started (ISO-8601). */
  readonly start: string;
  /** From its earliest span's start to its latest span's end, in milliseconds. */
  readonly durationMs: number;
  /** The service of its root span. */
  readonly rootService: string;
  /** The name of its root span. */
  readonly rootName: string;
  /** How many spans it has. */
  readonly spanCount: number;
  /** How many of them failed. */
  readonly errorCount: number;
  /** The services it went through. */
  readonly services: readonly string[];
}

/**
 * The traces a search found.
 *
 * Bir aramanın bulduğu trace'ler.
 */
export interface SearchTracesResult {
  /** The traces, newest first. */
  readonly traces: readonly TraceSummaryResult[];
}

/**
 * A service's span names.
 *
 * Bir servisin span adları.
 */
export interface GetTraceOperationsResult {
  /** The names, sorted. */
  readonly operations: readonly string[];
}

/**
 * One attribute of a span or of an event.
 *
 * Bir span'in veya olayın tek bir özniteliği.
 */
export interface SpanAttributeResult {
  /** The attribute's name, such as `http.route`. */
  readonly key: string;
  /** Its value as text; cut short when `truncated`. */
  readonly value: string;
  /** Whether `value` is only the start of a longer value; the span read on its own has it whole. */
  readonly truncated: boolean;
}

/**
 * Something that happened during a span.
 *
 * Bir span sırasında gerçekleşen olay.
 */
export interface SpanEventResult {
  /** When (ISO-8601). */
  readonly time: string;
  /** The event's name, such as `exception`. */
  readonly name: string;
  /** Its attributes. */
  readonly attributes: readonly SpanAttributeResult[];
}

/**
 * One span of a trace.
 *
 * Bir trace'in tek bir span'i.
 */
export interface TraceSpanResult {
  /** The span ID, in lower case. */
  readonly spanId: string;
  /** The parent span's ID; null for a root, including a span whose parent the trace doesn't hold. */
  readonly parentSpanId: string | null;
  /** The service that recorded the span. */
  readonly service: string;
  /** The replica that recorded it, when it said. */
  readonly instance: string | null;
  /** The service's version, when it said. */
  readonly version: string | null;
  /** The span's name, such as `POST proposals`. */
  readonly name: string;
  /** The span's role. */
  readonly kind: SpanKind;
  /** When it started (ISO-8601). */
  readonly start: string;
  /** How long after the trace's start it started, in milliseconds. */
  readonly offsetMs: number;
  /** How long it took, in milliseconds. */
  readonly durationMs: number;
  /** How it ended. */
  readonly status: SpanStatus;
  /** Why it failed, when it did and said so. */
  readonly statusMessage: string | null;
  /** Its attributes, in the order recorded. */
  readonly attributes: readonly SpanAttributeResult[];
  /** What happened during it, such as a recorded exception, earliest first. */
  readonly events: readonly SpanEventResult[];
  /** How many log entries it wrote; null when the logs could not be counted. */
  readonly logs: number | null;
  /** How many of them are errors; null when the logs could not be counted. */
  readonly errorLogs: number | null;
}

/**
 * A trace, its spans in the order they started.
 *
 * Başlama sırasına göre span'leriyle bir trace.
 */
export interface GetTraceResult {
  /** The trace ID, in lower case. */
  readonly traceId: string;
  /** When the earliest span started (ISO-8601). */
  readonly start: string;
  /** From the earliest span's start to the latest span's end, in milliseconds. */
  readonly durationMs: number;
  /** The services the trace went through. */
  readonly services: readonly string[];
  /** The spans, earliest first. */
  readonly spans: readonly TraceSpanResult[];
  /** How many of the latest spans were left out because the trace has more than a page can show. */
  readonly omittedSpans: number;
  /** How many of the trace's log entries name no span; null when the logs could not be counted. */
  readonly logsWithoutSpan: number | null;
}

/**
 * A span in full and the log entries it wrote.
 *
 * Bir span'in tamamı ve yazdığı log kayıtları.
 */
export interface GetTraceSpanResult {
  /** The span, no attribute cut short. */
  readonly span: TraceSpanResult;
  /** The log entries it wrote, earliest first; empty when no log backend is configured. */
  readonly logs: readonly LogEntryResult[];
  /** Whether it wrote more entries than `logs` holds. */
  readonly moreLogs: boolean;
}

// ---------------------------------------------------------------------------
// InsurGateway calls
// ---------------------------------------------------------------------------

/**
 * How far InsurGateway's call log has been indexed.
 *
 * InsurGateway çağrı logunun ne kadarının indekslendiği.
 */
export interface GetIgwIndexStatusResult {
  /** Whether this environment indexes the call log. */
  readonly indexingEnabled: boolean;
  /** The time of the newest indexed call (ISO-8601); null when there is none. */
  readonly indexedUpTo: string | null;
}

/**
 * One side of an InsurGateway call.
 *
 * Bir InsurGateway çağrısının bir tarafı.
 */
export interface IgwCallPayloadResult {
  /** The payload's form. */
  readonly kind: IgwPayloadKind;
  /** The payload's text, every secret replaced by `***`. */
  readonly body: string;
  /** The payload's size in bytes. */
  readonly size: number;
  /** Whether the payload was too large to show whole and `body` stops short. */
  readonly truncated: boolean;
  /** What the call did, as the payload says; null when it doesn't. */
  readonly operation: string | null;
  /** Whether the payload reads as a failure. */
  readonly failed: boolean;
  /** The failure's message, numbers masked; null when there is none. */
  readonly failure: string | null;
}

/**
 * One InsurGateway call to an insurance company: its request and its response, whichever were logged.
 *
 * InsurGateway'in bir sigorta şirketine yaptığı tek bir çağrı: loglanmış olan istek ve yanıtı.
 */
export interface GetIgwCallResult {
  /** The call's log ID. */
  readonly logId: number;
  /** When the call was made (ISO-8601). */
  readonly time: string;
  /** What InsurGateway sent, its secrets masked; null when it wasn't logged. */
  readonly request: IgwCallPayloadResult | null;
  /** What came back, its secrets masked; null when it wasn't logged. */
  readonly response: IgwCallPayloadResult | null;
}

// ---------------------------------------------------------------------------
// Database: slow queries
// ---------------------------------------------------------------------------

/**
 * Lists the queries the database logged as slow over a range, one group per collection, shape and plan.
 *
 * Veritabanının bir aralıkta yavaş olarak logladığı sorguları koleksiyon, şekil ve plan başına bir grup olarak
 * listeler.
 */
export interface GetSlowQueriesRequest {
  /** The start of the range (ISO-8601). */
  readonly from: string;
  /** The end of the range, exclusive (ISO-8601). */
  readonly to: string;
  /** Only this database's queries; null lists every database's. */
  readonly database?: string | null;
  /** Only this collection's queries, with `database`. */
  readonly collection?: string | null;
  /** Only the queries that read the whole collection, with no index. */
  readonly collectionScansOnly?: boolean;
  /** How many groups to return at most, 1 to 500, the most time spent first; 100 when left out. */
  readonly limit?: number;
}

/**
 * The slow queries of one collection with one shape and plan.
 *
 * Bir koleksiyonun aynı şekil ve plana sahip yavaş sorguları.
 */
export interface SlowQueryGroupResult {
  /** The database. */
  readonly database: string;
  /** The collection; empty for a command on the database itself. */
  readonly collection: string;
  /** The query's shape, as the server hashes it for its plan cache; empty for a write or a cursor's next batch. */
  readonly shapeHash: string;
  /** The plan the server ran, such as `IXSCAN { AgentId: 1 }` or `COLLSCAN`. */
  readonly plan: string;
  /** How many times it ran slow. */
  readonly count: number;
  /** The time all of them took, ms. */
  readonly totalMilliseconds: number;
  /** The mean time one took, ms. */
  readonly averageMilliseconds: number;
  /** The 95th-percentile time one took, ms. */
  readonly p95Milliseconds: number;
  /** The longest time one took, ms. */
  readonly maxMilliseconds: number;
  /** The documents all of them examined. */
  readonly documentsExamined: number;
  /** The index keys all of them examined. */
  readonly keysExamined: number;
  /** The documents all of them returned. */
  readonly returned: number;
  /** How many sorted in memory. */
  readonly inMemorySorts: number;
  /** When it last ran slow (ISO-8601). */
  readonly lastSeen: string;
  /** The applications that ran it. */
  readonly applications: readonly string[];
}

/**
 * The slow queries of a range, grouped.
 *
 * Bir aralığın gruplanmış yavaş sorguları.
 */
export interface GetSlowQueriesResult {
  /** The groups, the most time spent first. */
  readonly groups: readonly SlowQueryGroupResult[];
  /** Whether more groups matched than are returned. */
  readonly truncated: boolean;
  /** How many queries ran slow in the range, every group counted. */
  readonly total: number;
  /** How many of them read a whole collection, with no index. */
  readonly collectionScans: number;
}

/**
 * Reads one group of slow queries: its runs over time, the latest ones, and its shape without values.
 *
 * Bir yavaş sorgu grubunu okur: zaman içindeki çalışmaları, en sonuncuları ve değerler olmadan şekli.
 */
export interface GetSlowQueryRequest {
  /** The start of the range (ISO-8601). */
  readonly from: string;
  /** The end of the range, exclusive (ISO-8601). */
  readonly to: string;
  /** The group's database. */
  readonly database: string;
  /** The group's collection; empty for a command on the database itself. */
  readonly collection: string;
  /** The group's shape hash; empty when it has none. */
  readonly shapeHash: string;
  /** The group's plan; empty when it has none. */
  readonly plan: string;
}

/**
 * The slow runs of one step.
 *
 * Bir adımdaki yavaş çalışmalar.
 */
export interface SlowQueryPointResult {
  /** The step's start (ISO-8601). */
  readonly time: string;
  /** How many ran slow. */
  readonly count: number;
  /** Their 95th-percentile time, ms. */
  readonly p95Milliseconds: number | null;
}

/**
 * One slow run of a query.
 *
 * Bir sorgunun tek bir yavaş çalışması.
 */
export interface SlowQueryRunResult {
  /** When it was logged (ISO-8601). */
  readonly time: string;
  /** The log entry's time exactly as the log backend keeps it; with `logStream`, reads the run's values. */
  readonly logTime: string;
  /** The log stream the entry is in. */
  readonly logStream: string;
  /** The database server that ran it. */
  readonly node: string;
  /** The application that ran it; empty when its client gave no name. */
  readonly application: string;
  /** How long it took, ms. */
  readonly durationMilliseconds: number;
  /** The documents it examined. */
  readonly documentsExamined: number | null;
  /** The index keys it examined. */
  readonly keysExamined: number | null;
  /** The documents it returned. */
  readonly returned: number | null;
  /** The plan it ran. */
  readonly plan: string;
  /** Whether it sorted in memory. */
  readonly inMemorySort: boolean;
}

/**
 * One group of slow queries in detail.
 *
 * Bir yavaş sorgu grubunun ayrıntısı.
 */
export interface GetSlowQueryResult {
  /** The distance between two points, in seconds. */
  readonly stepSeconds: number;
  /** How many ran slow in each step that had one, and how long they took. */
  readonly points: readonly SlowQueryPointResult[];
  /** The latest runs, newest first. */
  readonly runs: readonly SlowQueryRunResult[];
  /** The latest run's command as indented JSON, every value replaced by `?`; null when none ran. */
  readonly shape: string | null;
  /** Whether the server logged the command cut short. */
  readonly shapeTruncated: boolean;
}

/**
 * Reads one slow run's command with its values; needs `observability:db-query-read`, and the read is logged.
 *
 * Bir yavaş çalışmanın komutunu değerleriyle okur; `observability:db-query-read` yetkisi gerekir ve okuma loglanır.
 */
export interface GetSlowQuerySampleRequest {
  /** The run's log stream, as the group's runs give it. */
  readonly logStream: string;
  /** The run's log time, exactly as the group's runs give it. */
  readonly logTime: string;
}

/**
 * One slow run's command, values included.
 *
 * Bir yavaş çalışmanın komutu, değerleri dahil.
 */
export interface GetSlowQuerySampleResult {
  /** When it was logged (ISO-8601). */
  readonly time: string;
  /** The database. */
  readonly database: string;
  /** The collection. */
  readonly collection: string;
  /** The command as indented JSON; its values can be a customer's personal data. */
  readonly command: string;
  /** Whether the server logged the command cut short. */
  readonly truncated: boolean;
}

// ---------------------------------------------------------------------------
// Database: collection statistics
// ---------------------------------------------------------------------------

/**
 * How many operations of a kind the server ran, and how long they took.
 *
 * Sunucunun bir türde kaç işlem çalıştırdığı ve ne kadar sürdükleri.
 */
export interface DatabaseOperationStatsResult {
  /** The operations. */
  readonly operations: number;
  /** The mean time one took, ms; null when none ran. */
  readonly averageMilliseconds: number | null;
}

/**
 * One collection's statistics, added up over the shards that hold it.
 *
 * Bir koleksiyonun, onu tutan shard'lar üzerinden toplanmış istatistikleri.
 */
export interface DatabaseCollectionStatsResult {
  /** The database. */
  readonly database: string;
  /** The collection. */
  readonly collection: string;
  /** Its documents. */
  readonly documents: number;
  /** Its documents' size, uncompressed, in bytes. */
  readonly dataBytes: number;
  /** The disk its documents take, in bytes. */
  readonly storageBytes: number;
  /** The disk its indexes take, in bytes. */
  readonly indexBytes: number;
  /** Its indexes. */
  readonly indexes: number;
  /** A document's mean size, in bytes. */
  readonly averageDocumentBytes: number;
  /** The reads the server ran on it since it started. */
  readonly reads: DatabaseOperationStatsResult;
  /** The writes the server ran on it since it started. */
  readonly writes: DatabaseOperationStatsResult;
  /** The other commands the server ran on it since it started. */
  readonly commands: DatabaseOperationStatsResult;
}

/**
 * The platform's collections.
 *
 * Platformun koleksiyonları.
 */
export interface GetDatabaseCollectionsResult {
  /** When the statistics were read (ISO-8601). */
  readonly readAt: string;
  /** Every collection, the largest first. */
  readonly collections: readonly DatabaseCollectionStatsResult[];
  /** The collections, as `database.collection`, whose statistics the server refused or didn't give in time. */
  readonly unreadable: readonly string[];
}

/**
 * One index of a collection.
 *
 * Bir koleksiyonun tek bir indeksi.
 */
export interface DatabaseIndexResult {
  /** The index's name. */
  readonly name: string;
  /** Its keys as JSON. */
  readonly keys: string;
  /** Whether it is unique. */
  readonly unique: boolean;
  /** Whether it leaves out the documents without its keys. */
  readonly sparse: boolean;
  /** Whether it holds only the documents a filter selects. */
  readonly partial: boolean;
  /** The seconds after which it deletes a document; null when it deletes none. */
  readonly expireAfterSeconds: number | null;
  /** The disk it takes, in bytes. */
  readonly sizeBytes: number | null;
  /** The operations that used it since `usedSince`; null when the use is unknown. */
  readonly uses: number | null;
  /** When its use started being counted (ISO-8601). */
  readonly usedSince: string | null;
}

/**
 * One collection's indexes.
 *
 * Bir koleksiyonun indeksleri.
 */
export interface GetDatabaseCollectionResult {
  /** The database. */
  readonly database: string;
  /** The collection. */
  readonly collection: string;
  /** When the statistics were read (ISO-8601). */
  readonly readAt: string;
  /** Whether the server said how often each index was used; it doesn't without the `indexStats` privilege. */
  readonly usageAvailable: boolean;
  /** The indexes, the least used first when the use is known. */
  readonly indexes: readonly DatabaseIndexResult[];
}
