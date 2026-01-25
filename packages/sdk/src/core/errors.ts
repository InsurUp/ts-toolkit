/**
 * @fileoverview Error handling and mapping utilities
 * @description Error type mapping and parsing logic
 */

import {
  InsurUpServerErrorType,
  InsurUpClientErrorType,
} from "./error-types.js";
import type {
  ValidationError} from "./result.js";
import {
  type ServerError,
  type ClientError,
  type GraphQLErrors,
} from "./result.js";

/**
 * Error type URLs from the API
 */
const ERROR_TYPE_URLS = {
  "https://api.insurup.com/problems/access-denied":
    InsurUpServerErrorType.AccessDenied,
  "https://api.insurup.com/problems/business-validation":
    InsurUpServerErrorType.BusinessValidation,
  "https://api.insurup.com/problems/feature-not-supported":
    InsurUpServerErrorType.FeatureNotSupported,
  "https://api.insurup.com/problems/input-validation":
    InsurUpServerErrorType.InputValidation,
  "https://api.insurup.com/problems/resource-duplicate":
    InsurUpServerErrorType.ResourceDuplicate,
  "https://api.insurup.com/problems/resource-invalid-state":
    InsurUpServerErrorType.ResourceInvalidState,
  "https://api.insurup.com/problems/resource-not-found":
    InsurUpServerErrorType.ResourceNotFound,
  "https://api.insurup.com/problems/endpoint-not-found":
    InsurUpServerErrorType.EndpointNotFound,
  "https://api.insurup.com/problems/unauthorized":
    InsurUpServerErrorType.Unauthorized,
  "https://api.insurup.com/problems/upstream-service":
    InsurUpServerErrorType.Upstream,
  "https://api.insurup.com/problems/unsupported-media-type":
    InsurUpServerErrorType.UnsupportedMediaType,
  "https://api.insurup.com/problems/method-not-allowed":
    InsurUpServerErrorType.MethodNotAllowed,
} as const;

/**
 * Interface representing the server error response structure
 */
interface ServerErrorResponse {
  type?: string;
  title?: string;
  detail?: string;
  instance?: string;
  status?: number;
  codes?: string[];
  traceId?: string;
  template?: string;
  templateArgs?: Record<string, unknown>;
  suggestions?: string[];
  validationErrors?: Array<{
    propertyName?: string;
    errorMessage?: string;
    attemptedValue?: unknown;
  }>;
}

/**
 * Maps a server error type string to the corresponding enum value
 */
function mapServerErrorType(typeString: string): InsurUpServerErrorType {
  const normalizedType = typeString.toLowerCase().trim();
  return (
    ERROR_TYPE_URLS[normalizedType as keyof typeof ERROR_TYPE_URLS] ??
    InsurUpServerErrorType.Unknown
  );
}

/**
 * Parses validation errors from server response
 */
function parseValidationErrors(
  validationErrors?: Array<{
    propertyName?: string;
    errorMessage?: string;
    attemptedValue?: unknown;
  }>,
): ValidationError[] {
  if (!validationErrors || !Array.isArray(validationErrors)) {
    return [];
  }

  return validationErrors
    .filter((error): error is NonNullable<typeof error> => error != null)
    .map(
      (error): ValidationError => ({
        propertyName: error.propertyName ?? "",
        errorMessage: error.errorMessage ?? "",
        attemptedValue: error.attemptedValue ?? null,
      }),
    );
}

/**
 * Parses server error response and creates a ServerError object
 */
export function parseServerError(
  response: Response,
  responseBody: string,
): ServerError {
  let errorData: ServerErrorResponse = {};

  // Try to parse JSON response body
  try {
    if (responseBody.trim()) {
      const parsed = JSON.parse(responseBody) as unknown;
      if (typeof parsed === "object" && parsed !== null) {
        errorData = parsed as ServerErrorResponse;
      }
    }
  } catch {
    // If JSON parsing fails, create minimal error info from response
  }

  const typeString =
    errorData.type ?? "https://api.insurup.com/problems/unknown";
  const type = mapServerErrorType(typeString);

  return {
    kind: "server-error",
    isSuccess: false,
    message:
      errorData.detail ?? (response.statusText || "Unknown server error"),
    type,
    typeString,
    title: errorData.title ?? `HTTP ${response.status}`,
    detail: errorData.detail ?? (response.statusText || "Unknown server error"),
    instance: errorData.instance ?? "",
    status: errorData.status ?? response.status,
    codes: errorData.codes ?? [],
    traceId: errorData.traceId ?? undefined,
    template: errorData.template ?? "",
    templateArgs: errorData.templateArgs ?? {},
    suggestions: errorData.suggestions ?? [],
    validationErrors: parseValidationErrors(errorData.validationErrors),
  };
}

/**
 * Creates a client error for network/timeout issues
 */
export function createNetworkError(error: unknown): ClientError {
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return {
        kind: "client-error",
        isSuccess: false,
        message: "Request timed out",
        type: InsurUpClientErrorType.Timeout,
        error: error,
      };
    }

    const messageLower = error.message.toLowerCase();
    if (
      error.name === "TypeError" ||
      messageLower.includes("fetch") ||
      messageLower.includes("network") ||
      messageLower.includes("failed") ||
      messageLower.includes("econn") ||
      messageLower.includes("enotfound")
    ) {
      return {
        kind: "client-error",
        isSuccess: false,
        message: "HTTP request failed",
        type: InsurUpClientErrorType.HttpRequestFailed,
        error: error,
      };
    }

    // Default other Error instances to HttpRequestFailed for better DX
    return {
      kind: "client-error",
      isSuccess: false,
      message: "HTTP request failed",
      type: InsurUpClientErrorType.HttpRequestFailed,
      error: error,
    };
  }

  return {
    kind: "client-error",
    isSuccess: false,
    message: "Unknown error occurred",
    type: InsurUpClientErrorType.Unknown,
    error: error,
  };
}

/**
 * Creates a client error for JSON serialization issues
 */
export function createSerializationError(error: unknown): ClientError {
  return {
    kind: "client-error",
    isSuccess: false,
    message:
      error instanceof Error
        ? error.message
        : "Failed to serialize request to JSON",
    type: InsurUpClientErrorType.JsonSerialization,
    error: error,
  };
}

/**
 * Creates a client error for JSON deserialization issues
 */
export function createDeserializationError(error: unknown): ClientError {
  return {
    kind: "client-error",
    isSuccess: false,
    message: "Failed to parse response JSON",
    type: InsurUpClientErrorType.JsonDeserialization,
    error: error,
  };
}

/**
 * Creates a client error for null/empty responses when data was expected
 */
export function createNullResponseError(): ClientError {
  return {
    kind: "client-error",
    isSuccess: false,
    message: "Response was empty or null when data was expected",
    type: InsurUpClientErrorType.NullResponse,
  };
}

/**
 * Creates a client error for unexpected empty/no-content responses
 * Used when an endpoint that should return data receives 204 or empty body
 */
export function createUnexpectedNoContentError(): ClientError {
  return {
    kind: "client-error",
    isSuccess: false,
    message: "Expected response data but received no content",
    type: InsurUpClientErrorType.UnexpectedNoContent,
  };
}

export function extractError(
  error: Error,
): ClientError | ServerError | GraphQLErrors {
  if (error instanceof InsurUpError) {
    return error.error;
  }

  return {
    kind: "client-error",
    isSuccess: false,
    message: error.message,
    type: InsurUpClientErrorType.Unknown,
  } as ClientError;
}

/**
 * Custom InsurUp error class that extends the standard Error
 */
export class InsurUpError extends Error {
  /**
   * The original client, server, or GraphQL error object
   */
  public readonly error: ClientError | ServerError | GraphQLErrors;

  constructor(error: ClientError | ServerError | GraphQLErrors) {
    super(error.message);
    this.name = "InsurUpError";
    this.error = error;
  }
}
