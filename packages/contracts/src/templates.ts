/**
 * @fileoverview Template Contracts - Template management operations
 * @description TypeScript contracts for template management operations
 */

/**
 * Response containing template definition information
 */
export interface GetTemplateDefinitionsResult {
  readonly key: string;
  readonly jsonSchema: object;
  readonly metadata: object;
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
