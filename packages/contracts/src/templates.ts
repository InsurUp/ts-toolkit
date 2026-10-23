/**
 * @fileoverview Template Contracts - Template management operations
 * @description TypeScript contracts for template management operations
 */

import type { UserReference } from './common.js';

/**
 * Response containing template definition information
 */
export interface GetTemplateDefinitionsResult {
  readonly key: string;
  readonly jsonSchema: object;
  readonly metadata: object;
  /** JSON schema of the data the template is rendered with, as a JSON string. */
  readonly modelSchema: string;
  /** Display name of the template type in the caller's language. */
  readonly localizedName: string;
  /** Description of the template type in the caller's language. */
  readonly localizedDescription: string;
  /** Named sections the template content must contain (e.g. `subject`, `body`). */
  readonly parts: readonly string[];
}

/**
 * Response containing template query results
 */
export interface QueryTemplatesResult {
  readonly key: string;
  readonly languageId: number;
  readonly name: string;
  readonly description?: string;
  readonly content: string;
  /** JSON schema of the data the template is rendered with, as a JSON string. */
  readonly modelSchema: string;
  /** When the template was created (ISO-8601). */
  readonly createdAt: string;
  /** Who created the template. */
  readonly createdBy: UserReference;
  /** When the template was last changed (ISO-8601), or `null` if never. */
  readonly updatedAt: string | null;
  /** Who last changed the template, or `null` if never. */
  readonly updatedBy: UserReference | null;
}

/**
 * Response containing template by key information
 */
export interface GetTemplateByKeyResult {
  readonly key: string;
  readonly languageId: number;
  readonly name: string;
  readonly description?: string;
  readonly content: string;
  readonly jsonSchema: object;
  /** JSON schema of the data the template is rendered with, as a JSON string. */
  readonly modelSchema: string;
  /** Named sections the content must contain, each introduced by a `---<part>` line. */
  readonly parts: readonly string[];
  /** When the template was created (ISO-8601). */
  readonly createdAt: string;
  /** Who created the template. */
  readonly createdBy: UserReference;
  /** When the template was last changed (ISO-8601), or `null` if never. */
  readonly updatedAt: string | null;
  /** Who last changed the template, or `null` if never. */
  readonly updatedBy: UserReference | null;
}

/**
 * Request to update a template
 */
export interface UpdateTemplateRequest {
  readonly key: string;
  readonly languageId: number;
  readonly name?: string;
  readonly description?: string;
  readonly content?: string;
}

/**
 * Request to delete a template
 */
export interface DeleteTemplateRequest {
  readonly key: string;
  readonly languageId: number;
}
