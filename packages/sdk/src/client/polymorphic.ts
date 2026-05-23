/**
 * @fileoverview Polymorphic type discriminator conversion.
 *
 * The InsurUp backend serializes polymorphic value objects using a `$type`
 * discriminator (System.Text.Json `[JsonDerivedType]` convention). For a
 * cleaner public TypeScript API the contracts expose these as `type` instead.
 * This module bridges the two on every request/response that flows through
 * the HTTP transport.
 *
 * Outbound: rename `type` -> `$type` on any object whose `type` value is a
 *   known polymorphic discriminator string.
 *
 * Inbound: rename `$type` -> `type` whenever the backend emits it.
 *
 * The list of polymorphic discriminator strings is owned by the contracts
 * package — adding a new polymorphic type never requires editing the SDK.
 */

import { POLYMORPHIC_DISCRIMINATORS as POLYMORPHIC_DISCRIMINATORS_LIST } from '@insurup/contracts';

const POLYMORPHIC_DISCRIMINATORS: ReadonlySet<string> = new Set(POLYMORPHIC_DISCRIMINATORS_LIST);

/**
 * Returns a deep-cloned copy of `value` with the public `type` discriminator
 * renamed to the wire-level `$type` on any object whose `type` value matches
 * a known polymorphic discriminator. All other fields pass through unchanged.
 */
export function encodePolymorphicTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(encodePolymorphicTypes);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const shouldRename =
    typeof source.type === 'string' &&
    POLYMORPHIC_DISCRIMINATORS.has(source.type) &&
    !('$type' in source);

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = encodePolymorphicTypes(source[key]);
    if (shouldRename && key === 'type') {
      result['$type'] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}

/**
 * Returns a deep-cloned copy of `value` with the wire-level `$type`
 * discriminator renamed to the public `type` field everywhere it appears.
 * Other fields pass through unchanged.
 */
export function decodePolymorphicTypes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(decodePolymorphicTypes);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const next = decodePolymorphicTypes(source[key]);
    if (key === '$type') {
      result['type'] = next;
    } else {
      result[key] = next;
    }
  }
  return result;
}
