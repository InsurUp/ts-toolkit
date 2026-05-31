/**
 * @fileoverview File Contracts - File upload operations
 * @description TypeScript contracts for file upload operations
 */

/**
 * Request to upload a public file
 */
export interface UploadPublicFileRequest {
  readonly path?: string;
}

/**
 * Response containing uploaded file information
 */
export interface UploadPublicFileResult {
  readonly fileUrl: string;
  readonly filePath: string;
}
