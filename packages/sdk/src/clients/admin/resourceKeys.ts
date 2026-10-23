/**
 * @fileoverview Admin Resource Keys Client - Localized texts
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateResourceKeyRequest,
  CreateResourceKeysRequest,
  ResourceKey,
  UpdateResourceKeyRequest,
} from '@insurup/contracts';

/**
 * Operations on resource keys (localized texts). Every translation is listed with
 * `insurance.getResourceKeys()`.
 *
 * Kaynak anahtarları (yerelleştirilmiş metinler) üzerindeki işlemler. Tüm çeviriler
 * `insurance.getResourceKeys()` ile listelenir.
 */
export class InsurUpAdminResourceKeysClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * One translation of a resource key. When the key has several languages the API returns the first one it
   * finds; read the full list to pick a language.
   *
   * Bir kaynak anahtarının tek bir çevirisi. Anahtarın birden fazla dili varsa API bulduğu ilkini döndürür;
   * dil seçmek için tam liste okunmalıdır.
   *
   * @param key Resource key / Kaynak anahtarı
   */
  async getByKey(key: string, options?: RequestOptions): Promise<InsurUpResult<ResourceKey>> {
    return this.http.get<ResourceKey>(admin.resourceKeys.byKey.render(key), options);
  }

  /**
   * Creates one translation of a resource key.
   *
   * Bir kaynak anahtarının tek bir çevirisini oluşturur.
   */
  async create(
    request: CreateResourceKeyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.resourceKeys.create, request, options);
  }

  /**
   * Creates many translations in one call; an existing (key, language) pair is updated instead.
   *
   * Tek çağrıda birden fazla çeviri oluşturur; var olan bir (anahtar, dil) çifti güncellenir.
   */
  async createMany(
    request: CreateResourceKeysRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.resourceKeys.createMany, request, options);
  }

  /**
   * Changes the text and description of one translation of a resource key.
   *
   * Bir kaynak anahtarının tek bir çevirisinin metnini ve açıklamasını değiştirir.
   *
   * @param key Resource key / Kaynak anahtarı
   * @param request Language, description and text / Dil, açıklama ve metin
   */
  async update(
    key: string,
    request: UpdateResourceKeyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.resourceKeys.byKey.render(key),
      { ...request, key },
      options
    );
  }

  /**
   * Deletes a resource key in every language.
   *
   * Bir kaynak anahtarını tüm dillerde siler.
   *
   * @param key Resource key / Kaynak anahtarı
   */
  async delete(key: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.resourceKeys.byKey.render(key), options);
  }
}
