/**
 * @fileoverview InsurUp Result Types - Type-safe discriminated unions for operation results
 * @description Type-safe discriminated unions for operation results
 */

import { InsurUpError } from "./errors.js";
import {
  InsurUpClientErrorType,
  InsurUpServerErrorType,
  InsurUpGraphQLErrorCode,
} from "./error-types.js";

/**
 * Represents a validation error that occurred during request processing
 */
export interface ValidationError {
  /**
   * The name of the property that failed validation
   * The name of the property.
   */
  readonly propertyName: string;

  /**
   * The error message describing what went wrong
   * The error message
   */
  readonly errorMessage: string;

  /**
   * The property value that caused the validation failure
   * The property value that caused the failure.
   */
  readonly attemptedValue: unknown;
}

// Re-export error types for convenience
export {
  InsurUpClientErrorType,
  InsurUpServerErrorType,
  InsurUpGraphQLErrorCode,
};

/**
 * Represents a successful operation with data
 */
export interface Success<T> {
  readonly kind: "success";
  readonly isSuccess: true;
  readonly message: "Success";
  readonly data: T;
}

/**
 * Represents a successful operation without data (e.g., 204 No Content)
 */
export interface SuccessNoContent {
  readonly kind: "success";
  readonly isSuccess: true;
  readonly message: "Success";
}

/**
 * Represents an error response from the server (4xx and 5xx HTTP status codes)
 */
export interface ServerError {
  readonly kind: "server-error";
  readonly isSuccess: false;
  readonly message: string;
  readonly type: InsurUpServerErrorType;
  readonly typeString: string;
  readonly title: string;
  readonly detail: string;
  readonly instance: string;
  readonly status: number;
  readonly codes: readonly string[];
  readonly traceId: string | undefined;
  readonly template: string;
  readonly templateArgs: Readonly<Record<string, unknown>>;
  readonly suggestions: readonly string[];
  readonly validationErrors: readonly ValidationError[];
}

/**
 * Represents a client-side error (exceptions, null JSON responses, etc.)
 */
export interface ClientError {
  readonly kind: "client-error";
  readonly isSuccess: false;
  readonly message: string;
  readonly type: InsurUpClientErrorType;
  readonly error?: unknown;
}

// ============================================
// GraphQL Error Types
// ============================================

/**
 * Represents the location of an error in a GraphQL document
 */
export interface GraphQLErrorLocation {
  readonly line: number;
  readonly column: number;
}

/**
 * Extensions attached to GraphQL errors by the server
 * Contains structured error information from the backend error filter
 */
export interface GraphQLErrorExtensions {
  /** The error code (e.g., FORBIDDEN, UNAUTHORIZED, NOT_FOUND) */
  readonly code?: InsurUpGraphQLErrorCode;
  /** Trace ID for debugging/correlation */
  readonly traceId?: string;
  /** Array of error codes from the backend AppException */
  readonly codes?: readonly string[];
  /** Message template for localization */
  readonly template?: string;
  /** Arguments for the message template */
  readonly templateArgs?: Readonly<Record<string, unknown>>;
  /** Suggested actions or fixes */
  readonly suggestions?: readonly string[];
  /** Additional extension fields */
  readonly [key: string]: unknown;
}

/**
 * Represents a single GraphQL error item
 */
export interface GraphQLErrorItem {
  /** The error message */
  readonly message: string;
  /** Locations in the GraphQL document where the error occurred */
  readonly locations?: readonly GraphQLErrorLocation[];
  /** Path to the field that caused the error */
  readonly path?: readonly (string | number)[];
  /** Extensions containing additional error information */
  readonly extensions?: GraphQLErrorExtensions;
}

/**
 * Represents a GraphQL error response containing one or more errors
 */
export interface GraphQLErrors {
  readonly kind: "graphql-error";
  readonly isSuccess: false;
  /** First error message for convenience */
  readonly message: string;
  /** All GraphQL errors from the response */
  readonly errors: readonly GraphQLErrorItem[];
}

/**
 * Discriminated union representing the result of a GraphQL operation
 *
 * Similar to InsurUpResult but uses GraphQLErrors instead of ServerError
 * since GraphQL errors have a different schema and can contain multiple errors.
 *
 * @template T The type of the success data (void for no-content operations)
 */
export type InsurUpGraphQLResult<T = void> = T extends void
  ? SuccessNoContent | GraphQLErrors | ClientError
  : Success<T> | GraphQLErrors | ClientError;

/**
 * Discriminated union representing the result of an InsurUp operation
 *
 * When called without a type parameter (InsurUpResult), represents a no-content result
 * where the success case has no data field.
 *
 * When called with a type parameter (InsurUpResult<T>), represents a result with data
 * where the success case has a data field of type T.
 *
 * @template T The type of the success data (void for no-content operations)
 */
export type InsurUpResult<T = void> = T extends void
  ? SuccessNoContent | ServerError | ClientError
  : Success<T> | ServerError | ClientError;

/**
 * Creates a successful result with data
 */
export function createSuccess<T>(data: T): Success<T> {
  return {
    kind: "success",
    isSuccess: true,
    message: "Success",
    data,
  };
}

/**
 * Creates a successful result without data (for 204 No Content responses)
 */
export function createSuccessNoContent(): SuccessNoContent {
  return {
    kind: "success",
    isSuccess: true,
    message: "Success",
  };
}

/**
 * Helper type to extract data type from a Success result
 */
export type ExtractSuccessData<R> = R extends Success<infer T> ? T : never;

/**
 * Extracts data from a successful result or throws an InsurUpError
 * Only works with InsurUpResult<T> where T is not void
 */
export function getDataOrThrow<T>(result: InsurUpResult<T>): T {
  if (result.isSuccess) {
    // When T is not void, result.isSuccess means result is Success<T>
    return (result as unknown as Success<T>).data;
  }
  throw new InsurUpError(result);
}

/**
 * Throws an InsurUpError if the result is not successful
 * Works with any InsurUpResult type
 */
export function throwIfError(
  result: InsurUpResult<unknown> | InsurUpResult,
): void {
  if (result.isSuccess) {
    return;
  }
  throw new InsurUpError(result);
}

// ============================================
// GraphQL Result Helpers
// ============================================

/**
 * Extracts data from a successful GraphQL result or throws an InsurUpError
 * Only works with InsurUpGraphQLResult<T> where T is not void
 */
export function getGraphQLDataOrThrow<T>(result: InsurUpGraphQLResult<T>): T {
  if (result.isSuccess) {
    return (result as unknown as Success<T>).data;
  }
  throw new InsurUpError(result);
}

/**
 * Throws an InsurUpError if the GraphQL result is not successful
 * Works with any InsurUpGraphQLResult type
 */
export function throwIfGraphQLError(
  result: InsurUpGraphQLResult<unknown> | InsurUpGraphQLResult,
): void {
  if (result.isSuccess) {
    return;
  }
  throw new InsurUpError(result);
}

/**
 * Creates a GraphQL errors result from an array of GraphQL error items
 */
export function createGraphQLErrors(
  errors: readonly GraphQLErrorItem[],
): GraphQLErrors {
  return {
    kind: "graphql-error",
    isSuccess: false,
    message: errors[0]?.message ?? "Unknown GraphQL error",
    errors,
  };
}
