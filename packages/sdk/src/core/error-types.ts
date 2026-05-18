/**
 * @fileoverview Error Type Enums - Foundational error types used across the SDK
 * @description Centralized error type definitions to avoid circular dependencies
 */

/**
 * Client-side error types that can occur during API operations
 */
export enum InsurUpClientErrorType {
  Unknown = 'Unknown',
  JsonSerialization = 'JsonSerialization',
  JsonDeserialization = 'JsonDeserialization',
  NullResponse = 'NullResponse',
  Timeout = 'Timeout',
  HttpRequestFailed = 'HttpRequestFailed',
  UnexpectedNoContent = 'UnexpectedNoContent',
  GraphQLError = 'GraphQLError',
}

/**
 * Server-side error types from HTTP responses
 */
export enum InsurUpServerErrorType {
  Unknown = 'Unknown',
  AccessDenied = 'AccessDenied',
  BusinessValidation = 'BusinessValidation',
  FeatureNotSupported = 'FeatureNotSupported',
  InputValidation = 'InputValidation',
  ResourceDuplicate = 'ResourceDuplicate',
  ResourceInvalidState = 'ResourceInvalidState',
  ResourceNotFound = 'ResourceNotFound',
  EndpointNotFound = 'EndpointNotFound',
  UnsupportedMediaType = 'UnsupportedMediaType',
  MethodNotAllowed = 'MethodNotAllowed',
  Unauthorized = 'Unauthorized',
  Upstream = 'Upstream',
}

/**
 * GraphQL error codes from the server
 * These match the error codes set by the GraphQL error filter on the backend
 */
export enum InsurUpGraphQLErrorCode {
  /** Access denied - user lacks permission */
  Forbidden = 'FORBIDDEN',
  /** Authentication required or invalid */
  Unauthorized = 'UNAUTHORIZED',
  /** Requested resource not found */
  NotFound = 'NOT_FOUND',
  /** Invalid input or business validation failure */
  BadRequest = 'BAD_REQUEST',
  /** Resource conflict (duplicate or invalid state) */
  Conflict = 'CONFLICT',
  /** Feature not supported */
  NotSupported = 'NOT_SUPPORTED',
  /** Upstream service error */
  UpstreamError = 'UPSTREAM_ERROR',
  /** Internal server error */
  InternalError = 'INTERNAL_ERROR',
  /** GraphQL validation error */
  ValidationError = 'VALIDATION_ERROR',
  /** Filter is required for this query */
  FilterRequired = 'FILTER_REQUIRED',
  /** Filter time span exceeds maximum allowed */
  FilterMaxSpanExceeded = 'FILTER_MAX_SPAN_EXCEEDED',
  /** Unknown error code */
  Unknown = 'UNKNOWN',
}
