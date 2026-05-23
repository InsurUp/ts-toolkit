/**
 * @fileoverview Polymorphic discriminator registry.
 *
 * The InsurUp backend serializes polymorphic value objects with a `$type`
 * discriminator (`[JsonDerivedType]`). The TypeScript contracts expose these
 * as `type` for a cleaner API surface; the SDK transparently bridges the two
 * on every request and response.
 *
 * This module aggregates every polymorphic discriminator value used across
 * the contracts so the SDK has a single, contracts-owned source of truth.
 *
 * Adding a new polymorphic type:
 *   1. Define the union and a co-located `*_DISCRIMINATORS` array next to it
 *      (see `NUMERIC_QUANTITY_DISCRIMINATORS` in `common.property.ts` or
 *      `VEHICLE_ACCESSORY_DISCRIMINATORS` in `common.vehicle.ts`).
 *   2. Spread it into `POLYMORPHIC_DISCRIMINATORS` below.
 *
 * The SDK never needs to change.
 */

import { NUMERIC_QUANTITY_DISCRIMINATORS } from './common.property.js';
import { VEHICLE_ACCESSORY_DISCRIMINATORS } from './common.vehicle.js';

/**
 * Every polymorphic discriminator value the SDK should rename between the
 * public `type` and wire `$type` representations.
 */
export const POLYMORPHIC_DISCRIMINATORS: readonly string[] = [
  ...NUMERIC_QUANTITY_DISCRIMINATORS,
  ...VEHICLE_ACCESSORY_DISCRIMINATORS,
];
