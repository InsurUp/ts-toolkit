/**
 * @fileoverview Admin Cache Client - The platform cache
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';

/**
 * Operations on the platform cache.
 *
 * Platform önbelleği üzerindeki işlemler.
 */
export class InsurUpAdminCacheClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Clears every cached entry, so the next reads go to the source.
   *
   * Önbellekteki tüm kayıtları temizler; sonraki okumalar kaynağa gider.
   */
  async flush(options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.cache.flush, undefined, options);
  }
}
