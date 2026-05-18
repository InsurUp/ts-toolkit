/**
 * @fileoverview Skip-aware describe wrapper for e2e tests.
 */

import { describe } from 'vitest';
import { hasCreds } from './env.js';

export function describeE2E(name: string, fn: () => void): void {
  if (hasCreds()) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
}
