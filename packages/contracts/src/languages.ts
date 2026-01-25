/**
 * @fileoverview Language Contracts - Language and localization operations
 * @description TypeScript contracts for language and localization operations
 */

/**
 * Response containing language information
 */
export interface LanguageResult {
  readonly id: number;
  readonly code: string;
  readonly nativeName: string;
  readonly englishName: string;
}
