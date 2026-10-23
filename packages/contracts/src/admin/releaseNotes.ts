/**
 * @fileoverview Admin Release Notes Contracts - Platform release notes
 * @description Request types of the admin panel's `release-notes/*` endpoints. A release note has one row
 * per language; reads return `GetAllReleaseNotesResultItem`, listed with `insurance.getAllReleaseNotes()`.
 */

/**
 * Body of `admin.releaseNotes.create`: one language's note for a version.
 *
 * `admin.releaseNotes.create` gövdesi: bir sürümün tek dildeki notu.
 */
export interface CreateReleaseNoteRequest {
  /** Strict semantic version, e.g. `1.4.0`. */
  readonly version: string;
  /** The note's text. */
  readonly description: string;
  /** Language of the note (1 = Turkish, 2 = English). */
  readonly languageId: number;
}

/**
 * Body of `admin.releaseNotes.update`: the new text of one language's note. The version comes from the
 * method's `version` argument, which the SDK also writes into the body.
 *
 * `admin.releaseNotes.update` gövdesi: tek dildeki notun yeni metni. Sürüm, metodun `version`
 * argümanından gelir; SDK onu gövdeye de yazar.
 */
export interface UpdateReleaseNoteRequest {
  /** The note's text. */
  readonly description: string;
  /** Language of the note to change (1 = Turkish, 2 = English). */
  readonly languageId: number;
}
