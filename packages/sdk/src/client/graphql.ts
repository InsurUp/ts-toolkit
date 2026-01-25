/**
 * @fileoverview GraphQL Transport Layer - Fetch-based GraphQL client
 * @description GraphQL transport with error handling and type safety
 */

import type {
  InsurUpGraphQLResult,
  GraphQLErrorItem,
  GraphQLErrorExtensions,
  GraphQLErrorLocation,
} from "../core/result.js";
import {
  createSuccess,
  createGraphQLErrors,
  InsurUpGraphQLErrorCode,
} from "../core/result.js";
import { createDeserializationError } from "../core/errors.js";
import type { RequestOptions } from "../core/options.js";
import type { HttpTransport } from "./http.js";

/**
 * Raw GraphQL error from the server response
 */
interface RawGraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

/**
 * GraphQL response structure
 */
export interface GraphQLResponse<T> {
  data?: T;
  errors?: RawGraphQLError[];
}

/**
 * GraphQL request payload
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
}

/**
 * Maps a raw error code string to the InsurUpGraphQLErrorCode enum
 */
function mapGraphQLErrorCode(code: unknown): InsurUpGraphQLErrorCode {
  if (typeof code !== "string") {
    return InsurUpGraphQLErrorCode.Unknown;
  }

  const upperCode = code.toUpperCase();

  switch (upperCode) {
    case "FORBIDDEN":
      return InsurUpGraphQLErrorCode.Forbidden;
    case "UNAUTHORIZED":
      return InsurUpGraphQLErrorCode.Unauthorized;
    case "NOT_FOUND":
      return InsurUpGraphQLErrorCode.NotFound;
    case "BAD_REQUEST":
      return InsurUpGraphQLErrorCode.BadRequest;
    case "CONFLICT":
      return InsurUpGraphQLErrorCode.Conflict;
    case "NOT_SUPPORTED":
      return InsurUpGraphQLErrorCode.NotSupported;
    case "UPSTREAM_ERROR":
      return InsurUpGraphQLErrorCode.UpstreamError;
    case "INTERNAL_ERROR":
      return InsurUpGraphQLErrorCode.InternalError;
    case "VALIDATION_ERROR":
      return InsurUpGraphQLErrorCode.ValidationError;
    case "FILTER_REQUIRED":
      return InsurUpGraphQLErrorCode.FilterRequired;
    case "FILTER_MAX_SPAN_EXCEEDED":
      return InsurUpGraphQLErrorCode.FilterMaxSpanExceeded;
    default:
      return InsurUpGraphQLErrorCode.Unknown;
  }
}

/**
 * Parses raw extensions into typed GraphQLErrorExtensions
 */
function parseExtensions(
  raw: Record<string, unknown> | undefined,
): GraphQLErrorExtensions | undefined {
  if (!raw) {
    return undefined;
  }

  const extensions: GraphQLErrorExtensions = {
    ...raw,
    code: mapGraphQLErrorCode(raw.code),
    traceId: typeof raw.traceId === "string" ? raw.traceId : undefined,
    codes: Array.isArray(raw.codes)
      ? (raw.codes.filter((c) => typeof c === "string") as string[])
      : undefined,
    template: typeof raw.template === "string" ? raw.template : undefined,
    templateArgs:
      typeof raw.templateArgs === "object" && raw.templateArgs !== null
        ? (raw.templateArgs as Record<string, unknown>)
        : undefined,
    suggestions: Array.isArray(raw.suggestions)
      ? (raw.suggestions.filter((s) => typeof s === "string") as string[])
      : undefined,
  };

  return extensions;
}

/**
 * Parses raw GraphQL errors into typed GraphQLErrorItem array
 */
function parseGraphQLErrors(rawErrors: RawGraphQLError[]): GraphQLErrorItem[] {
  return rawErrors.map((error): GraphQLErrorItem => {
    const locations: GraphQLErrorLocation[] | undefined = error.locations?.map(
      (loc) => ({
        line: loc.line,
        column: loc.column,
      }),
    );

    return {
      message: error.message,
      locations,
      path: error.path,
      extensions: parseExtensions(error.extensions),
    };
  });
}

/**
 * GraphQL transport class providing typed query execution
 */
export class GraphQLTransport {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Executes a GraphQL query or mutation
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @param options Optional request options
   * @returns Promise resolving to InsurUpGraphQLResult<T>
   */
  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<InsurUpGraphQLResult<T>> {
    const payload: GraphQLRequest = {
      query,
      variables,
    };

    // Use the existing HTTP transport to send the POST request
    const result = await this.http.post<GraphQLResponse<T>>(
      "graphql",
      payload,
      options,
    );

    // Handle transport-level errors (network, timeout, etc.)
    if (!result.isSuccess) {
      // Pass through both server errors and client errors
      return result as InsurUpGraphQLResult<T>;
    }

    const response = result.data;

    // Handle GraphQL-level errors
    if (response.errors && response.errors.length > 0) {
      const parsedErrors = parseGraphQLErrors(response.errors);
      return createGraphQLErrors(parsedErrors) as InsurUpGraphQLResult<T>;
    }

    // If no data and no errors, something is wrong with the response
    if (!response.data) {
      return createDeserializationError(
        new Error("GraphQL response contained no data and no errors"),
      ) as InsurUpGraphQLResult<T>;
    }

    return createSuccess(response.data) as InsurUpGraphQLResult<T>;
  }
}
