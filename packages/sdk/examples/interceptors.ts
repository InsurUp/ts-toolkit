/**
 * Interceptors Example
 *
 * Demonstrates request/response interceptor patterns with the InsurUp SDK.
 */

import {
  DefaultInsurUpClient,
  InsurUpServerErrorType,
  InsurUpClientErrorType,
} from "@insurup/sdk";
import type {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  InsurUpResult,
} from "@insurup/sdk";

// ============================================================================
// 1. Basic logging interceptor
// ============================================================================

const loggingInterceptor: RequestInterceptor = (config) => {
  console.log(`[${new Date().toISOString()}] ${config.method} ${config.url}`);
  return config;
};

const clientWithLogging = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: loggingInterceptor,
});

// ============================================================================
// 2. Add custom headers dynamically
// ============================================================================

const correlationInterceptor: RequestInterceptor = (config) => {
  const correlationId = crypto.randomUUID();

  return {
    ...config,
    headers: {
      ...config.headers,
      "X-Correlation-ID": correlationId,
      "X-Request-Timestamp": Date.now().toString(),
    },
  };
};

const clientWithCorrelation = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: correlationInterceptor,
});

// ============================================================================
// 3. Request timing and performance monitoring
// ============================================================================

// Store request start times (in real app, use WeakMap or context)
const requestTimings = new Map<string, number>();

const timingRequestInterceptor: RequestInterceptor = (config) => {
  const requestId = crypto.randomUUID();
  requestTimings.set(config.url, Date.now());

  return {
    ...config,
    headers: {
      ...config.headers,
      "X-Request-ID": requestId,
    },
  };
};

const timingResponseInterceptor: ResponseInterceptor = (result, config) => {
  const startTime = requestTimings.get(config.url);
  if (startTime) {
    const duration = Date.now() - startTime;
    console.log(`${config.method} ${config.url} completed in ${duration}ms`);
    requestTimings.delete(config.url);

    // Log slow requests
    if (duration > 2000) {
      console.warn(`Slow request detected: ${config.url} took ${duration}ms`);
    }
  }

  return result;
};

const clientWithTiming = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: timingRequestInterceptor,
  onResponse: timingResponseInterceptor,
});

// ============================================================================
// 4. Error tracking/reporting interceptor
// ============================================================================

interface ErrorReport {
  url: string;
  method: string;
  errorKind: string;
  errorType: string;
  message: string;
  timestamp: Date;
}

const errorReports: ErrorReport[] = [];

const errorTrackingInterceptor: ResponseInterceptor = (result, config) => {
  if (!result.isSuccess) {
    const report: ErrorReport = {
      url: config.url,
      method: config.method,
      errorKind: result.kind,
      errorType:
        result.kind === "server-error" ? result.type : result.type,
      message: result.message,
      timestamp: new Date(),
    };

    errorReports.push(report);

    // In production, send to error tracking service
    // await sendToSentry(report);
    // await sendToDatadog(report);

    console.error("API Error tracked:", report);
  }

  return result;
};

const clientWithErrorTracking = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onResponse: errorTrackingInterceptor,
});

// ============================================================================
// 5. Response caching interceptor
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(config: RequestConfig): string {
  return `${config.method}:${config.url}`;
}

// Note: Caching should typically be done at the request level, not response
// This example shows the concept; real implementation would need request interception
const cachingResponseInterceptor: ResponseInterceptor = <T>(
  result: InsurUpResult<T>,
  config: RequestConfig,
): InsurUpResult<T> => {
  // Only cache successful GET requests
  if (result.isSuccess && "data" in result && config.method === "GET") {
    const key = getCacheKey(config);
    cache.set(key, {
      data: result.data,
      timestamp: Date.now(),
      ttl: 60000, // 1 minute TTL
    });
  }

  return result;
};

// ============================================================================
// 6. Tenant/Multi-org header injection
// ============================================================================

function createTenantInterceptor(tenantId: string): RequestInterceptor {
  return (config) => ({
    ...config,
    headers: {
      ...config.headers,
      "X-Tenant-ID": tenantId,
    },
  });
}

const tenant1Client = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: createTenantInterceptor("tenant-123"),
});

const tenant2Client = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: createTenantInterceptor("tenant-456"),
});

// ============================================================================
// 7. Request body transformation
// ============================================================================

const bodyTransformInterceptor: RequestInterceptor = (config) => {
  // Add metadata to all POST/PUT requests
  if (
    (config.method === "POST" || config.method === "PUT") &&
    config.body &&
    typeof config.body === "object"
  ) {
    return {
      ...config,
      body: {
        ...config.body,
        _metadata: {
          clientVersion: "1.0.0",
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  return config;
};

// ============================================================================
// 8. Response transformation
// ============================================================================

const responseTransformInterceptor: ResponseInterceptor = <T>(
  result: InsurUpResult<T>,
  _config: RequestConfig,
): InsurUpResult<T> => {
  if (result.isSuccess && "data" in result && typeof result.data === "object" && result.data !== null) {
    // Add received timestamp to all responses
    return {
      ...result,
      data: {
        ...result.data,
        _receivedAt: new Date().toISOString(),
      } as T,
    };
  }

  return result;
};

// ============================================================================
// 9. Async interceptor with external service
// ============================================================================

const asyncRequestInterceptor: RequestInterceptor = async (config) => {
  // Fetch feature flags or config from external service
  // const flags = await fetchFeatureFlags();

  return {
    ...config,
    headers: {
      ...config.headers,
      "X-Feature-Flags": "new-api-enabled,beta-features",
    },
  };
};

// ============================================================================
// 10. Combining multiple interceptors
// ============================================================================

function composeInterceptors(
  ...interceptors: RequestInterceptor[]
): RequestInterceptor {
  return async (config) => {
    let result = config;
    for (const interceptor of interceptors) {
      result = await interceptor(result);
    }
    return result;
  };
}

const combinedInterceptor = composeInterceptors(
  loggingInterceptor,
  correlationInterceptor,
  timingRequestInterceptor,
);

const clientWithCombinedInterceptors = new DefaultInsurUpClient({
  tokenProvider: () => "your-api-token-here",
  onRequest: combinedInterceptor,
  onResponse: timingResponseInterceptor,
});

// ============================================================================
// 11. Authentication refresh interceptor
// ============================================================================

let accessToken = "initial-token";
const refreshToken = "refresh-token";

async function refreshAccessToken(): Promise<string> {
  // In real app, call your auth service
  // const response = await fetch('/api/auth/refresh', {
  //   method: 'POST',
  //   body: JSON.stringify({ refreshToken })
  // });
  // const { accessToken: newToken } = await response.json();
  // return newToken;

  void refreshToken; // Suppress unused variable warning
  return "new-access-token";
}

const authRefreshInterceptor: ResponseInterceptor = async (result, _config) => {
  // If unauthorized, try to refresh token and hint that retry is needed
  if (
    !result.isSuccess &&
    result.kind === "server-error" &&
    result.type === InsurUpServerErrorType.Unauthorized
  ) {
    console.log("Token expired, refreshing...");

    try {
      accessToken = await refreshAccessToken();
      console.log("Token refreshed successfully");
      // Note: The SDK doesn't support automatic retry after refresh
      // You would need to implement retry logic in your application
    } catch {
      console.error("Failed to refresh token");
    }
  }

  return result;
};

const clientWithAuthRefresh = new DefaultInsurUpClient({
  tokenProvider: () => accessToken,
  onResponse: authRefreshInterceptor,
});

// ============================================================================
// Run examples
// ============================================================================

async function main() {
  // Example: Use client with timing to see request durations
  const result = await clientWithTiming.languages.getLanguages();

  if (result.isSuccess) {
    console.log("Languages:", result.data);
  }

  // Example: Use client with error tracking
  const customerResult =
    await clientWithErrorTracking.customers.getCustomer("non-existent-id");

  if (!customerResult.isSuccess) {
    console.log("Error was tracked. Total errors:", errorReports.length);
  }
}

// Suppress unused variable warnings for demonstration
void clientWithLogging;
void clientWithCorrelation;
void tenant1Client;
void tenant2Client;
void bodyTransformInterceptor;
void responseTransformInterceptor;
void asyncRequestInterceptor;
void clientWithCombinedInterceptors;
void clientWithAuthRefresh;
void cachingResponseInterceptor;
void cache;
void InsurUpClientErrorType;

main().catch(console.error);
