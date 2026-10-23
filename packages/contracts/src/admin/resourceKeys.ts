/**
 * @fileoverview Admin Resource Keys Contracts - Localized texts
 * @description Request types of the admin panel's `resource-keys/*` endpoints. A resource key has one row per
 * language; reads return `ResourceKey`, listed with `insurance.getResourceKeys()`.
 */

/**
 * One translation of a resource key to create. In `admin.resourceKeys.createMany` an existing
 * (key, language) pair is updated instead.
 *
 * Oluşturulacak bir kaynak anahtarı çevirisi. `admin.resourceKeys.createMany` içinde var olan bir
 * (anahtar, dil) çifti bunun yerine güncellenir.
 */
export interface CreateResourceKeyRequest {
  /** Language of the translation (1 = Turkish, 2 = English). */
  readonly languageId: number;
  /** The resource key. */
  readonly key: string;
  /** Note for translators about where the text appears. */
  readonly description?: string | null;
  /** The translated text. */
  readonly value: string;
}

/**
 * Body of `admin.resourceKeys.createMany`: translations to create or update in one call.
 *
 * `admin.resourceKeys.createMany` gövdesi: tek çağrıda oluşturulacak veya güncellenecek çeviriler.
 */
export interface CreateResourceKeysRequest {
  /** The translations; an existing (key, language) pair is updated. */
  readonly resourceKeys: readonly CreateResourceKeyRequest[];
}

/**
 * Body of `admin.resourceKeys.update`: the new text of one translation. The key comes from the method's
 * `key` argument, which the SDK also writes into the body. The description is overwritten too, so it is
 * required.
 *
 * `admin.resourceKeys.update` gövdesi: bir çevirinin yeni metni. Anahtar, metodun `key` argümanından gelir;
 * SDK onu gövdeye de yazar. Açıklamanın da üzerine yazıldığı için zorunludur.
 */
export interface UpdateResourceKeyRequest {
  /** Language of the translation to change (1 = Turkish, 2 = English). */
  readonly languageId: number;
  /** Note for translators, or `null`. */
  readonly description: string | null;
  /** The translated text. */
  readonly value: string;
}
