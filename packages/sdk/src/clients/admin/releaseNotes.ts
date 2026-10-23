/**
 * @fileoverview Admin Release Notes Client - Platform release notes
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type { CreateReleaseNoteRequest, UpdateReleaseNoteRequest } from '@insurup/contracts';

/**
 * Operations on release notes. The notes in the caller's language are listed with
 * `insurance.getAllReleaseNotes()`.
 *
 * Sürüm notları üzerindeki işlemler. Çağıranın dilindeki notlar `insurance.getAllReleaseNotes()` ile
 * listelenir.
 */
export class InsurUpAdminReleaseNotesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Adds one language's note for a version.
   *
   * Bir sürüm için tek dilde not ekler.
   */
  async create(
    request: CreateReleaseNoteRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.releaseNotes.create, request, options);
  }

  /**
   * Changes the text of one language's note for a version.
   *
   * Bir sürümün tek dildeki notunun metnini değiştirir.
   *
   * @param version Strict semantic version, e.g. `1.4.0` / Katı semantik sürüm, örn. `1.4.0`
   * @param request Language and new text / Dil ve yeni metin
   */
  async update(
    version: string,
    request: UpdateReleaseNoteRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.releaseNotes.byVersion.render(version),
      { ...request, version },
      options
    );
  }

  /**
   * Deletes a version's notes in every language.
   *
   * Bir sürümün notlarını tüm dillerde siler.
   *
   * @param version Strict semantic version, e.g. `1.4.0` / Katı semantik sürüm, örn. `1.4.0`
   */
  async delete(version: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.releaseNotes.byVersion.render(version), options);
  }
}
