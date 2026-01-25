/**
 * @fileoverview Common Customer Types - Customer-related value objects and types
 * @description Customer data structures and value objects used throughout the InsurUp platform
 */

// ============================================================================
// CUSTOMER VALUE OBJECTS
// ============================================================================

/**
 * Customer Email Address
 * Müşteri E-posta Adresi
 *
 * Represents a validated customer email address for insurance customer management.
 * Ensures email format validity and provides secure handling with data redaction capabilities.
 */
export interface CustomerEmail {
  /**
   * The validated email address value with automatic redaction for privacy protection
   * Gizlilik koruması için otomatik gizleme ile doğrulanmış e-posta adresi değeri
   */
  readonly value: string;
}

/**
 * Individual Customer Identity Number (Turkish National ID)
 * Bireysel Müşteri Kimlik Numarası (TC Kimlik No)
 *
 * Represents a validated Turkish individual customer identity number (TC Kimlik Numarası).
 * Implements the official Turkish Republic identity number validation algorithm for citizens.
 */
export interface IndividualCustomerIdentityNumber {
  /**
   * The validated 11-digit Turkish Republic citizen identity number
   * Doğrulanmış 11 haneli Türkiye Cumhuriyeti vatandaş kimlik numarası
   */
  readonly value: number; // ulong in C# but JavaScript numbers can handle this range
}

/**
 * Foreign Customer Identity Number (Passport or Foreign ID)
 * Yabancı Müşteri Kimlik Numarası (Pasaport veya Yabancı Kimlik)
 *
 * Represents a validated foreign customer identity number for Turkish insurance system.
 * Handles special identity numbers assigned to foreign nationals in Turkey for insurance purposes.
 */
export interface ForeignCustomerIdentityNumber {
  /**
   * The validated foreign customer identity number value
   * Doğrulanmış yabancı müşteri kimlik numarası değeri
   */
  readonly value: string;
}

/**
 * Birth Date
 * Doğum Tarihi
 *
 * Represents a validated birth date with proper date validation.
 */
export interface BirthDate {
  /**
   * The birth date value
   * Doğum tarihi değeri
   */
  readonly value: string; // DateOnly in C# serializes to string
}

/**
 * Tax Number for Companies
 * Şirketler için Vergi Numarası
 *
 * Represents a validated company tax number.
 */
export interface TaxNumber {
  /**
   * The validated tax number value
   * Doğrulanmış vergi numarası değeri
   */
  readonly value: string;
}

/**
 * Person Height in centimeters
 * Kişi boyu santimetre cinsinden
 *
 * Represents a person's height for medical assessment purposes.
 */
export interface PersonHeight {
  /**
   * The height value in centimeters
   * Santimetre cinsinden boy değeri
   */
  readonly value: number;
}

/**
 * Person Weight in kilograms
 * Kişi kilosu kilogram cinsinden
 *
 * Represents a person's weight for medical assessment purposes.
 */
export interface PersonWeight {
  /**
   * The weight value in kilograms
   * Kilogram cinsinden kilo değeri
   */
  readonly value: number;
}
