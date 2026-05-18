/**
 * @fileoverview Date/Time Types
 * @description Common date and time types for the InsurUp TypeScript SDK
 */

/**
 * DateTime class for handling ISO 8601 datetime strings.
 * Serializable to/from JSON as ISO 8601 string.
 *
 * @example
 * const dt = new DateTime("2024-01-15T10:30:00Z");
 * dt.toDate();      // Native Date object
 * dt.toISOString(); // "2024-01-15T10:30:00.000Z"
 * JSON.stringify(dt); // "\"2024-01-15T10:30:00.000Z\""
 *
 * // From native Date
 * const dt2 = DateTime.fromDate(new Date());
 */
export class DateTime {
  private readonly _value: Date;

  constructor(value: string | Date) {
    this._value = typeof value === 'string' ? new Date(value) : value;
  }

  /** Creates DateTime from a native Date object */
  static fromDate(date: Date): DateTime {
    return new DateTime(date);
  }

  /** Creates DateTime from current time */
  static now(): DateTime {
    return new DateTime(new Date());
  }

  /** Returns the native Date object */
  toDate(): Date {
    return this._value;
  }

  /** Returns ISO 8601 string representation */
  toISOString(): string {
    return this._value.toISOString();
  }

  /** Returns ISO 8601 string (for JSON serialization) */
  toJSON(): string {
    return this.toISOString();
  }

  /** Returns ISO 8601 string */
  toString(): string {
    return this.toISOString();
  }

  /** Returns timestamp in milliseconds */
  valueOf(): number {
    return this._value.valueOf();
  }
}

/**
 * DateOnly class for handling date-only strings (YYYY-MM-DD format).
 * Serializable to/from JSON as YYYY-MM-DD string.
 *
 * @example
 * const date = new DateOnly("2024-01-15");
 * date.toDate();   // Native Date object (at midnight UTC)
 * date.toString(); // "2024-01-15"
 * JSON.stringify(date); // "\"2024-01-15\""
 *
 * // From native Date
 * const date2 = DateOnly.fromDate(new Date());
 */
export class DateOnly {
  private readonly _year: number;
  private readonly _month: number;
  private readonly _day: number;

  constructor(value: string | Date) {
    if (typeof value === 'string') {
      const parts = value.split('-').map(Number);
      this._year = parts[0] ?? 0;
      this._month = parts[1] ?? 1;
      this._day = parts[2] ?? 1;
    } else {
      this._year = value.getUTCFullYear();
      this._month = value.getUTCMonth() + 1;
      this._day = value.getUTCDate();
    }
  }

  /** Creates DateOnly from a native Date object */
  static fromDate(date: Date): DateOnly {
    return new DateOnly(date);
  }

  /** Creates DateOnly from current date */
  static today(): DateOnly {
    return new DateOnly(new Date());
  }

  /** Returns the native Date object (at midnight UTC) */
  toDate(): Date {
    return new Date(Date.UTC(this._year, this._month - 1, this._day));
  }

  /** Returns YYYY-MM-DD string representation */
  toString(): string {
    const y = this._year.toString().padStart(4, '0');
    const m = this._month.toString().padStart(2, '0');
    const d = this._day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Returns YYYY-MM-DD string (for JSON serialization) */
  toJSON(): string {
    return this.toString();
  }

  /** Returns timestamp in milliseconds */
  valueOf(): number {
    return this.toDate().valueOf();
  }

  /** Gets the year */
  get year(): number {
    return this._year;
  }

  /** Gets the month (1-12) */
  get month(): number {
    return this._month;
  }

  /** Gets the day (1-31) */
  get day(): number {
    return this._day;
  }
}
