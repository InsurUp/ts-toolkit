/**
 * Stable test-only model for meta type system tests.
 * Covers all 6 field types with nullable variants.
 * Not included in the production registry.
 */

import type { DateTime, DateOnly } from '../../../src/common.date.js';

export enum TestStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
}

/** @meta */
export interface TestModel {
  id: string;
  name: string | null;
  age: number;
  isActive: boolean;
  createdAt: DateTime;
  birthDate: DateOnly | null;
  status: TestStatus;
  role: TestStatus | null;
}
