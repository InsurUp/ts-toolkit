/**
 * @fileoverview Language Client - Language and localization operations
 * @description Provides language and localization operations for retrieving available languages
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { languages } from '../core/endpoints.js';
import type { LanguageResult } from '@insurup/contracts';

/**
 * Provides language and localization operations for retrieving available languages in the InsurUp platform.
 * Essential for multi-language support and internationalization features.
 */
export class InsurUpLanguageClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Retrieves all available languages in the system for localization and internationalization purposes.
   * Returns language information including language codes, native names, and English names.
   *
   * Yerelleştirme ve uluslararasılaştırma amaçları için sistemdeki tüm kullanılabilir dilleri getirir.
   * Dil kodları, yerel adlar ve İngilizce adlar dahil dil bilgilerini döndürür.
   *
   * @returns List of all available languages
   */
  async getLanguages(options?: RequestOptions): Promise<InsurUpResult<LanguageResult[]>> {
    return this.http.get<LanguageResult[]>(languages.getAll, options);
  }
}
