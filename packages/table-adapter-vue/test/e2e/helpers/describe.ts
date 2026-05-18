/**
 * @fileoverview Skip-aware describe wrapper for e2e tests.
 *
 * If INSURUP_E2E_CLIENT_ID / INSURUP_E2E_CLIENT_SECRET are absent, the suite
 * is skipped (visible in vitest's skipped output) rather than failing.
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
