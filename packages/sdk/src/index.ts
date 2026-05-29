/**
 * @fileoverview InsurUp TypeScript SDK - Main export file
 * @description Comprehensive TypeScript SDK for InsurUp platform operations
 */

// Version export
export { VERSION } from './version.js';

// Main client export
export { DefaultInsurUpClient } from './client/client.js';

// GraphQL transport types
export type { GraphQLRequest, GraphQLResponse } from './client/graphql.js';
export { GraphQLTransport } from './client/graphql.js';

// SignalR transport (real-time proposal updates)
export { SignalRTransport } from './client/signalr.js';
export type { ProposalDetailHandlers, SignalRTransportOptions } from './client/signalr.js';
export { LogLevel as SignalRLogLevel } from '@microsoft/signalr';

// Specialized client exports
export { InsurUpAgentClient } from './clients/agent.js';
export { InsurUpAgentBranchClient } from './clients/agentBranch.js';
export { InsurUpAgentRoleClient } from './clients/agentRole.js';
export { InsurUpAgentSetupClient } from './clients/agentSetup.js';
export { InsurUpAgentUserClient } from './clients/agentUser.js';
export { InsurUpCustomerClient } from './clients/customer.js';
export { InsurUpVehicleClient } from './clients/vehicle.js';
export { InsurUpPropertyClient } from './clients/property.js';
export { InsurUpPolicyClient } from './clients/policy.js';
export { InsurUpCaseClient } from './clients/case.js';
export { InsurUpWebhookClient } from './clients/webhook.js';
export { InsurUpCoverageClient } from './clients/coverage.js';
export { InsurUpInsuranceClient } from './clients/insurance.js';
export { InsurUpProposalClient } from './clients/proposal.js';
export { InsurUpFileClient } from './clients/file.js';
export { InsurUpLanguageClient } from './clients/language.js';
export { InsurUpTemplateClient } from './clients/template.js';
export { InsurUpOAuthClientClient } from './clients/oauthClient.js';

// Core types and results
export type {
  // REST API result types
  InsurUpResult,
  Success,
  SuccessNoContent,
  ServerError,
  ClientError,
  ValidationError,
  // GraphQL result types
  InsurUpGraphQLResult,
  GraphQLErrors,
  GraphQLErrorItem,
  GraphQLErrorExtensions,
  GraphQLErrorLocation,
} from './core/result.js';

export {
  InsurUpServerErrorType,
  InsurUpClientErrorType,
  InsurUpGraphQLErrorCode,
  // REST helpers
  getDataOrThrow,
  throwIfError,
  // GraphQL helpers
  getGraphQLDataOrThrow,
  throwIfGraphQLError,
  createGraphQLErrors,
} from './core/result.js';
export { InsurUpError, extractError } from './core/errors.js';

export type {
  InsurUpClientOptions,
  TokenProvider,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  RequestOptions,
  BackoffStrategy,
  RetryOptions,
  LogLevel,
  Logger,
} from './core/options.js';

// Re-export all contract types from @insurup/contracts
export * from '@insurup/contracts';

// Export endpoint constants for advanced usage
export * as Endpoints from './core/endpoints.js';
