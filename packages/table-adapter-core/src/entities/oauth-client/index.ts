/**
 * @fileoverview OAuth Client Entity Exports
 */

export {
  createOAuthClientTable,
  createInfiniteOAuthClientTable,
  type OAuthClientTable,
  type InfiniteOAuthClientTable,
} from './factory.js';

export type {
  OAuthClientEntity,
  OAuthClientColumnDef,
  OAuthClientRowType,
  OAuthClientExtractFields,
  OAuthClientTableOptions,
  OAuthClientFilterInput,
} from './types.js';
