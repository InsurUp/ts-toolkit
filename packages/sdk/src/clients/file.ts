/**
 * @fileoverview File Client - File upload operations
 * @description Provides file management operations for the InsurUp platform
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { files } from '../core/endpoints.js';
import type { UploadPublicFileRequest, UploadPublicFileResult } from '@insurup/contracts';

/**
 * Provides file management operations for the InsurUp platform, enabling agents to upload and manage files
 * within the insurance ecosystem.
 */
export class InsurUpFileClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Uploads a file to public storage and returns the file URL for public access.
   * Maximum file size is 1MB. Only available for agent users.
   *
   * Bir dosyayı genel depolamaya yükler ve genel erişim için dosya URL'sini döndürür.
   * Maksimum dosya boyutu 1MB'dir. Sadece acente kullanıcıları için kullanılabilir.
   *
   * @param request Upload configuration including optional path
   * @param file File content
   * @param fileName Name of the file
   * @returns File URL and path information
   */
  async uploadPublicFile(
    request: UploadPublicFileRequest,
    file: File,
    fileName: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<UploadPublicFileResult>> {
    const formData = new FormData();
    formData.append('file', file, fileName);

    if (request.path) {
      formData.append('path', request.path);
    }

    return this.http.post<UploadPublicFileResult>(files.uploadPublicFile, formData, options);
  }
}
